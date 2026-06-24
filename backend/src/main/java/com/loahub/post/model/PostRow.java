package com.loahub.post.model;

import java.time.OffsetDateTime;

public record PostRow(
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
    String content,
    long viewCount,
    long likeCount,
    long commentCount,
    boolean pinned,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
