package com.loahub.board.model;

import java.time.OffsetDateTime;

public record BoardRow(
    Long id,
    String slug,
    String boardType,
    String boardName,
    String classCode,
    String className,
    Integer sortOrder,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
