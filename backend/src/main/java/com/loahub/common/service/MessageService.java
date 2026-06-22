package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.MessageRequest;
import com.loahub.common.security.SecurityUtils;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MessageService {
    private final CommonDao dao;

    public MessageService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Object> inbox() {
        long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.ok(dao.findInbox(userId));
    }

    public ApiResponse<Object> sent() {
        long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.ok(dao.findSent(userId));
    }

    public ApiResponse<Object> detail(long id) {
        long userId = SecurityUtils.requireCurrentUserId();
        var message = dao.findMessageById(id).orElseThrow();
        if (message.senderId() != userId && message.receiverId() != userId && !SecurityUtils.isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException("본인 쪽지만 확인할 수 있습니다.");
        }
        return ApiResponse.ok(dao.markMessageRead(id, userId));
    }

    public ApiResponse<Map<String, Object>> create(MessageRequest request) {
        long senderId = SecurityUtils.requireCurrentUserId();
        var message = dao.sendMessage(senderId, request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", message);
        return ApiResponse.ok("쪽지가 전송되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> delete(long id) {
        long userId = SecurityUtils.requireCurrentUserId();
        var message = dao.findMessageById(id).orElseThrow();
        if (message.senderId() != userId && message.receiverId() != userId && !SecurityUtils.isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException("본인 쪽지만 삭제할 수 있습니다.");
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deleted", dao.deleteMessage(id, userId));
        return ApiResponse.ok("쪽지가 삭제되었습니다.", payload);
    }
}
