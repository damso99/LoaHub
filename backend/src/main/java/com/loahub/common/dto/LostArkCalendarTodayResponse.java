package com.loahub.common.dto;

import java.util.List;

public record LostArkCalendarTodayResponse(
    List<LostArkCalendarTodayItemResponse> adventureIslands,
    List<LostArkCalendarTodayItemResponse> fieldBosses,
    List<LostArkCalendarTodayItemResponse> chaosGates
) {
}
