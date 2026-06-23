package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarResponseItem(
    String categoryName,
    String contentsName,
    String contentsIcon,
    Integer minItemLevel,
    List<String> startTimes,
    String location,
    List<RewardGroup> rewardItems
) {
}
