package com.loahub.board;

import com.loahub.board.model.BoardCategoryRow;
import com.loahub.board.model.BoardRow;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BoardMapper {
    List<BoardRow> findBoards();

    Optional<BoardRow> findBoardBySlug(@Param("slug") String slug);

    List<BoardCategoryRow> findCategoriesByBoardType(@Param("boardType") String boardType);
}
