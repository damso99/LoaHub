package com.loahub.merchant;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.MerchantResponse;
import com.loahub.common.service.MerchantService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {
    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MerchantResponse>>> getMerchants(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(merchantService.getMerchants(region, keyword));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<List<MerchantResponse>>> getCurrentMerchants(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(merchantService.getCurrentMerchants(region, keyword));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MerchantResponse>>> search(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(merchantService.getMerchants(null, keyword));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<MerchantResponse>>> getFavorites() {
        return ResponseEntity.ok(merchantService.getFavorites());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MerchantResponse>> getMerchant(@PathVariable long id) {
        return ResponseEntity.ok(merchantService.getMerchant(id));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<MerchantResponse>> favorite(@PathVariable long id) {
        return ResponseEntity.ok(merchantService.favorite(id));
    }

    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<MerchantResponse>> unfavorite(@PathVariable long id) {
        return ResponseEntity.ok(merchantService.unfavorite(id));
    }
}
