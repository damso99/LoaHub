package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.LoginRequest;
import com.loahub.common.dto.Requests.RegisterRequest;
import com.loahub.common.security.SecurityUtils;
import com.loahub.common.util.JwtTokenUtil;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CommonAuthService {
    private final CommonDao dao;
    private final JwtTokenUtil jwtTokenUtil;

    public CommonAuthService(CommonDao dao, JwtTokenUtil jwtTokenUtil) {
        this.dao = dao;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public ApiResponse<Map<String, Object>> register(RegisterRequest request) {
        dao.findUserByEmail(request.email()).ifPresent(user -> {
            throw new IllegalArgumentException("?대? 媛?낅맂 ?대찓?쇱엯?덈떎.");
        });
        var user = dao.createUser(request);
        var token = jwtTokenUtil.createToken(String.valueOf(user.id()));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", token);
        payload.put("user", toSafeUser(user));
        payload.put("profile", dao.findProfileByUserId(user.id()));
        return ApiResponse.ok("?뚯썝媛?낆씠 ?꾨즺?섏뿀?듬땲??", payload);
    }

    public ApiResponse<Map<String, Object>> login(LoginRequest request) {
        var user = dao.findUserByEmail(request.email()).orElseThrow();
        if (!user.password().equals(request.password()) && !("{noop}" + request.password()).equals(user.password())) {
            throw new IllegalArgumentException("鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.");
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", jwtTokenUtil.createToken(String.valueOf(user.id())));
        payload.put("user", toSafeUser(user));
        payload.put("profile", dao.findProfileByUserId(user.id()));
        return ApiResponse.ok("濡쒓렇?몄뿉 ?깃났?덉뒿?덈떎.", payload);
    }

    public ApiResponse<Map<String, Object>> me() {
        long userId = SecurityUtils.requireCurrentUserId();
        var user = dao.findUserById(userId).orElseThrow();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", toSafeUser(user));
        payload.put("profile", dao.findProfileByUserId(user.id()));
        return ApiResponse.ok(payload);
    }

    private Map<String, Object> toSafeUser(com.loahub.common.model.DomainModels.User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.id());
        payload.put("email", user.email());
        payload.put("nickname", user.nickname());
        payload.put("provider", user.provider());
        payload.put("role", user.role());
        payload.put("createdAt", user.createdAt());
        payload.put("updatedAt", user.updatedAt());
        return payload;
    }
}
