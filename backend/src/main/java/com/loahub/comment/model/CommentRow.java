package com.loahub.comment.model;

import java.time.OffsetDateTime;

public record CommentRow(
    long id,
    long postId,
    long userId,
    String author,
    String content,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
