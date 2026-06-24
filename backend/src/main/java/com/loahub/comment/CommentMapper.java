package com.loahub.comment;

import com.loahub.comment.command.CommentWriteCommand;
import com.loahub.comment.model.CommentRow;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CommentMapper {
    List<CommentRow> findCommentsByPostId(@Param("postId") long postId);

    Optional<CommentRow> findCommentById(@Param("commentId") long commentId);

    int insertComment(CommentWriteCommand command);

    int softDeleteComment(@Param("commentId") long commentId);
}
