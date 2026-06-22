package com.loahub.character;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.LostArkCharacterResponse;
import com.loahub.common.service.LostArkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lostark")
public class LostArkCharacterController {
    private final LostArkService lostArkService;

    public LostArkCharacterController(LostArkService lostArkService) {
        this.lostArkService = lostArkService;
    }

    @GetMapping("/characters/{characterName}")
    public ResponseEntity<ApiResponse<LostArkCharacterResponse>> search(@PathVariable String characterName) {
        return ResponseEntity.ok(ApiResponse.ok(lostArkService.searchCharacter(characterName)));
    }
}
