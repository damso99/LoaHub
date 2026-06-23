package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarWeekResponse(
    String weekStartDate,
    String weekEndDate,
    List<LostArkCalendarDayResponse> days
) {
}
