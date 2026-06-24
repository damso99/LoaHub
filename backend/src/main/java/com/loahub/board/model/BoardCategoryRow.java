package com.loahub.board.model;

import java.time.OffsetDateTime;

public record BoardCategoryRow(
    long id,
    String boardType,
    String categoryCode,
    String categoryName,
    int sortOrder,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
