package com.loahub.post;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.PostRequest;
import com.loahub.common.service.PostService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getPosts(
        @RequestParam(defaultValue = "free") String boardSlug,
        @RequestParam(defaultValue = "1") long page,
        @RequestParam(defaultValue = "20") long size,
        @RequestParam(required = false) String category,
        @RequestParam(defaultValue = "latest") String sort,
        @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(postService.getPosts(boardSlug, page, size, category, sort, keyword));
    }

    @GetMapping("/best")
    public ResponseEntity<ApiResponse<?>> getBestPosts(
        @RequestParam(defaultValue = "free") String boardSlug,
        @RequestParam(defaultValue = "daily") String period,
        @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(postService.getBestPosts(boardSlug, period, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getPost(@PathVariable long id) {
        return ResponseEntity.ok(postService.getPost(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable long id, @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> delete(@PathVariable long id) {
        return ResponseEntity.ok(postService.delete(id));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> like(@PathVariable long id) {
        return ResponseEntity.ok(postService.like(id));
    }
}
