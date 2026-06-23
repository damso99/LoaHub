package com.loahub.calendar;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.LostArkCalendarSyncResponse;
import com.loahub.common.service.LostArkCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/lostark/calendar")
public class LostArkCalendarAdminController {
    private final LostArkCalendarService service;

    public LostArkCalendarAdminController(LostArkCalendarService service) {
        this.service = service;
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<LostArkCalendarSyncResponse>> sync() {
        return ResponseEntity.ok(ApiResponse.ok(service.refreshWeeklyCalendar()));
    }
}
