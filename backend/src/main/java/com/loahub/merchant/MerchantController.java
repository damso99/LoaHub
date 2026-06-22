package com.loahub.merchant;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.service.MerchantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {
    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getMerchants() {
        return ResponseEntity.ok(merchantService.getMerchants());
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<Object>> getFavorites() {
        return ResponseEntity.ok(merchantService.getFavorites());
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Object>> favorite(@PathVariable long id) {
        return ResponseEntity.ok(merchantService.favorite(id));
    }

    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Object>> unfavorite(@PathVariable long id) {
        return ResponseEntity.ok(merchantService.unfavorite(id));
    }
}

