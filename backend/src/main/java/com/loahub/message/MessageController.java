package com.loahub.message;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.MessageCreateRequest;
import com.loahub.message.dto.MessageResponse;
import com.loahub.message.dto.MessageThreadResponse;
import com.loahub.message.dto.UnreadCountResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageThreadResponse>>> list() {
        return ResponseEntity.ok(messageService.listThreads());
    }

    @GetMapping("/{threadId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> detail(@PathVariable long threadId) {
        return ResponseEntity.ok(messageService.getThread(threadId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody MessageCreateRequest request) {
        return ResponseEntity.ok(messageService.create(request));
    }

    @PatchMapping("/{threadId}/read")
    public ResponseEntity<ApiResponse<Map<String, Object>>> read(@PathVariable long threadId) {
        return ResponseEntity.ok(messageService.markRead(threadId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> unreadCount() {
        return ResponseEntity.ok(messageService.unreadCount());
    }

    @DeleteMapping("/{threadId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long threadId) {
        return ResponseEntity.ok(messageService.delete(threadId));
    }
}
