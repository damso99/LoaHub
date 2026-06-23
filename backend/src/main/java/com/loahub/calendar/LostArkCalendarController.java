package com.loahub.calendar;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.LostArkCalendarDayResponse;
import com.loahub.common.dto.LostArkCalendarWeekResponse;
import com.loahub.common.service.LostArkCalendarService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lostark/calendar")
public class LostArkCalendarController {
    private final LostArkCalendarService service;

    public LostArkCalendarController(LostArkCalendarService service) {
        this.service = service;
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<LostArkCalendarDayResponse>> today() {
        return ResponseEntity.ok(ApiResponse.ok(service.today()));
    }

    @GetMapping("/week")
    public ResponseEntity<ApiResponse<LostArkCalendarWeekResponse>> week() {
        return ResponseEntity.ok(ApiResponse.ok(service.week()));
    }

    @GetMapping("/date")
    public ResponseEntity<ApiResponse<LostArkCalendarDayResponse>> date(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(ApiResponse.ok(service.date(date)));
    }
}
