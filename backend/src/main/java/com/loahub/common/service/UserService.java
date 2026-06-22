package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.MainCharacterRequest;
import com.loahub.common.dto.Requests.UpdateProfileRequest;
import com.loahub.common.security.SecurityUtils;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final CommonDao dao;

    public UserService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Map<String, Object>> getMe() {
        long userId = SecurityUtils.requireCurrentUserId();
        var user = dao.findUserById(userId).orElseThrow();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", user);
        payload.put("profile", dao.findProfileByUserId(user.id()));
        payload.put("characters", dao.findCharactersByUserId(user.id()));
        return ApiResponse.ok(payload);
    }

    public ApiResponse<Map<String, Object>> updateMe(UpdateProfileRequest request) {
        long userId = SecurityUtils.requireCurrentUserId();
        dao.updateUserNickname(userId, request);
        var profile = dao.updateProfile(userId, request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", dao.findUserById(userId).orElseThrow());
        payload.put("profile", profile);
        return ApiResponse.ok("프로필이 수정되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> setMainCharacter(MainCharacterRequest request) {
        long userId = SecurityUtils.requireCurrentUserId();
        var profile = dao.updateMainCharacter(userId, request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("profile", profile);
        payload.put("characters", dao.findCharactersByUserId(userId));
        return ApiResponse.ok("대표 캐릭터가 설정되었습니다.", payload);
    }
}
