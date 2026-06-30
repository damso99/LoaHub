package com.loahub.board.model;

import java.time.OffsetDateTime;

public record BoardCategoryRow(
    Long id,
    String boardType,
    String categoryCode,
    String categoryName,
    Integer sortOrder,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
