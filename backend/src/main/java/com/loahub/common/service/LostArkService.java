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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
        if (apiKey.isBlank()) {
            return toSearchCards(dao.searchCharacters(name));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("authorization", apiKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            String encodedName = URLEncoder.encode(name == null ? "" : name.trim(), StandardCharsets.UTF_8);
            ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/armories/characters/" + encodedName,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
            );

            if (response.getBody() == null) {
                return toSearchCards(dao.searchCharacters(name));
            }

            return List.of(toSearchCard(response.getBody()));
        } catch (Exception exception) {
            return toSearchCards(dao.searchCharacters(name));
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
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("characterName", stringValue(source, "CharacterName", "characterName", "name"));
        card.put("serverName", stringValue(source, "ServerName", "serverName"));
        card.put("characterClass", stringValue(source, "CharacterClassName", "characterClass", "className"));
        card.put("itemLevel", doubleValue(source, "ItemAvgLevel", "itemLevel"));
        card.put("characterImage", stringValue(source, "CharacterImage", "characterImage"));
        card.put("rosterLevel", doubleValue(source, "CharacterLevel", "rosterLevel"));
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
