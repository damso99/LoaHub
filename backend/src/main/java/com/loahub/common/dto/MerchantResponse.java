package com.loahub.common.dto;

import java.util.List;

public record MerchantResponse(
    long id,
    String region,
    String merchantName,
    String spawnTime,
    List<String> items,
    String description,
    String serverName,
    boolean favorite,
    boolean current
) {
}
