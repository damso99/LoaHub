package com.loahub.board;

import com.loahub.common.dto.ApiResponse;
import com.loahub.common.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getBoards() {
        return ResponseEntity.ok(boardService.getBoards());
    }
}
