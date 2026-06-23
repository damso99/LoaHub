package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarSlotGroupResponse(
    String slotHhmm,
    List<LostArkCalendarScheduleResponse> items
) {
}
