package com.loahub.common.service;

import com.loahub.common.dao.CommonDao;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CommentRequest;
import com.loahub.common.security.SecurityUtils;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    private final CommonDao dao;

    public CommentService(CommonDao dao) {
        this.dao = dao;
    }

    public ApiResponse<Object> getComments(long postId) {
        return ApiResponse.ok(dao.findCommentsByPostId(postId));
    }

    public ApiResponse<Map<String, Object>> create(long postId, CommentRequest request) {
        var currentUser = SecurityUtils.requireCurrentUser();
        var comment = dao.createComment(postId, currentUser.userId(), currentUser.nickname(), request.content());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("comment", comment);
        return ApiResponse.ok("댓글이 생성되었습니다.", payload);
    }

    public ApiResponse<Map<String, Object>> delete(long commentId) {
        var comment = dao.findCommentById(commentId).orElseThrow();
        SecurityUtils.requireOwnerOrAdmin(comment.userId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deleted", dao.deleteComment(commentId));
        return ApiResponse.ok("댓글이 삭제되었습니다.", payload);
    }
}
