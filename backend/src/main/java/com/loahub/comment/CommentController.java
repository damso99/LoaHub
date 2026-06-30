package com.loahub.comment;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CommentRequest;
import com.loahub.common.service.CommentService;
import jakarta.validation.Valid;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {
    private static final Logger log = LoggerFactory.getLogger(CommentController.class);

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getComments(@PathVariable long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@PathVariable long postId, @Valid @RequestBody CommentRequest request) {
        log.info("댓글 작성 요청 수신. postId={}, contentLength={}", postId, request == null || request.content() == null ? 0 : request.content().length());
        return ResponseEntity.ok(commentService.create(postId, request));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long postId, @PathVariable long commentId) {
        return ResponseEntity.ok(commentService.delete(commentId));
    }
}
