package com.loahub.auth;

import com.loahub.auth.dao.AuthDao;
import com.loahub.auth.dto.RegisterRequest;
import com.loahub.auth.dto.RegisterResponse;
import com.loahub.auth.dto.SignupRequest;
import com.loahub.auth.exception.RegistrationException;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.LoginRequest;
import com.loahub.common.security.SecurityUtils;
import com.loahub.common.util.JwtTokenUtil;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AuthDao authDao;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(AuthDao authDao, BCryptPasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.authDao = authDao;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        String email = normalizeEmail(request.email());
        String nickname = normalizeNickname(request.nickname());

        if (authDao.countByEmail(email) > 0) {
            throw new RegistrationException("이미 사용 중인 이메일입니다.");
        }
        if (authDao.countByNickname(nickname) > 0) {
            throw new RegistrationException("이미 사용 중인 닉네임입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        var user = authDao.insertUser(request, encodedPassword);
        authDao.insertUserProfile(user.getUserId(), request);

        return new RegisterResponse(
            user.getUserId(),
            user.getEmail(),
            user.getNickname(),
            request.mainCharacterName(),
            "회원가입이 완료되었습니다."
        );
    }

    @Transactional
    public ApiResponse<Map<String, Object>> signup(SignupRequest request) {
        validateSignupRequest(request.email(), request.password(), request.passwordConfirm(), request.nickname());

        String email = normalizeEmail(request.email());
        String nickname = normalizeNickname(request.nickname());

        if (authDao.countByEmail(email) > 0) {
            throw new RegistrationException("이미 사용 중인 이메일입니다.");
        }
        if (authDao.countByNickname(nickname) > 0) {
            throw new RegistrationException("이미 사용 중인 닉네임입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        var user = authDao.insertUser(email, nickname, encodedPassword);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userId", user.getUserId());
        payload.put("email", user.getEmail());
        payload.put("nickname", user.getNickname());
        payload.put("role", user.getRole());
        payload.put("provider", user.getProvider());
        return ApiResponse.ok("회원가입이 완료되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> checkEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) {
            throw new RegistrationException("이메일을 입력해주세요.");
        }
        if (!isValidEmail(normalizedEmail)) {
            throw new RegistrationException("이메일 형식이 올바르지 않습니다.");
        }

        boolean available = authDao.countByEmail(normalizedEmail) == 0;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("available", available);
        return ApiResponse.ok(available ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.", payload);
    }

    public ApiResponse<Map<String, Object>> checkNickname(String nickname) {
        String normalizedNickname = normalizeNickname(nickname);
        if (normalizedNickname.isBlank()) {
            throw new RegistrationException("닉네임을 입력해주세요.");
        }
        if (normalizedNickname.length() < 2 || normalizedNickname.length() > 12) {
            throw new RegistrationException("닉네임은 2자 이상 12자 이하여야 합니다.");
        }

        boolean available = authDao.countByNickname(normalizedNickname) == 0;
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("available", available);
        return ApiResponse.ok(available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.", payload);
    }

    public ApiResponse<Map<String, Object>> login(LoginRequest request) {
        var user = authDao.findUserByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new IllegalArgumentException("등록된 이메일이 없습니다."));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", jwtTokenUtil.createToken(String.valueOf(user.getUserId())));
        payload.put("user", createSafeUserPayload(user));
        payload.put("profile", authDao.findProfileByUserId(user.getUserId()).orElse(null));
        return ApiResponse.ok("로그인에 성공했습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> me() {
        var currentUser = SecurityUtils.requireCurrentUser();
        var user = authDao.findUserById(currentUser.userId()).orElseThrow();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("user", createSafeUserPayload(user));
        payload.put("profile", authDao.findProfileByUserId(user.getUserId()).orElse(null));
        return ApiResponse.ok(payload);
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request.password() == null || request.passwordConfirm() == null || !request.password().equals(request.passwordConfirm())) {
            throw new RegistrationException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        if (request.mainCharacterName() == null || request.mainCharacterName().isBlank()) {
            throw new RegistrationException("대표 캐릭터명을 입력해주세요.");
        }
    }

    private void validateSignupRequest(String email, String password, String passwordConfirm, String nickname) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedNickname = normalizeNickname(nickname);

        if (normalizedEmail.isBlank()) {
            throw new RegistrationException("이메일을 입력해주세요.");
        }
        if (!isValidEmail(normalizedEmail)) {
            throw new RegistrationException("이메일 형식이 올바르지 않습니다.");
        }
        if (password == null || password.length() < 8) {
            throw new RegistrationException("비밀번호는 8자 이상이어야 합니다.");
        }
        if (passwordConfirm == null || !password.equals(passwordConfirm)) {
            throw new RegistrationException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        if (normalizedNickname.isBlank()) {
            throw new RegistrationException("닉네임을 입력해주세요.");
        }
        if (normalizedNickname.length() < 2 || normalizedNickname.length() > 12) {
            throw new RegistrationException("닉네임은 2자 이상 12자 이하여야 합니다.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeNickname(String nickname) {
        return nickname == null ? "" : nickname.trim();
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }

    private Map<String, Object> createSafeUserPayload(com.loahub.user.User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.getUserId());
        payload.put("email", user.getEmail());
        payload.put("nickname", user.getNickname());
        payload.put("provider", user.getProvider());
        payload.put("role", user.getRole());
        payload.put("mainCharacterName", user.getMainCharacterName());
        payload.put("createdAt", user.getCreatedAt());
        payload.put("updatedAt", user.getUpdatedAt());
        return payload;
    }
}
