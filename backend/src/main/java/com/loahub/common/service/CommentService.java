package com.loahub.common.service;

import com.loahub.comment.CommentMapper;
import com.loahub.comment.command.CommentWriteCommand;
import com.loahub.comment.dto.CommentResponse;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.Requests.CommentRequest;
import com.loahub.common.security.SecurityUtils;
import com.loahub.post.PostMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentService {
    private static final Logger log = LoggerFactory.getLogger(CommentService.class);
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DELETED = "DELETED";

    private final PostMapper postMapper;
    private final CommentMapper commentMapper;

    public CommentService(PostMapper postMapper, CommentMapper commentMapper) {
        this.postMapper = postMapper;
        this.commentMapper = commentMapper;
    }

    public ApiResponse<List<CommentResponse>> getComments(long postId) {
        log.info("댓글 조회 시작. postId={}", postId);
        ensureActivePost(postId);

        List<CommentResponse> comments = commentMapper.findCommentsByPostId(postId).stream()
            .map(this::toResponse)
            .toList();

        log.info("댓글 조회 완료. postId={}, count={}", postId, comments.size());
        return ApiResponse.ok("댓글을 불러왔습니다.", comments);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> create(long postId, CommentRequest request) {
        var currentUser = SecurityUtils.requireCurrentUser();
        log.info("댓글 작성 시작. postId={}, userId={}, nickname={}", postId, currentUser.userId(), currentUser.nickname());
        ensureActivePost(postId);

        CommentWriteCommand command = new CommentWriteCommand();
        command.setPostId(postId);
        command.setUserId(currentUser.userId());
        command.setAuthor(currentUser.nickname());
        command.setContent(requireText(request.content(), "댓글 내용을 입력해 주세요."));
        command.setStatus(STATUS_ACTIVE);

        try {
            int inserted = commentMapper.insertComment(command);
            if (inserted <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "댓글 저장에 실패했습니다.");
            }
        } catch (DataAccessException exception) {
            log.error("댓글 insert 실패. postId={}, userId={}, nickname={}", postId, currentUser.userId(), currentUser.nickname(), exception);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "댓글 저장에 실패했습니다.", exception);
        }

        try {
            int updated = postMapper.increaseCommentCount(postId);
            if (updated <= 0) {
                log.warn("댓글 카운트 갱신 대상이 없습니다. postId={}", postId);
            }
        } catch (DataAccessException exception) {
            log.error("댓글 카운트 갱신 실패. postId={}", postId, exception);
        }

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
        log.info("댓글 작성 완료. postId={}, commentId={}", postId, commentId);
        return ApiResponse.ok("댓글이 작성되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> delete(long commentId) {
        SecurityUtils.requireCurrentUser();
        log.info("댓글 삭제 시작. commentId={}", commentId);

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
        log.info("댓글 삭제 완료. commentId={}", commentId);
        return ApiResponse.ok("댓글이 삭제되었습니다.", payload);
    }

    private void ensureActivePost(long postId) {
        if (postMapper.countActivePostById(postId) <= 0) {
            throw new NoSuchElementException("존재하지 않는 게시글입니다.");
        }
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
