package com.loahub.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.MarketItemResponse;
import java.io.IOException;
import java.net.URI;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class MarketService {
    private static final String BASE_URL = "https://developer-lostark.game.onstove.com";
    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 20000;
    private static final int MAX_RESULTS = 10;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public MarketService(@Value("${lostark.api.key:}") String apiKey) {
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey == null ? "" : apiKey.trim();

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        requestFactory.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public ApiResponse<List<MarketItemResponse>> search(String keyword) {
        String normalized = keyword == null ? "" : keyword.trim();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("검색어를 입력해 주세요.");
        }

        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "로스트아크 API 키가 설정되지 않았습니다.");
        }

        try {
            JsonNode options = requestJson("/markets/options", HttpMethod.GET, null, Map.of());
            JsonNode searchRoot = requestMarketItems(normalized);
            List<MarketItemResponse> results = resolveItems(normalized, options, searchRoot);
            return ApiResponse.ok(results);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().value() == 404) {
                return ApiResponse.ok(List.of());
            }
            throw exception;
        } catch (HttpStatusCodeException exception) {
            throw mapExternalError(exception);
        } catch (ResourceAccessException exception) {
            throw mapTimeout(exception);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        }
    }

    private JsonNode requestMarketItems(String keyword) {
        List<Map<String, Object>> candidates = List.of(
            Map.of("keyword", keyword),
            Map.of("itemName", keyword),
            Map.of("ItemName", keyword)
        );

        for (Map<String, Object> params : candidates) {
            try {
                JsonNode response = requestJson("/markets/items", HttpMethod.GET, null, params);
                if (hasAnyItems(response)) {
                    return response;
                }
            } catch (HttpStatusCodeException ignored) {
                // try next strategy
            }
        }

        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("Keyword", keyword);
        body.put("keyword", keyword);
        body.put("ItemName", keyword);
        body.put("PageNo", 1);
        body.put("Sort", "GRADE");
        body.put("SortCondition", "ASC");

        try {
            return requestJson("/markets/items", HttpMethod.POST, body, Map.of());
        } catch (HttpStatusCodeException exception) {
            if (exception.getStatusCode().value() == 404) {
                return objectMapper.createArrayNode();
            }
            throw exception;
        }
    }

    private List<MarketItemResponse> resolveItems(String keyword, JsonNode options, JsonNode searchRoot) {
        List<JsonNode> nodes = new ArrayList<>();
        nodes.addAll(extractNodes(searchRoot));

        if (nodes.isEmpty()) {
            nodes.addAll(extractMatchingOptionNodes(options, keyword));
        }

        LinkedHashSet<String> seen = new LinkedHashSet<>();
        List<MarketItemResponse> results = new ArrayList<>();

        for (JsonNode node : nodes) {
            Optional<String> itemId = extractString(node, "ItemId", "itemId", "Id", "id");
            MarketItemResponse response = toResponse(node);

            if (itemId.isPresent() && response.itemName().isBlank()) {
                try {
                    JsonNode detail = requestJson("/markets/items/" + itemId.get(), HttpMethod.GET, null, Map.of());
                    response = merge(response, detail);
                } catch (HttpStatusCodeException exception) {
                    if (exception.getStatusCode().value() == 404) {
                        continue;
                    }
                    throw exception;
                }
            }

            if (response.itemName().isBlank() && response.itemId().isBlank()) {
                continue;
            }

            String dedupeKey = response.itemId() + ":" + response.itemName();
            if (seen.add(dedupeKey)) {
                results.add(response);
            }

            if (results.size() >= MAX_RESULTS) {
                break;
            }
        }

        return results;
    }

    private List<JsonNode> extractNodes(JsonNode root) {
        if (root == null || root.isMissingNode() || root.isNull()) {
            return List.of();
        }

        if (root.isArray()) {
            return streamNodes(root);
        }

        for (String key : List.of("Items", "AuctionItems", "items", "auctionItems", "data", "Data")) {
            JsonNode nested = root.path(key);
            if (nested.isArray()) {
                return streamNodes(nested);
            }
        }

        if (root.isObject()) {
            return List.of(root);
        }

        return List.of();
    }

    private List<JsonNode> extractMatchingOptionNodes(JsonNode root, String keyword) {
        if (root == null || root.isMissingNode() || root.isNull()) {
            return List.of();
        }

        String normalized = normalize(keyword);
        List<JsonNode> nodes = extractNodes(root);
        return nodes.stream()
            .filter(node -> normalize(text(node, "Name")).contains(normalized)
                || normalize(text(node, "ItemName")).contains(normalized)
                || normalize(text(node, "OptionName")).contains(normalized))
            .collect(Collectors.toList());
    }

    private MarketItemResponse toResponse(JsonNode node) {
        return new MarketItemResponse(
            text(node, "ItemId", "itemId", "Id", "id"),
            text(node, "ItemName", "itemName", "Name", "name"),
            text(node, "Grade", "grade"),
            text(node, "Icon", "icon"),
            number(node, "CurrentMinPrice", "currentMinPrice"),
            number(node, "RecentPrice", "recentPrice"),
            number(node, "YDayAvgPrice", "yDayAvgPrice"),
            integer(node, "BundleCount", "bundleCount"),
            integer(node, "TradeRemainCount", "tradeRemainCount")
        );
    }

    private MarketItemResponse merge(MarketItemResponse base, JsonNode detail) {
        MarketItemResponse merged = toResponse(detail);
        return new MarketItemResponse(
            firstNonBlank(base.itemId(), merged.itemId()),
            firstNonBlank(base.itemName(), merged.itemName()),
            firstNonBlank(base.grade(), merged.grade()),
            firstNonBlank(base.icon(), merged.icon()),
            firstNumber(base.currentMinPrice(), merged.currentMinPrice()),
            firstNumber(base.recentPrice(), merged.recentPrice()),
            firstNumber(base.yDayAvgPrice(), merged.yDayAvgPrice()),
            firstInteger(base.bundleCount(), merged.bundleCount()),
            firstInteger(base.tradeRemainCount(), merged.tradeRemainCount())
        );
    }

    private JsonNode requestJson(String path, HttpMethod method, Object body, Map<String, Object> params) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("authorization", buildBearerToken(apiKey));
        if (method == HttpMethod.POST) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(BASE_URL + path)
            .queryParams(convertParams(params))
            .build()
            .encode()
            .toUri();

        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(uri, method, entity, String.class);
        return parseJson(response.getBody());
    }

    private org.springframework.util.MultiValueMap<String, String> convertParams(Map<String, Object> params) {
        org.springframework.util.LinkedMultiValueMap<String, String> values = new org.springframework.util.LinkedMultiValueMap<>();
        params.forEach((key, value) -> {
            if (value != null) {
                values.add(key, String.valueOf(value));
            }
        });
        return values;
    }

    private JsonNode parseJson(String body) {
        if (body == null || body.isBlank()) {
            return objectMapper.createObjectNode();
        }

        try {
            return objectMapper.readTree(body);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        }
    }

    private ResponseStatusException mapExternalError(HttpStatusCodeException exception) {
        HttpStatus status = HttpStatus.resolve(exception.getStatusCode().value());
        if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 인증에 실패했습니다.");
        }
        if (status == HttpStatus.NOT_FOUND) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "검색 결과를 찾을 수 없습니다.");
        }
        if (status == HttpStatus.TOO_MANY_REQUESTS) {
            return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "로스트아크 API 요청 한도를 초과했습니다.");
        }
        if (status == HttpStatus.GATEWAY_TIMEOUT) {
            return new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "로스트아크 API 응답 시간이 초과되었습니다.");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
    }

    private ResponseStatusException mapTimeout(ResourceAccessException exception) {
        if (isTimeout(exception)) {
            return new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "로스트아크 API 응답 시간이 초과되었습니다.");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
    }

    private boolean isTimeout(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof SocketTimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        String message = throwable.getMessage();
        return message != null && message.toLowerCase(Locale.ROOT).contains("timed out");
    }

    private String buildBearerToken(String value) {
        String token = value == null ? "" : value.trim();
        if (token.regionMatches(true, 0, "bearer ", 0, 7)) {
            token = token.substring(7).trim();
        }
        return "bearer " + token;
    }

    private boolean hasAnyItems(JsonNode root) {
        return !extractNodes(root).isEmpty();
    }

    private List<JsonNode> streamNodes(JsonNode arrayNode) {
        List<JsonNode> nodes = new ArrayList<>();
        arrayNode.forEach(nodes::add);
        return nodes;
    }

    private String text(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (!value.isMissingNode() && !value.isNull()) {
                if (value.isTextual()) {
                    return value.asText();
                }
                return value.asText(value.toString());
            }
        }
        return "";
    }

    private Optional<String> extractString(JsonNode node, String... fieldNames) {
        String value = text(node, fieldNames);
        return value == null || value.isBlank() ? Optional.empty() : Optional.of(value);
    }

    private Long number(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (!value.isMissingNode() && !value.isNull()) {
                if (value.isNumber()) {
                    return value.asLong();
                }
                try {
                    String text = value.asText().replace(",", "").trim();
                    if (!text.isBlank()) {
                        return Long.parseLong(text);
                    }
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private Integer integer(JsonNode node, String... fieldNames) {
        Long value = number(node, fieldNames);
        return value == null ? null : value.intValue();
    }

    private String firstNonBlank(String left, String right) {
        if (left != null && !left.isBlank()) {
            return left;
        }
        return right == null ? "" : right;
    }

    private Long firstNumber(Long left, Long right) {
        return left != null ? left : right;
    }

    private Integer firstInteger(Integer left, Integer right) {
        return left != null ? left : right;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.KOREA);
    }
}
