package com.loahub.common.dto;

public record LostArkCalendarSyncResponse(
    String status,
    int fetchedCount,
    int filteredCount,
    int savedCount
) {
}
