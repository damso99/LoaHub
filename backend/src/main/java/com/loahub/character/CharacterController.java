package com.loahub.character;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CharacterSaveRequest;
import com.loahub.common.service.CharacterService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {
    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Object>> search(@RequestParam(required = false, name = "characterName") String characterName) {
        return ResponseEntity.ok(characterService.search(characterName));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> myCharacters() {
        return ResponseEntity.ok(characterService.getMyCharacters());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody CharacterSaveRequest request) {
        return ResponseEntity.ok(characterService.save(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long id) {
        return ResponseEntity.ok(characterService.delete(id));
    }
}
