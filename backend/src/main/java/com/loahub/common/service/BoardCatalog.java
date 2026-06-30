package com.loahub.common.service;

import com.loahub.board.dto.BoardCategoryResponse;
import com.loahub.board.model.BoardRow;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

final class BoardCatalog {
    private static final List<BoardDefinition> DEFAULT_BOARDS = List.of(
        new BoardDefinition(1, "free", "FREE", "자유게시판", null, null, 1),
        new BoardDefinition(2, "class/warlord", "CLASS", "워로드 게시판", "warlord", "워로드", 2),
        new BoardDefinition(3, "class/paladin", "CLASS", "팔라딘 게시판", "paladin", "팔라딘", 3),
        new BoardDefinition(4, "class/bard", "CLASS", "바드 게시판", "bard", "바드", 4),
        new BoardDefinition(5, "class/sorceress", "CLASS", "소서리스 게시판", "sorceress", "소서리스", 5)
    );

    private BoardCatalog() {
    }

    static List<BoardRow> defaultBoardRows() {
        return DEFAULT_BOARDS.stream()
            .map(BoardCatalog::toBoardRow)
            .toList();
    }

    static Optional<BoardRow> defaultBoardRow(String slug) {
        String normalizedSlug = normalizeSlug(slug);
        return DEFAULT_BOARDS.stream()
            .filter(board -> board.slug().equals(normalizedSlug))
            .findFirst()
            .map(BoardCatalog::toBoardRow);
    }

    static List<BoardCategoryResponse> defaultCategories(String boardType) {
        return switch (normalizeBoardType(boardType)) {
            case "FREE" -> List.of(
                category(1, "FREE", "CHAT", "잡담", 1),
                category(2, "FREE", "INFO", "정보", 2),
                category(3, "FREE", "QUESTION", "질문", 3),
                category(4, "FREE", "GUIDE", "공략", 4),
                category(5, "FREE", "STREAM", "인방", 5),
                category(6, "FREE", "FUN", "웃긴글", 6),
                category(7, "FREE", "ETC", "기타", 7)
            );
            case "CLASS" -> List.of(
                category(8, "CLASS", "CHAT", "잡담", 1),
                category(9, "CLASS", "INFO", "정보", 2),
                category(10, "CLASS", "QUESTION", "질문", 3),
                category(11, "CLASS", "SETTING", "세팅", 4),
                category(12, "CLASS", "DPS", "전분", 5),
                category(13, "CLASS", "SKILL", "스킬트리", 6),
                category(14, "CLASS", "ETC", "기타", 7)
            );
            default -> List.of();
        };
    }

    static Optional<String> defaultCategoryCode(String boardType, String categoryCode) {
        String normalizedCategoryCode = normalizeCategoryCode(categoryCode);
        if (normalizedCategoryCode == null) {
            return Optional.empty();
        }

        return defaultCategories(boardType).stream()
            .filter(category -> category.categoryCode().equalsIgnoreCase(normalizedCategoryCode))
            .map(BoardCategoryResponse::categoryCode)
            .findFirst();
    }

    private static BoardRow toBoardRow(BoardDefinition definition) {
        OffsetDateTime now = OffsetDateTime.now();
        return new BoardRow(
            definition.id(),
            definition.slug(),
            definition.boardType(),
            definition.boardName(),
            definition.classCode(),
            definition.className(),
            definition.sortOrder(),
            "ACTIVE",
            now,
            now
        );
    }

    private static BoardCategoryResponse category(long id, String boardType, String categoryCode, String categoryName, int sortOrder) {
        return new BoardCategoryResponse(id, boardType, categoryCode, categoryName, sortOrder);
    }

    private static String normalizeSlug(String slug) {
        return slug == null || slug.isBlank() ? "free" : slug.trim();
    }

    private static String normalizeBoardType(String boardType) {
        return boardType == null ? "" : boardType.trim().toUpperCase();
    }

    private static String normalizeCategoryCode(String categoryCode) {
        return categoryCode == null || categoryCode.isBlank() ? null : categoryCode.trim().toUpperCase();
    }

    private record BoardDefinition(
        long id,
        String slug,
        String boardType,
        String boardName,
        String classCode,
        String className,
        int sortOrder
    ) {
    }
}
