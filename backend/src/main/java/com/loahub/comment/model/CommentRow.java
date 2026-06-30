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
    public CommentRow(
        Long id,
        Long postId,
        Long userId,
        String author,
        String content,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
        this(
            id == null ? 0L : id,
            postId == null ? 0L : postId,
            userId == null ? 0L : userId,
            author,
            content,
            status,
            createdAt,
            updatedAt
        );
    }
}
