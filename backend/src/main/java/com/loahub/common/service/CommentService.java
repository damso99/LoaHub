package com.loahub.common.service;

import com.loahub.comment.CommentMapper;
import com.loahub.comment.command.CommentWriteCommand;
import com.loahub.comment.dto.CommentResponse;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CommentRequest;
import com.loahub.common.security.SecurityUtils;
import com.loahub.post.PostMapper;
import com.loahub.post.model.PostRow;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentService {
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DELETED = "DELETED";

    private final PostMapper postMapper;
    private final CommentMapper commentMapper;

    public CommentService(PostMapper postMapper, CommentMapper commentMapper) {
        this.postMapper = postMapper;
        this.commentMapper = commentMapper;
    }

    public ApiResponse<List<CommentResponse>> getComments(long postId) {
        loadPost(postId);
        List<CommentResponse> comments = commentMapper.findCommentsByPostId(postId).stream()
            .map(this::toResponse)
            .toList();
        return ApiResponse.ok("댓글을 불러왔습니다.", comments);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> create(long postId, CommentRequest request) {
        var currentUser = SecurityUtils.requireCurrentUser();
        loadPost(postId);

        CommentWriteCommand command = new CommentWriteCommand();
        command.setPostId(postId);
        command.setUserId(currentUser.userId());
        command.setAuthor(currentUser.nickname());
        command.setContent(requireText(request.content(), "댓글 내용을 입력해 주세요."));
        command.setStatus(STATUS_ACTIVE);

        int inserted = commentMapper.insertComment(command);
        if (inserted <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "댓글 저장에 실패했습니다.");
        }

        postMapper.increaseCommentCount(postId);

        Map<String, Object> payload = new LinkedHashMap<>();
        Long commentId = command.getCommentId();
        payload.put(
            "comment",
            commentId == null
                ? null
                : commentMapper.findCommentById(commentId).map(this::toResponse).orElse(null)
        );
        payload.put("commentId", commentId);
        payload.put("created", true);
        return ApiResponse.ok("댓글이 작성되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> delete(long commentId) {
        SecurityUtils.requireCurrentUser();
        var comment = commentMapper.findCommentById(commentId)
            .orElseThrow(() -> new NoSuchElementException("존재하지 않는 댓글입니다."));
        if (!STATUS_ACTIVE.equals(comment.status())) {
            throw new NoSuchElementException("존재하지 않는 댓글입니다.");
        }
        SecurityUtils.requireOwnerOrAdmin(comment.userId());

        commentMapper.softDeleteComment(commentId);
        postMapper.decreaseCommentCount(comment.postId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deleted", true);
        payload.put("commentId", commentId);
        return ApiResponse.ok("댓글이 삭제되었습니다.", payload);
    }

    private PostRow loadPost(long postId) {
        PostRow post = postMapper.findPostById(postId)
            .orElseThrow(() -> new NoSuchElementException("존재하지 않는 게시글입니다."));
        if (!STATUS_ACTIVE.equals(post.status())) {
            throw new NoSuchElementException("존재하지 않는 게시글입니다.");
        }
        return post;
    }

    private CommentResponse toResponse(com.loahub.comment.model.CommentRow comment) {
        return new CommentResponse(
            comment.id(),
            comment.postId(),
            comment.userId(),
            comment.author(),
            comment.content(),
            comment.status(),
            comment.createdAt(),
            comment.updatedAt()
        );
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
