package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.NotificationRequest;
import com.loahub.common.security.SecurityUtils;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CalendarService {
    private final CommonDao dao;

    public CalendarService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Object> today() {
        return ApiResponse.ok(dao.findCalendarContents());
    }

    public ApiResponse<Object> week() {
        return ApiResponse.ok(dao.findCalendarContents());
    }

    public ApiResponse<Object> notifications() {
        long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.ok(dao.findNotificationsByUserId(userId));
    }

    public ApiResponse<Map<String, Object>> create(NotificationRequest request) {
        long userId = SecurityUtils.requireCurrentUserId();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("notification", dao.upsertNotification(userId, request));
        return ApiResponse.ok("알림이 등록되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> update(long id, NotificationRequest request) {
        long userId = SecurityUtils.requireCurrentUserId();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("notification", dao.upsertNotification(userId, request));
        return ApiResponse.ok("알림이 수정되었습니다.", payload);
    }
}
