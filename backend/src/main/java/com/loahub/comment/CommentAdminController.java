package com.loahub.comment;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.service.CommentService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
public class CommentAdminController {
    private final CommentService commentService;

    public CommentAdminController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long commentId) {
        return ResponseEntity.ok(commentService.delete(commentId));
    }
}
