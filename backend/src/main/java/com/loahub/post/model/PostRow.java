package com.loahub.post.model;

import java.time.OffsetDateTime;

public record PostRow(
    Long id,
    Long boardId,
    String boardSlug,
    String boardType,
    String boardName,
    String classCode,
    String className,
    String categoryCode,
    String categoryName,
    Long userId,
    String author,
    String title,
    String content,
    Long viewCount,
    Long likeCount,
    Long commentCount,
    Boolean pinned,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
