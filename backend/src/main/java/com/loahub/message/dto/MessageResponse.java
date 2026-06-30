package com.loahub.message.dto;

import java.time.OffsetDateTime;

public record MessageResponse(
    long id,
    long threadId,
    long senderId,
    String senderNickname,
    long receiverId,
    String receiverNickname,
    String content,
    boolean readYn,
    OffsetDateTime createdAt,
    boolean mine
) {
}
