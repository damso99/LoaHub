package com.loahub.board.dto;

public record BoardCategoryResponse(
    long id,
    String boardType,
    String categoryCode,
    String categoryName,
    int sortOrder
) {
}
