package com.loahub.board.dto;

import java.util.List;

public record BoardResponse(
    long id,
    String slug,
    String boardType,
    String boardName,
    String classCode,
    String className,
    int sortOrder,
    List<BoardCategoryResponse> categories
) {
}
