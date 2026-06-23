package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarDayResponse(
    String date,
    List<LostArkCalendarSlotGroupResponse> groups
) {
}
