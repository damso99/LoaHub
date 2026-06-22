package com.loahub.common.service;

import com.loahub.common.dto.LostArkCharacterResponse;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

@Service
public class LostArkService {
    private static final String BASE_URL = "https://developer-lostark.game.onstove.com";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public LostArkService(@Value("${lostark.api.key:}") String apiKey) {
        this.restTemplate = new RestTemplate();
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
            headers.set("authorization", "bearer " + apiKey);

            String encodedName = UriUtils.encodePathSegment(normalizedName, StandardCharsets.UTF_8);
            URI uri = URI.create(BASE_URL + "/armories/characters/" + encodedName + "/profiles");
            ResponseEntity<Map> response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            Map<String, Object> body = response.getBody();
            if (body == null || body.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다.");
            }

            return toResponse(body);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다.");
        } catch (HttpClientErrorException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 API 호출에 실패했습니다.");
        }
    }

    public LostArkCharacterResponse searchCharacters(String characterName) {
        return searchCharacter(characterName);
    }

    private LostArkCharacterResponse toResponse(Map<String, Object> source) {
        return new LostArkCharacterResponse(
            stringValue(source, "CharacterName"),
            stringValue(source, "ServerName"),
            stringValue(source, "CharacterClassName"),
            stringValue(source, "ItemAvgLevel"),
            stringValue(source, "CharacterLevel"),
            stringValue(source, "ExpeditionLevel"),
            stringValue(source, "PvpGradeName"),
            stringValue(source, "TownLevel"),
            stringValue(source, "TownName"),
            stringValue(source, "Title"),
            stringValue(source, "GuildName"),
            stringValue(source, "CharacterImage")
        );
    }

    private String stringValue(Map<String, Object> source, String key) {
        Object value = source.get(key);
        return value == null ? "" : String.valueOf(value);
    }
}
