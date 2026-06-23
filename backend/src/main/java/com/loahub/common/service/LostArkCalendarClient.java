package com.loahub.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.LostArkCalendarResponseItem;
import com.loahub.common.dto.RewardGroup;
import com.loahub.common.dto.RewardItem;
import java.io.IOException;
import java.net.URI;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

@Service
public class LostArkCalendarClient {
    private static final String BASE_URL = "https://developer-lostark.game.onstove.com";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public LostArkCalendarClient(
        @Value("${lostark.api.key:}") String apiKey,
        @Value("${loahub.lostark.connect-timeout-ms:15000}") int connectTimeoutMs,
        @Value("${loahub.lostark.read-timeout-ms:60000}") int readTimeoutMs
    ) {
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey == null ? "" : apiKey.trim();

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeoutMs);
        requestFactory.setReadTimeout(readTimeoutMs);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public List<LostArkCalendarResponseItem> fetchWeeklyCalendar() {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "로스트아크 API 키가 설정되지 않았습니다.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.set("authorization", buildBearerToken(apiKey));

            URI uri = URI.create(BASE_URL + "/gamecontents/calendar");
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode root = parseJson(response.getBody());
            return extractItems(root);
        } catch (HttpStatusCodeException exception) {
            throw mapExternalStatus(exception);
        } catch (ResourceAccessException exception) {
            throw mapTimeout(exception);
        }
    }

    private List<LostArkCalendarResponseItem> extractItems(JsonNode root) {
        List<JsonNode> nodes = new ArrayList<>();
        if (root == null || root.isNull() || root.isMissingNode()) {
            return List.of();
        }

        if (root.isArray()) {
            root.forEach(nodes::add);
        } else if (root.isObject()) {
            for (String field : List.of("Items", "items", "Data", "data", "CalendarItems", "calendarItems")) {
                JsonNode candidate = root.path(field);
                if (candidate.isArray()) {
                    candidate.forEach(nodes::add);
                    break;
                }
            }
            if (nodes.isEmpty()) {
                nodes.add(root);
            }
        }

        List<LostArkCalendarResponseItem> results = new ArrayList<>();
        for (JsonNode node : nodes) {
            results.add(new LostArkCalendarResponseItem(
                text(node, "CategoryName", "categoryName"),
                text(node, "ContentsName", "contentsName"),
                text(node, "ContentsIcon", "contentsIcon"),
                integer(node, "MinItemLevel", "minItemLevel"),
                stringList(node, "StartTimes", "startTimes"),
                text(node, "Location", "location"),
                parseRewardGroups(node)
            ));
        }
        return results;
    }

    private List<RewardGroup> parseRewardGroups(JsonNode node) {
        List<RewardGroup> groups = new ArrayList<>();

        JsonNode groupArray = firstArray(node, "RewardGroups", "rewardGroups");
        if (groupArray != null) {
            for (JsonNode groupNode : groupArray) {
                groups.add(new RewardGroup(
                    text(groupNode, "Name", "name", "GroupName", "groupName"),
                    parseRewardItems(groupNode)
                ));
            }
            return groups;
        }

        JsonNode rewardArray = firstArray(node, "RewardItems", "rewardItems");
        if (rewardArray != null) {
            groups.add(new RewardGroup(
                text(node, "ContentsName", "contentsName", "Name", "name"),
                parseRewardItems(rewardArray)
            ));
        }

        return groups;
    }

    private List<RewardItem> parseRewardItems(JsonNode source) {
        List<RewardItem> items = new ArrayList<>();
        JsonNode rewardArray = source.isArray() ? source : firstArray(source, "RewardItems", "rewardItems", "Items", "items");
        if (rewardArray != null) {
            for (JsonNode itemNode : rewardArray) {
                items.add(parseRewardItem(itemNode));
            }
            return items;
        }

        if (source.isObject()) {
            items.add(parseRewardItem(source));
        }
        return items;
    }

    private RewardItem parseRewardItem(JsonNode node) {
        return new RewardItem(
            text(node, "Name", "name"),
            text(node, "Icon", "icon"),
            text(node, "Grade", "grade"),
            stringList(node, "StartTimes", "startTimes")
        );
    }

    private JsonNode parseJson(String body) {
        if (body == null || body.isBlank()) {
            return objectMapper.createArrayNode();
        }

        try {
            return objectMapper.readTree(body);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        }
    }

    private ResponseStatusException mapExternalStatus(HttpStatusCodeException exception) {
        HttpStatus status = HttpStatus.resolve(exception.getStatusCode().value());
        if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 인증에 실패했습니다.");
        }
        if (status == HttpStatus.NOT_FOUND) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "로스트아크 캘린더 데이터를 찾을 수 없습니다.");
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

    private JsonNode firstArray(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (value.isArray()) {
                return value;
            }
        }
        return null;
    }

    private List<String> stringList(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (value.isArray()) {
                List<String> result = new ArrayList<>();
                value.forEach(item -> {
                    if (!item.isNull() && !item.isMissingNode()) {
                        result.add(item.asText());
                    }
                });
                return result;
            }
            if (!value.isMissingNode() && !value.isNull() && value.isTextual()) {
                return List.of(value.asText());
            }
        }
        return null;
    }

    private String text(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (!value.isMissingNode() && !value.isNull()) {
                return value.asText();
            }
        }
        return "";
    }

    private Integer integer(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            JsonNode value = node.path(fieldName);
            if (!value.isMissingNode() && !value.isNull()) {
                if (value.isNumber()) {
                    return value.asInt();
                }
                try {
                    String text = value.asText().replace(",", "").trim();
                    if (!text.isBlank()) {
                        return Integer.parseInt(text);
                    }
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }
}
