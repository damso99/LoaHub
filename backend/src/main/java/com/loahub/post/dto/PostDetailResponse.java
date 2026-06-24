package com.loahub.post.dto;

import com.loahub.comment.dto.CommentResponse;
import java.util.List;

public record PostDetailResponse(
    PostSummaryResponse post,
    List<CommentResponse> comments
) {
}
