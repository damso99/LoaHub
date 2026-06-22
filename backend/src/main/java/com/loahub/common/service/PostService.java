package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.PostRequest;
import com.loahub.common.security.SecurityUtils;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PostService {
    private final CommonDao dao;

    public PostService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Object> getPosts() {
        return ApiResponse.ok(dao.findPosts());
    }

    public ApiResponse<Object> getPost(long id) {
        return ApiResponse.ok(Map.of(
            "post", dao.increaseViewCount(id),
            "comments", dao.findCommentsByPostId(id)
        ));
    }

    public ApiResponse<Map<String, Object>> create(PostRequest request) {
        var currentUser = SecurityUtils.requireCurrentUser();
        var post = dao.createPost(currentUser.userId(), currentUser.nickname(), request);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", post);
        return ApiResponse.ok("게시글이 생성되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> update(long id, PostRequest request) {
        var post = dao.findPostById(id).orElseThrow();
        SecurityUtils.requireOwnerOrAdmin(post.userId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", dao.updatePost(id, request));
        return ApiResponse.ok("게시글이 수정되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> delete(long id) {
        var post = dao.findPostById(id).orElseThrow();
        SecurityUtils.requireOwnerOrAdmin(post.userId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deleted", dao.deletePost(id));
        return ApiResponse.ok("게시글이 삭제되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> like(long id) {
        SecurityUtils.requireCurrentUser();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", dao.likePost(id, true));
        return ApiResponse.ok("좋아요가 반영되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> unlike(long id) {
        SecurityUtils.requireCurrentUser();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", dao.likePost(id, false));
        return ApiResponse.ok("좋아요가 취소되었습니다.", payload);
    }
}
