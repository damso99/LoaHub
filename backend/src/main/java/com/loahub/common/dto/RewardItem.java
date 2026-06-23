package com.loahub.common.dto;

import java.util.List;

public record RewardItem(
    String name,
    String icon,
    String grade,
    List<String> startTimes
) {
}
