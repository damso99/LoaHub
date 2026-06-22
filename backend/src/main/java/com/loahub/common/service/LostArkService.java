package com.loahub.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.LostArkCharacterResponse;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

@Service
public class LostArkService {
    private static final String BASE_URL = "https://developer-lostark.game.onstove.com";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public LostArkService(@Value("${lostark.api.key:}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    public LostArkCharacterResponse searchCharacter(String characterName) {
        String normalizedName = characterName == null ? "" : characterName.trim();
        if (normalizedName.isBlank()) {
            throw new IllegalArgumentException("캐릭터명이 비어 있습니다.");
        }

        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "로스트아크 API 키가 설정되지 않았습니다.");
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
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        }
    }

    public LostArkCharacterResponse searchCharacters(String characterName) {
        return searchCharacter(characterName);
    }

    private ResponseStatusException mapExternalStatus(HttpStatusCodeException exception) {
        HttpStatus status = HttpStatus.resolve(exception.getStatusCode().value());
        if (status == HttpStatus.NOT_FOUND) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다.");
        }
        if (status == HttpStatus.TOO_MANY_REQUESTS) {
            return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "로스트아크 API 요청 한도를 초과했습니다.");
        }
        if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
            return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 인증에 실패했습니다.");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
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
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다.");
        }

        try {
            return objectMapper.readTree(body);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        }
    }

    private LostArkCharacterResponse toResponse(JsonNode source) {
        if (source == null || source.isNull() || source.isMissingNode()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다.");
        }

        JsonNode profile = source.path("ArmoryProfile");
        JsonNode readable = profile.isObject() && !profile.isMissingNode() ? profile : source;
        if (readable.isObject()) {
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

        JsonNode top = source;
        return new LostArkCharacterResponse(
            text(top, "CharacterName"),
            text(top, "ServerName"),
            text(top, "CharacterClassName"),
            text(top, "ItemAvgLevel"),
            text(top, "CharacterLevel"),
            text(top, "ExpeditionLevel"),
            text(top, "PvpGradeName"),
            text(top, "TownLevel"),
            text(top, "TownName"),
            text(top, "Title"),
            text(top, "GuildName"),
            text(top, "CharacterImage")
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
        return value.toString();
    }
}
