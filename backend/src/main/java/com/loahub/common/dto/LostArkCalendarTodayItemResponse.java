package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarTodayItemResponse(
    String id,
    String contentName,
    String contentType,
    String startTime,
    String imageUrl,
    String rewardType,
    List<CalendarRewardResponse> rewards,
    List<CalendarRewardResponse> rewardItems,
    String rewardText
) {
}
