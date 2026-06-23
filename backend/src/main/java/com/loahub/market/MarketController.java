package com.loahub.market;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.MarketItemResponse;
import com.loahub.common.service.MarketService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lostark/markets")
public class MarketController {
    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MarketItemResponse>>> search(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(marketService.search(keyword));
    }
}
