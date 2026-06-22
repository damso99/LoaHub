package com.loahub.user;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.MainCharacterRequest;
import com.loahub.common.dto.Requests.UpdateProfileRequest;
import com.loahub.common.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateMe(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateMe(request));
    }

    @PostMapping("/me/main-character")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setMainCharacter(@Valid @RequestBody MainCharacterRequest request) {
        return ResponseEntity.ok(userService.setMainCharacter(request));
    }
}

