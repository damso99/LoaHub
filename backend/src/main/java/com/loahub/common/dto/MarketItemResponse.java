package com.loahub.common.dto;

public record MarketItemResponse(
    String itemId,
    String itemName,
    String grade,
    String icon,
    Long currentMinPrice,
    Long recentPrice,
    Long yDayAvgPrice,
    Integer bundleCount,
    Integer tradeRemainCount
) {
}
