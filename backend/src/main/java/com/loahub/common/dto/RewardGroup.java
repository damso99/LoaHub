package com.loahub.common.dto;

import java.util.List;

public record RewardGroup(
    String name,
    List<RewardItem> rewardItems
) {
}
