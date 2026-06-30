package com.loahub.message;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.MessageCreateRequest;
import com.loahub.common.security.SecurityUtils;
import com.loahub.message.dto.MessageNotificationResponse;
import com.loahub.message.dto.MessageResponse;
import com.loahub.message.dto.MessageThreadResponse;
import com.loahub.message.dto.UnreadCountResponse;
import com.loahub.message.model.MessageThreadRow;
import com.loahub.user.User;
import com.loahub.user.UserMapper;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MessageService {
    private final MessageMapper messageMapper;
    private final UserMapper userMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(MessageMapper messageMapper, UserMapper userMapper, SimpMessagingTemplate messagingTemplate) {
        this.messageMapper = messageMapper;
        this.userMapper = userMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<MessageThreadResponse>> listThreads() {
        long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.ok(messageMapper.findThreadResponsesByUserId(userId));
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<MessageResponse>> getThread(long threadId) {
        long userId = SecurityUtils.requireCurrentUserId();
        MessageThreadRow thread = loadThread(threadId);
        ensureAccessible(thread, userId);

        messageMapper.markMessagesRead(threadId, userId);
        List<MessageResponse> messages = messageMapper.findMessagesByThreadId(threadId, userId);
        return ApiResponse.ok(messages);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> create(MessageCreateRequest request) {
        long senderId = SecurityUtils.requireCurrentUserId();
        User receiver = userMapper.findById(request.receiverId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "받는 사용자를 찾을 수 없습니다."));
        if (senderId == receiver.getUserId()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신에게는 쪽지를 보낼 수 없습니다.");
        }

        String content = requireText(request.content(), "쪽지 내용을 입력해 주세요.");
        MessageThreadRow thread = messageMapper.findThreadByParticipants(senderId, receiver.getUserId())
            .orElseGet(() -> createThread(senderId, receiver.getUserId(), content));

        if (thread.senderDeleted() || thread.receiverDeleted()) {
            messageMapper.restoreThread(thread.id());
        }

        messageMapper.touchThread(thread.id(), content);
        messageMapper.insertMessage(thread.id(), senderId, receiver.getUserId(), content);

        MessageThreadRow refreshedThread = loadThread(thread.id());
        List<MessageResponse> senderMessages = messageMapper.findMessagesByThreadId(thread.id(), senderId);
        List<MessageResponse> receiverMessages = messageMapper.findMessagesByThreadId(thread.id(), receiver.getUserId());
        MessageResponse senderLatest = senderMessages.isEmpty() ? null : senderMessages.get(senderMessages.size() - 1);
        MessageResponse receiverLatest = receiverMessages.isEmpty() ? null : receiverMessages.get(receiverMessages.size() - 1);
        long receiverUnreadCount = messageMapper.countUnreadMessagesByUserId(receiver.getUserId());
        MessageNotificationResponse notification = new MessageNotificationResponse(
            refreshedThread.id(),
            senderLatest == null ? 0 : senderLatest.id(),
            senderId,
            resolveNickname(senderId),
            buildPreview(content),
            senderLatest == null ? OffsetDateTime.now() : senderLatest.createdAt(),
            receiverUnreadCount
        );

        if (senderLatest != null && receiverLatest != null) {
            messagingTemplate.convertAndSendToUser(String.valueOf(receiver.getUserId()), "/queue/messages", receiverLatest);
            messagingTemplate.convertAndSendToUser(String.valueOf(receiver.getUserId()), "/queue/notifications", notification);
            messagingTemplate.convertAndSendToUser(
                String.valueOf(receiver.getUserId()),
                "/queue/unread-count",
                new UnreadCountResponse(receiverUnreadCount)
            );
            messagingTemplate.convertAndSendToUser(String.valueOf(senderId), "/queue/messages", senderLatest);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("threadId", refreshedThread.id());
        payload.put("message", senderLatest);
        payload.put("notification", notification);
        payload.put("unreadCount", receiverUnreadCount);
        return ApiResponse.ok("쪽지가 전송되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<UnreadCountResponse> unreadCount() {
        long userId = SecurityUtils.requireCurrentUserId();
        return ApiResponse.ok(new UnreadCountResponse(messageMapper.countUnreadMessagesByUserId(userId)));
    }

    @Transactional
    public ApiResponse<Map<String, Object>> markRead(long threadId) {
        long userId = SecurityUtils.requireCurrentUserId();
        MessageThreadRow thread = loadThread(threadId);
        ensureAccessible(thread, userId);
        int updated = messageMapper.markMessagesRead(threadId, userId);
        long unreadCount = messageMapper.countUnreadMessagesByUserId(userId);
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/unread-count", new UnreadCountResponse(unreadCount));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("threadId", threadId);
        payload.put("updated", updated);
        payload.put("unreadCount", unreadCount);
        return ApiResponse.ok("읽음 처리되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> delete(long threadId) {
        long userId = SecurityUtils.requireCurrentUserId();
        MessageThreadRow thread = loadThread(threadId);
        ensureAccessible(thread, userId);
        int updated = messageMapper.softDeleteThread(threadId, userId);
        long unreadCount = messageMapper.countUnreadMessagesByUserId(userId);
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/unread-count", new UnreadCountResponse(unreadCount));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("threadId", threadId);
        payload.put("deleted", updated > 0);
        payload.put("unreadCount", unreadCount);
        return ApiResponse.ok("쪽지가 삭제되었습니다.", payload);
    }

    private MessageThreadRow createThread(long senderId, long receiverId, String content) {
        messageMapper.insertThread(senderId, receiverId, content);
        return messageMapper.findThreadByParticipants(senderId, receiverId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "쪽지 대화를 생성하지 못했습니다."));
    }

    private MessageThreadRow loadThread(long threadId) {
        return messageMapper.findThreadById(threadId)
            .orElseThrow(() -> new NoSuchElementException("존재하지 않는 쪽지입니다."));
    }

    private void ensureAccessible(MessageThreadRow thread, long userId) {
        boolean participant = thread.senderId() == userId || thread.receiverId() == userId;
        if (!participant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 쪽지만 확인할 수 있습니다.");
        }
        boolean hidden = thread.senderId() == userId ? thread.senderDeleted() : thread.receiverDeleted();
        if (hidden) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제된 쪽지입니다.");
        }
    }

    private String resolveNickname(long userId) {
        return userMapper.findById(userId).map(User::getNickname).orElse("LoaHub");
    }

    private String buildPreview(String content) {
        String trimmed = content == null ? "" : content.trim();
        if (trimmed.length() <= 60) {
            return trimmed;
        }
        return trimmed.substring(0, 60) + "...";
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
