package com.loahub.post.dto;

import java.time.OffsetDateTime;

public record PostSummaryResponse(
    long id,
    long boardId,
    String boardSlug,
    String boardType,
    String boardName,
    String classCode,
    String className,
    String categoryCode,
    String categoryName,
    long userId,
    String author,
    String title,
    long viewCount,
    long likeCount,
    long commentCount,
    boolean pinned,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
