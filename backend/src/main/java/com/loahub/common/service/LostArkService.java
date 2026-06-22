package com.loahub.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.LostArkCharacterResponse;
import java.io.IOException;
import java.net.URI;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
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
import org.springframework.web.util.UriUtils;

@Service
public class LostArkService {
    private static final String BASE_URL = "https://developer-lostark.game.onstove.com";
    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 15000;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public LostArkService(@Value("${lostark.api.key:}") String apiKey) {
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey == null ? "" : apiKey.trim();

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        requestFactory.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public LostArkCharacterResponse searchCharacter(String characterName) {
        String normalizedName = characterName == null ? "" : characterName.trim();
        if (normalizedName.isBlank()) {
            throw new IllegalArgumentException("Character name is empty.");
        }

        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lost Ark API key is not configured.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
            headers.set("authorization", buildBearerToken(apiKey));

            String encodedName = UriUtils.encodePathSegment(normalizedName, StandardCharsets.UTF_8);
            URI uri = URI.create(BASE_URL + "/armories/characters/" + encodedName + "/profiles");
            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return toResponse(parseJson(response.getBody()));
        } catch (HttpStatusCodeException exception) {
            throw mapExternalStatus(exception);
        } catch (ResourceAccessException exception) {
            throw mapTimeoutOrExternalError(exception);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lost Ark API call failed.");
        }
    }

    public LostArkCharacterResponse searchCharacters(String characterName) {
        return searchCharacter(characterName);
    }

    private ResponseStatusException mapExternalStatus(HttpStatusCodeException exception) {
        HttpStatus status = HttpStatus.resolve(exception.getStatusCode().value());
        if (status == HttpStatus.NOT_FOUND) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found.");
        }
        if (status == HttpStatus.TOO_MANY_REQUESTS) {
            return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Lost Ark API rate limit exceeded.");
        }
        if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lost Ark API authentication failed.");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lost Ark API call failed.");
    }

    private ResponseStatusException mapTimeoutOrExternalError(ResourceAccessException exception) {
        if (isTimeout(exception)) {
            return new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Lost Ark API response timed out.");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lost Ark API call failed.");
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
        return message != null && message.toLowerCase().contains("timed out");
    }

    private String buildBearerToken(String value) {
        String token = value == null ? "" : value.trim();
        if (token.regionMatches(true, 0, "bearer ", 0, 7)) {
            token = token.substring(7).trim();
        }
        return "bearer " + token;
    }

    private JsonNode parseJson(String body) {
        if (body == null || body.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found.");
        }

        try {
            return objectMapper.readTree(body);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lost Ark API call failed.");
        }
    }

    private LostArkCharacterResponse toResponse(JsonNode source) {
        if (source == null || source.isNull() || source.isMissingNode()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found.");
        }

        JsonNode readable = source.path("ArmoryProfile");
        if (!readable.isObject() || readable.isMissingNode() || readable.isNull()) {
            readable = source;
        }

        if (!readable.isObject()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found.");
        }

        return new LostArkCharacterResponse(
            text(readable, "CharacterName"),
            text(readable, "ServerName"),
            text(readable, "CharacterClassName"),
            text(readable, "ItemAvgLevel"),
            text(readable, "CharacterLevel"),
            text(readable, "ExpeditionLevel"),
            text(readable, "PvpGradeName"),
            text(readable, "TownLevel"),
            text(readable, "TownName"),
            text(readable, "Title"),
            text(readable, "GuildName"),
            text(readable, "CharacterImage")
        );
    }

    private String text(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        if (value.isMissingNode() || value.isNull()) {
            return "";
        }
        if (value.isTextual()) {
            return value.asText();
        }
        return value.asText(value.toString());
    }
}
