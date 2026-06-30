package com.loahub.post;

import com.loahub.post.command.PostWriteCommand;
import com.loahub.post.model.PostRow;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PostMapper {
    List<PostRow> findPosts(
        @Param("boardId") long boardId,
        @Param("categoryCode") String categoryCode,
        @Param("sort") String sort,
        @Param("offset") long offset,
        @Param("size") long size
    );

    long countPosts(
        @Param("boardId") long boardId,
        @Param("categoryCode") String categoryCode
    );

    Optional<PostRow> findPostById(@Param("postId") long postId);

    Optional<PostRow> findPostByIdForUpdate(@Param("postId") long postId);

    Optional<Long> findActivePostId(@Param("postId") long postId);

    int insertPost(PostWriteCommand command);

    int updatePost(PostWriteCommand command);

    int softDeletePost(@Param("postId") long postId);

    int incrementViewCount(@Param("postId") long postId);

    int increaseLikeCount(@Param("postId") long postId);

    int decreaseLikeCount(@Param("postId") long postId);

    int increaseCommentCount(@Param("postId") long postId);

    int decreaseCommentCount(@Param("postId") long postId);

    int countPostLike(
        @Param("postId") long postId,
        @Param("userId") long userId
    );

    int insertPostLike(
        @Param("postId") long postId,
        @Param("userId") long userId
    );

    int deletePostLike(
        @Param("postId") long postId,
        @Param("userId") long userId
    );

    List<PostRow> findBestPosts(
        @Param("boardId") long boardId,
        @Param("categoryCode") String categoryCode,
        @Param("startAt") OffsetDateTime startAt,
        @Param("limit") long limit
    );
}
