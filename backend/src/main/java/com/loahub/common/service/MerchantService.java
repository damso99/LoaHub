package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.MerchantResponse;
import com.loahub.common.model.DomainModels.MerchantFavorite;
import com.loahub.common.model.DomainModels.WanderingMerchant;
import com.loahub.common.security.SecurityUtils;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MerchantService {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("H:mm");

    private final CommonDao dao;

    public MerchantService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<List<MerchantResponse>> getMerchants(String region, String keyword) {
        List<WanderingMerchant> merchants = resolveMerchants(region, keyword);
        return ApiResponse.ok(toResponses(merchants));
    }

    public ApiResponse<List<MerchantResponse>> getCurrentMerchants(String region, String keyword) {
        List<WanderingMerchant> merchants = dao.findCurrentMerchants();
        List<WanderingMerchant> filtered = applyTextFilters(merchants, region, keyword);
        return ApiResponse.ok(toResponses(filtered, true));
    }

    public ApiResponse<List<MerchantResponse>> getFavorites() {
        long userId = SecurityUtils.requireCurrentUserId();
        List<MerchantResponse> favorites = dao.findMerchantFavoritesByUserId(userId).stream()
            .map(MerchantFavorite::merchantId)
            .map(this::findMerchantOrThrow)
            .map(merchant -> toResponse(merchant, true, isCurrentMerchant(merchant)))
            .collect(Collectors.toList());
        return ApiResponse.ok(favorites);
    }

    public ApiResponse<MerchantResponse> getMerchant(long id) {
        WanderingMerchant merchant = findMerchantOrThrow(id);
        return ApiResponse.ok(toResponse(merchant, isFavorite(merchant.id()), isCurrentMerchant(merchant)));
    }

    public ApiResponse<MerchantResponse> favorite(long id) {
        long userId = SecurityUtils.requireCurrentUserId();
        WanderingMerchant merchant = findMerchantOrThrow(id);
        dao.createMerchantFavorite(userId, id);
        return ApiResponse.ok("즐겨찾기가 반영되었습니다.", toResponse(merchant, true, isCurrentMerchant(merchant)));
    }

    public ApiResponse<MerchantResponse> unfavorite(long id) {
        long userId = SecurityUtils.requireCurrentUserId();
        WanderingMerchant merchant = findMerchantOrThrow(id);
        dao.deleteMerchantFavorite(userId, id);
        return ApiResponse.ok("즐겨찾기가 해제되었습니다.", toResponse(merchant, false, isCurrentMerchant(merchant)));
    }

    private List<WanderingMerchant> resolveMerchants(String region, String keyword) {
        String normalizedKeyword = normalize(keyword);
        String normalizedRegion = normalize(region);

        if (!normalizedKeyword.isBlank()) {
            return applyRegionFilter(dao.searchMerchants(normalizedKeyword), normalizedRegion);
        }

        if (!normalizedRegion.isBlank()) {
            return dao.findMerchantsByRegion(normalizedRegion);
        }

        return dao.findMerchants();
    }

    private List<WanderingMerchant> applyTextFilters(List<WanderingMerchant> merchants, String region, String keyword) {
        String normalizedRegion = normalize(region);
        String normalizedKeyword = normalize(keyword);

        return merchants.stream()
            .filter(merchant -> normalizedRegion.isBlank() || normalize(merchant.region()).contains(normalizedRegion))
            .filter(merchant -> normalizedKeyword.isBlank()
                || normalize(merchant.region()).contains(normalizedKeyword)
                || normalize(merchant.merchantName()).contains(normalizedKeyword)
                || normalize(merchant.description()).contains(normalizedKeyword)
                || normalize(merchant.spawnTime()).contains(normalizedKeyword)
                || merchant.items().stream().anyMatch(item -> normalize(item).contains(normalizedKeyword)))
            .collect(Collectors.toList());
    }

    private List<WanderingMerchant> applyRegionFilter(List<WanderingMerchant> merchants, String region) {
        if (region.isBlank()) {
            return merchants;
        }
        return merchants.stream()
            .filter(merchant -> normalize(merchant.region()).contains(region))
            .collect(Collectors.toList());
    }

    private List<MerchantResponse> toResponses(List<WanderingMerchant> merchants) {
        return toResponses(merchants, false);
    }

    private List<MerchantResponse> toResponses(List<WanderingMerchant> merchants, boolean forceCurrentFlag) {
        return merchants.stream()
            .map(merchant -> toResponse(merchant, isFavorite(merchant.id()), forceCurrentFlag || isCurrentMerchant(merchant)))
            .collect(Collectors.toList());
    }

    private MerchantResponse toResponse(WanderingMerchant merchant, boolean favorite, boolean current) {
        return new MerchantResponse(
            merchant.id(),
            merchant.region(),
            merchant.merchantName(),
            merchant.spawnTime(),
            merchant.items(),
            merchant.description(),
            merchant.serverName(),
            favorite,
            current
        );
    }

    private WanderingMerchant findMerchantOrThrow(long id) {
        return dao.findMerchantById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "떠돌이 상인을 찾을 수 없습니다."));
    }

    private boolean isFavorite(long merchantId) {
        Optional<Long> currentUserId = SecurityUtils.currentUser().map(user -> user.userId());
        return currentUserId
            .flatMap(userId -> dao.findMerchantFavorite(userId, merchantId).map(MerchantFavorite::merchantId))
            .isPresent();
    }

    private boolean isCurrentMerchant(WanderingMerchant merchant) {
        if (merchant.spawnTime() == null || merchant.spawnTime().isBlank()) {
            return false;
        }

        String[] parts = merchant.spawnTime().split("~");
        if (parts.length != 2) {
            return false;
        }

        try {
            LocalTime now = LocalTime.now(ZoneId.of("Asia/Seoul"));
            LocalTime start = LocalTime.parse(parts[0].trim(), TIME_FORMATTER);
            LocalTime end = LocalTime.parse(parts[1].trim(), TIME_FORMATTER);
            if (start.equals(end)) {
                return true;
            }
            if (start.isBefore(end)) {
                return !now.isBefore(start) && !now.isAfter(end);
            }
            return !now.isBefore(start) || !now.isAfter(end);
        } catch (Exception exception) {
            return false;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.KOREA);
    }
}
