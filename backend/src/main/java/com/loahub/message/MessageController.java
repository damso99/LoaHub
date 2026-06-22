package com.loahub.message;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.MessageRequest;
import com.loahub.common.service.MessageService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<Object>> inbox() {
        return ResponseEntity.ok(messageService.inbox());
    }

    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<Object>> sent() {
        return ResponseEntity.ok(messageService.sent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> detail(@PathVariable long id) {
        return ResponseEntity.ok(messageService.detail(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long id) {
        return ResponseEntity.ok(messageService.delete(id));
    }
}

