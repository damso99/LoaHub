package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.model.DomainModels.Character;
import com.loahub.common.util.EnvUtils;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    private final CommonDao dao;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey = EnvUtils.get("LOSTARK_API_KEY", "");
    private final String baseUrl = EnvUtils.get("LOSTARK_API_BASE_URL", "https://developer-lostark.game.onstove.com");

    public LostArkService(CommonDao dao) {
        this.dao = dao;
    }

    public List<Map<String, Object>> searchCharacters(String name) {
        String normalizedName = name == null ? "" : name.trim();
        if (normalizedName.isBlank()) {
            throw new IllegalArgumentException("캐릭터명이 비어 있습니다.");
        }

        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "로스트아크 API 키가 설정되지 않았습니다.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("accept", MediaType.APPLICATION_JSON_VALUE);
            headers.setBearerAuth(apiKey);

            String encodedName = UriUtils.encodePathSegment(normalizedName, StandardCharsets.UTF_8);
            ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/armories/characters/" + encodedName + "/profiles",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
            );

            if (response.getBody() == null || response.getBody().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다.");
            }

            return List.of(toSearchCard(response.getBody()));
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

    private List<Map<String, Object>> toSearchCards(List<Character> characters) {
        List<Map<String, Object>> cards = new ArrayList<>();
        for (Character character : characters) {
            Map<String, Object> source = new LinkedHashMap<>();
            source.put("CharacterName", character.characterName());
            source.put("ServerName", character.serverName());
            source.put("CharacterClassName", character.characterClass());
            source.put("ItemAvgLevel", character.itemLevel());
            source.put("CharacterImage", character.characterImage() == null ? "" : character.characterImage());
            cards.add(toSearchCard(source));
        }
        return cards;
    }

    private Map<String, Object> toSearchCard(Map<String, Object> source) {
        String characterClassName = stringValue(source, "CharacterClassName", "characterClass", "className");
        double itemAvgLevel = doubleValue(source, "ItemAvgLevel", "itemLevel");
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("characterName", stringValue(source, "CharacterName", "characterName", "name"));
        card.put("serverName", stringValue(source, "ServerName", "serverName"));
        card.put("characterClassName", characterClassName);
        card.put("itemAvgLevel", itemAvgLevel);
        card.put("characterImage", stringValue(source, "CharacterImage", "characterImage"));
        card.put("characterClass", characterClassName);
        card.put("itemLevel", itemAvgLevel);
        card.put("isMain", false);
        return card;
    }

    private String stringValue(Map<String, Object> source, String... keys) {
        for (String key : keys) {
            Object value = source.get(key);
            if (value != null) {
                return String.valueOf(value);
            }
        }
        return "";
    }

    private double doubleValue(Map<String, Object> source, String... keys) {
        for (String key : keys) {
            Object value = source.get(key);
            if (value instanceof Number number) {
                return number.doubleValue();
            }
            if (value != null) {
                try {
                    return Double.parseDouble(String.valueOf(value));
                } catch (NumberFormatException ignored) {
                    // 기본값 유지
                }
            }
        }
        return 0;
    }
}
