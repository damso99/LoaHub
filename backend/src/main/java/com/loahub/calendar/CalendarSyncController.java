package com.loahub.calendar;

import com.loahub.common.dto.CalendarSyncResult;
import com.loahub.common.service.CalendarSyncService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/calendar")
public class CalendarSyncController {
    private final CalendarSyncService calendarSyncService;
    private final String schedulerKey;

    public CalendarSyncController(
        CalendarSyncService calendarSyncService,
        @Value("${loahub.scheduler-key:}") String schedulerKey
    ) {
        this.calendarSyncService = calendarSyncService;
        this.schedulerKey = schedulerKey == null ? "" : schedulerKey.trim();
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync(@RequestHeader(value = "X-SCHEDULER-KEY", required = false) String requestKey) {
        if (schedulerKey.isBlank() || requestKey == null || !schedulerKey.equals(requestKey.trim())) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("status", "FAIL");
            body.put("message", "scheduler key is invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        CalendarSyncResult result = calendarSyncService.syncCurrentCalendar();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", result.status());
        body.put("message", result.message());
        body.put("baseDate", result.baseDate());
        body.put("weekStartDate", result.weekStartDate());
        body.put("weekEndDate", result.weekEndDate());
        body.put("syncedAt", result.syncedAt());
        body.put("fetchedCount", result.fetchedCount());
        body.put("filteredCount", result.filteredCount());
        body.put("savedCount", result.savedCount());
        return ResponseEntity.ok(body);
    }
}
