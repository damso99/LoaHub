package com.loahub.auth;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.LoginRequest;
import com.loahub.auth.dto.RegisterRequest;
import com.loahub.auth.dto.RegisterResponse;
import com.loahub.auth.dto.SignupRequest;
import com.loahub.common.util.EnvUtils;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEmail(@org.springframework.web.bind.annotation.RequestParam String email) {
        return ResponseEntity.ok(authService.checkEmail(email));
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkNickname(@org.springframework.web.bind.annotation.RequestParam String nickname) {
        return ResponseEntity.ok(authService.checkNickname(nickname));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("로그아웃되었습니다.", Map.of("logout", true)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me() {
        return ResponseEntity.ok(authService.me());
    }

    @GetMapping("/discord")
    public ResponseEntity<ApiResponse<Map<String, Object>>> discord() {
        boolean enabled = !EnvUtils.get("DISCORD_CLIENT_ID", "").isBlank();
        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("enabled", enabled);
        payload.put("authorizationUrl", enabled ? "/api/auth/discord/callback" : "");
        return ResponseEntity.ok(ApiResponse.ok(payload));
    }

    @GetMapping("/discord/callback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> discordCallback() {
        return ResponseEntity.ok(ApiResponse.ok("디스코드 로그인 콜백이 준비되었습니다.", Map.of("connected", false)));
    }
}
