package com.loahub.common.service;

import com.loahub.board.BoardMapper;
import com.loahub.board.model.BoardRow;
import com.loahub.comment.CommentMapper;
import com.loahub.comment.command.CommentWriteCommand;
import com.loahub.comment.dto.CommentResponse;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.dto.PageResponse;
import com.loahub.common.dto.Requests.PostRequest;
import com.loahub.common.security.SecurityUtils;
import com.loahub.post.PostMapper;
import com.loahub.post.command.PostWriteCommand;
import com.loahub.post.dto.PostDetailResponse;
import com.loahub.post.dto.PostSummaryResponse;
import com.loahub.post.model.PostRow;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {
    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DELETED = "DELETED";

    private final BoardMapper boardMapper;
    private final PostMapper postMapper;
    private final CommentMapper commentMapper;

    public PostService(BoardMapper boardMapper, PostMapper postMapper, CommentMapper commentMapper) {
        this.boardMapper = boardMapper;
        this.postMapper = postMapper;
        this.commentMapper = commentMapper;
    }

    public ApiResponse<PageResponse<PostSummaryResponse>> getPosts(String boardSlug, long page, long size, String categoryCode, String sort, String keyword) {
        BoardRow board = resolveBoard(boardSlug);
        long normalizedPage = Math.max(page, 1);
        long normalizedSize = clampSize(size);
        long offset = (normalizedPage - 1) * normalizedSize;
        String normalizedCategory = normalizeCategory(categoryCode);
        String normalizedSort = normalizeSort(sort);
        String normalizedKeyword = normalizeKeyword(keyword);

        try {
            long total = postMapper.countPosts(board.id(), normalizedCategory, normalizedKeyword);
            List<PostSummaryResponse> items = postMapper.findPosts(board.id(), normalizedCategory, normalizedSort, offset, normalizedSize, normalizedKeyword)
                .stream()
                .map(this::toSummaryResponse)
                .toList();

            long totalPages = total == 0 ? 0 : (long) Math.ceil((double) total / normalizedSize);
            PageResponse<PostSummaryResponse> payload = new PageResponse<>(
                items,
                normalizedPage,
                normalizedSize,
                total,
                totalPages,
                normalizedPage < totalPages
            );

            return ApiResponse.ok("게시글 목록을 불러왔습니다.", payload);
        } catch (DataAccessException exception) {
            log.warn("게시글 목록 조회에 실패하여 빈 목록을 반환합니다. boardSlug={}, categoryCode={}, sort={}", boardSlug, categoryCode, sort, exception);
            PageResponse<PostSummaryResponse> payload = new PageResponse<>(
                List.of(),
                normalizedPage,
                normalizedSize,
                0,
                0,
                false
            );
            return ApiResponse.ok("게시글 목록을 불러왔습니다.", payload);
        }
    }

    public ApiResponse<List<PostSummaryResponse>> getBestPosts(String boardSlug, String period, String categoryCode) {
        BoardRow board = resolveBoard(boardSlug);
        String normalizedCategory = normalizeCategory(categoryCode);
        OffsetDateTime startAt = resolvePeriodStart(period);
        try {
            List<PostSummaryResponse> items = postMapper.findBestPosts(board.id(), normalizedCategory, startAt, 10)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
            return ApiResponse.ok("인기글을 불러왔습니다.", items);
        } catch (DataAccessException exception) {
            log.warn("인기글 조회에 실패하여 빈 목록을 반환합니다. boardSlug={}, categoryCode={}, period={}", boardSlug, categoryCode, period, exception);
            return ApiResponse.ok("인기글을 불러왔습니다.", List.of());
        }
    }

    @Transactional
    public ApiResponse<PostDetailResponse> getPost(long id) {
        PostRow post = loadPost(id);
        postMapper.incrementViewCount(id);
        List<CommentResponse> comments = commentMapper.findCommentsByPostId(id)
            .stream()
            .map(this::toCommentResponse)
            .toList();

        return ApiResponse.ok("게시글을 불러왔습니다.", new PostDetailResponse(toSummaryResponse(post, post.viewCount() + 1), comments));
    }

    @Transactional
    public ApiResponse<Map<String, Object>> create(PostRequest request) {
        var currentUser = SecurityUtils.requireCurrentUser();
        BoardRow board = resolveBoard(request.boardSlug());
        String categoryCode = resolveCategoryCode(board.boardType(), request.categoryCode());
        boolean pinned = Boolean.TRUE.equals(request.pinned());
        ensureCanPin(pinned);

        PostWriteCommand command = new PostWriteCommand();
        command.setBoardId(board.id());
        command.setBoardSlug(board.slug());
        command.setUserId(currentUser.userId());
        command.setAuthor(currentUser.nickname());
        command.setTitle(requireText(request.title(), "제목을 입력해 주세요."));
        command.setContent(requireText(request.content(), "내용을 입력해 주세요."));
        command.setCategoryCode(categoryCode);
        command.setPinned(pinned);
        command.setStatus(STATUS_ACTIVE);

        postMapper.insertPost(command);
        PostRow created = loadPost(command.getPostId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", toSummaryResponse(created));
        return ApiResponse.ok("게시글이 생성되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> update(long id, PostRequest request) {
        PostRow current = loadPost(id);
        SecurityUtils.requireOwnerOrAdmin(current.userId());
        boolean pinned = request.pinned() != null ? request.pinned() : current.pinned();
        ensureCanPin(pinned);

        BoardRow board = resolveBoard(request.boardSlug() == null || request.boardSlug().isBlank() ? current.boardSlug() : request.boardSlug());
        String categoryCode = resolveCategoryCode(board.boardType(), request.categoryCode() == null ? current.categoryCode() : request.categoryCode());

        PostWriteCommand command = new PostWriteCommand();
        command.setPostId(id);
        command.setBoardId(board.id());
        command.setBoardSlug(board.slug());
        command.setAuthor(current.author());
        command.setTitle(request.title() == null || request.title().isBlank() ? current.title() : request.title());
        command.setContent(request.content() == null || request.content().isBlank() ? current.content() : request.content());
        command.setCategoryCode(categoryCode);
        command.setPinned(pinned);
        command.setStatus(current.status());

        postMapper.updatePost(command);
        PostRow updated = loadPost(id);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", toSummaryResponse(updated));
        return ApiResponse.ok("게시글이 수정되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> delete(long id) {
        PostRow current = loadPost(id);
        SecurityUtils.requireOwnerOrAdmin(current.userId());
        postMapper.softDeletePost(id);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("deleted", true);
        payload.put("postId", id);
        return ApiResponse.ok("게시글이 삭제되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> like(long id) {
        var currentUser = SecurityUtils.requireCurrentUser();
        PostRow current = loadPost(id);
        boolean liked = postMapper.countPostLike(id, currentUser.userId()) == 0;
        if (liked) {
            postMapper.insertPostLike(id, currentUser.userId());
            postMapper.increaseLikeCount(id);
        } else {
            postMapper.deletePostLike(id, currentUser.userId());
            postMapper.decreaseLikeCount(id);
        }

        PostRow refreshed = loadPost(id);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", toSummaryResponse(refreshed));
        payload.put("liked", liked);
        return ApiResponse.ok(liked ? "추천이 반영되었습니다." : "추천이 취소되었습니다.", payload);
    }

    @Transactional
    public ApiResponse<Map<String, Object>> unlike(long id) {
        var currentUser = SecurityUtils.requireCurrentUser();
        if (postMapper.countPostLike(id, currentUser.userId()) > 0) {
            postMapper.deletePostLike(id, currentUser.userId());
            postMapper.decreaseLikeCount(id);
        }

        PostRow refreshed = loadPost(id);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("post", toSummaryResponse(refreshed));
        payload.put("liked", false);
        return ApiResponse.ok("추천이 취소되었습니다.", payload);
    }

    private BoardRow resolveBoard(String boardSlug) {
        String normalizedSlug = boardSlug == null || boardSlug.isBlank() ? "free" : boardSlug.trim();
        try {
            return boardMapper.findBoardBySlug(normalizedSlug)
                .orElseGet(() -> BoardCatalog.defaultBoardRow(normalizedSlug)
                    .orElseThrow(() -> new NoSuchElementException("존재하지 않는 게시판입니다.")));
        } catch (DataAccessException exception) {
            return BoardCatalog.defaultBoardRow(normalizedSlug)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 게시판입니다."));
        }
    }

    private PostRow loadPost(long id) {
        PostRow post = postMapper.findPostById(id)
            .orElseThrow(() -> new NoSuchElementException("존재하지 않는 게시글입니다."));
        if (!STATUS_ACTIVE.equals(post.status())) {
            throw new NoSuchElementException("존재하지 않는 게시글입니다.");
        }
        return post;
    }

    private String resolveCategoryCode(String boardType, String categoryCode) {
        String normalized = normalizeCategory(categoryCode);
        if (normalized == null) {
            throw new IllegalArgumentException("카테고리를 선택해 주세요.");
        }

        boolean exists;
        try {
            exists = boardMapper.findCategoriesByBoardType(boardType).stream()
                .anyMatch(category -> category.categoryCode().equalsIgnoreCase(normalized));
        } catch (DataAccessException exception) {
            exists = BoardCatalog.defaultCategoryCode(boardType, normalized).isPresent();
        }

        if (!exists) {
            throw new IllegalArgumentException("지원하지 않는 카테고리입니다.");
        }
        return normalized.toUpperCase();
    }

    private String normalizeCategory(String categoryCode) {
        if (categoryCode == null || categoryCode.isBlank()) {
            return null;
        }
        return categoryCode.trim().toUpperCase();
    }

    private String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "LATEST";
        }

        return switch (sort.trim().toLowerCase()) {
            case "latest" -> "LATEST";
            case "likes", "recommend", "recommended" -> "LIKES";
            case "views" -> "VIEWS";
            case "comments" -> "COMMENTS";
            default -> "LATEST";
        };
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return keyword.trim();
    }

    private long clampSize(long size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 100);
    }

    private OffsetDateTime resolvePeriodStart(String period) {
        ZoneId zoneId = ZoneId.of("Asia/Seoul");
        return switch (period == null ? "daily" : period.trim().toLowerCase()) {
            case "weekly" -> OffsetDateTime.now(zoneId).minusDays(7).truncatedTo(ChronoUnit.SECONDS);
            case "monthly" -> OffsetDateTime.now(zoneId).minusDays(30).truncatedTo(ChronoUnit.SECONDS);
            default -> OffsetDateTime.now(zoneId).minusDays(1).truncatedTo(ChronoUnit.SECONDS);
        };
    }

    private PostSummaryResponse toSummaryResponse(PostRow post) {
        return toSummaryResponse(post, post.viewCount());
    }

    private PostSummaryResponse toSummaryResponse(PostRow post, long viewCount) {
        BoardRow canonicalBoard = BoardCatalog.defaultBoardRow(post.boardSlug()).orElse(null);
        String boardName = canonicalBoard != null ? canonicalBoard.boardName() : post.boardName();
        String className = canonicalBoard != null ? canonicalBoard.className() : post.className();
        String categoryName = canonicalCategoryName(post.boardType(), post.categoryCode(), post.categoryName());

        return new PostSummaryResponse(
            post.id(),
            post.boardId(),
            post.boardSlug(),
            post.boardType(),
            boardName,
            post.classCode(),
            className,
            post.categoryCode(),
            categoryName,
            post.userId(),
            post.author(),
            post.title(),
            post.content(),
            viewCount,
            post.likeCount(),
            post.commentCount(),
            post.pinned(),
            post.status(),
            post.createdAt(),
            post.updatedAt()
        );
    }

    private String canonicalCategoryName(String boardType, String categoryCode, String fallback) {
        if (categoryCode == null || categoryCode.isBlank()) {
            return fallback;
        }

        return BoardCatalog.defaultCategories(boardType).stream()
            .filter(category -> category.categoryCode().equalsIgnoreCase(categoryCode))
            .map(com.loahub.board.dto.BoardCategoryResponse::categoryName)
            .findFirst()
            .orElse(fallback);
    }

    private CommentResponse toCommentResponse(com.loahub.comment.model.CommentRow comment) {
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

    private void ensureCanPin(boolean pinned) {
        if (pinned && !SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("공지글은 관리자만 등록할 수 있습니다.");
        }
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
