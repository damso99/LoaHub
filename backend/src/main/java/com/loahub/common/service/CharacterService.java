package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CharacterSaveRequest;
import com.loahub.common.security.SecurityUtils;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CharacterService {
    private final CommonDao dao;
    private final LostArkService lostArkService;

    public CharacterService(CommonDao dao, LostArkService lostArkService) {
        this.dao = dao;
        this.lostArkService = lostArkService;
    }

    public ApiResponse<Object> search(String name) {
        return ApiResponse.ok(lostArkService.searchCharacters(name));
    }

    public ApiResponse<Object> getMyCharacters() {
        long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.ok(dao.findCharactersByUserId(userId));
    }

    public ApiResponse<Map<String, Object>> save(CharacterSaveRequest request) {
        long userId = SecurityUtils.requireCurrentUserId();
        var character = dao.createCharacter(userId, request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("character", character);
        payload.put("characters", dao.findCharactersByUserId(userId));
        return ApiResponse.ok("캐릭터가 등록되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> delete(long id) {
        var character = dao.findCharacterById(id).orElseThrow();
        SecurityUtils.requireOwnerOrAdmin(character.userId());

        boolean deleted = dao.deleteCharacter(id);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deleted", deleted);
        return ApiResponse.ok("캐릭터가 삭제되었습니다.", payload);
    }
}
