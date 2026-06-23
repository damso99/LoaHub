package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarScheduleResponse(
    String categoryName,
    String contentsName,
    String contentsIcon,
    Integer minItemLevel,
    String location,
    String startTimeKst,
    String startDate,
    String startHhmm,
    String slotHhmm,
    List<CalendarRewardResponse> rewards
) {
}
