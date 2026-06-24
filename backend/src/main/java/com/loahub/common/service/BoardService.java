package com.loahub.common.service;

import com.loahub.board.BoardMapper;
import com.loahub.board.dto.BoardCategoryResponse;
import com.loahub.board.dto.BoardResponse;
import com.loahub.common.dto.ApiResponse;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
    private final BoardMapper boardMapper;

    public BoardService(BoardMapper boardMapper) {
        this.boardMapper = boardMapper;
    }

    public ApiResponse<List<BoardResponse>> getBoards() {
        List<BoardResponse> boards = boardMapper.findBoards().stream()
            .map(board -> {
                List<BoardCategoryResponse> categories = boardMapper.findCategoriesByBoardType(board.boardType()).stream()
                    .map(category -> new BoardCategoryResponse(
                        category.id(),
                        category.boardType(),
                        category.categoryCode(),
                        category.categoryName(),
                        category.sortOrder()
                    ))
                    .toList();

                return new BoardResponse(
                    board.id(),
                    board.slug(),
                    board.boardType(),
                    board.boardName(),
                    board.classCode(),
                    board.className(),
                    board.sortOrder(),
                    categories
                );
            })
            .collect(Collectors.toList());

        return ApiResponse.ok("게시판 목록을 불러왔습니다.", boards);
    }
}
