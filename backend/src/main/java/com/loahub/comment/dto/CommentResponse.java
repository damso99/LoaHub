package com.loahub.comment.dto;

import java.time.OffsetDateTime;

public record CommentResponse(
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
