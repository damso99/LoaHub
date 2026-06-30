package com.loahub.message.model;

import java.time.OffsetDateTime;

public record MessageThreadRow(
    long id,
    long senderId,
    long receiverId,
    String lastMessage,
    OffsetDateTime lastMessageAt,
    boolean senderDeleted,
    boolean receiverDeleted,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
}
