package com.loahub.comment;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CommentRequest;
import com.loahub.common.service.CommentService;
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
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getComments(@PathVariable long postId) {
        return ResponseEntity.ok(commentService.getComments(postId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@PathVariable long postId, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.create(postId, request));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long postId, @PathVariable long commentId) {
        return ResponseEntity.ok(commentService.delete(commentId));
    }
}
