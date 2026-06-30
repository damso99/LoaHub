package com.loahub.common.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CalendarSyncResult(
    String status,
    String message,
    LocalDate baseDate,
    LocalDate weekStartDate,
    LocalDate weekEndDate,
    LocalDateTime syncedAt,
    int fetchedCount,
    int filteredCount,
    int savedCount
) {
}
