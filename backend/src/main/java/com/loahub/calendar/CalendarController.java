package com.loahub.calendar;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.NotificationRequest;
import com.loahub.common.service.CalendarService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {
    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<Object>> today() {
        return ResponseEntity.ok(calendarService.today());
    }

    @GetMapping("/week")
    public ResponseEntity<ApiResponse<Object>> week() {
        return ResponseEntity.ok(calendarService.week());
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Object>> notifications() {
        return ResponseEntity.ok(calendarService.notifications());
    }

    @PostMapping("/notifications")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody NotificationRequest request) {
        return ResponseEntity.ok(calendarService.create(request));
    }

    @PutMapping("/notifications/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable long id, @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(calendarService.update(id, request));
    }
}

