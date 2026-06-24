package com.loahub.board.model;

import java.time.OffsetDateTime;

public record BoardRow(
    long id,
    String slug,
    String boardType,
    String boardName,
    String classCode,
    String className,
    int sortOrder,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
