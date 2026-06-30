package com.loahub.common.service;

import com.loahub.board.BoardMapper;
import com.loahub.board.dto.BoardCategoryResponse;
import com.loahub.board.dto.BoardResponse;
import com.loahub.board.model.BoardRow;
import com.loahub.common.dto.ApiResponse;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
    private static final Logger log = LoggerFactory.getLogger(BoardService.class);

    private final BoardMapper boardMapper;

    public BoardService(BoardMapper boardMapper) {
        this.boardMapper = boardMapper;
    }

    public ApiResponse<List<BoardResponse>> getBoards() {
        List<BoardRow> boardRows = loadBoardRows();
        List<BoardResponse> boards = new ArrayList<>(boardRows.size());

        for (BoardRow board : boardRows) {
            boards.add(toResponse(board));
        }

        return ApiResponse.ok("게시판 목록을 불러왔습니다.", boards);
    }

    private List<BoardRow> loadBoardRows() {
        try {
            List<BoardRow> boardRows = boardMapper.findBoards();
            if (!boardRows.isEmpty()) {
                return boardRows;
            }
        } catch (DataAccessException exception) {
            log.warn("게시판 목록 조회에 실패하여 기본 게시판 목록을 사용합니다.", exception);
        }

        return BoardCatalog.defaultBoardRows();
    }

    private BoardResponse toResponse(BoardRow board) {
        return new BoardResponse(
            board.id(),
            board.slug(),
            board.boardType(),
            board.boardName(),
            board.classCode(),
            board.className(),
            board.sortOrder(),
            loadCategories(board.boardType())
        );
    }

    private List<BoardCategoryResponse> loadCategories(String boardType) {
        try {
            List<BoardCategoryResponse> categories = boardMapper.findCategoriesByBoardType(boardType).stream()
                .map(category -> new BoardCategoryResponse(
                    category.id(),
                    category.boardType(),
                    category.categoryCode(),
                    category.categoryName(),
                    category.sortOrder()
                ))
                .toList();

            if (!categories.isEmpty()) {
                return categories;
            }
        } catch (DataAccessException exception) {
            log.warn("게시판 카테고리 조회에 실패하여 기본 카테고리를 사용합니다. boardType={}", boardType, exception);
        }

        return BoardCatalog.defaultCategories(boardType);
    }
}
