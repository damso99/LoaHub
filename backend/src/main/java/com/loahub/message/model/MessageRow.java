package com.loahub.message.model;

import java.time.OffsetDateTime;

public record MessageRow(
    long id,
    long threadId,
    long senderId,
    long receiverId,
    String content,
    boolean readYn,
    boolean deletedBySender,
    boolean deletedByReceiver,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
