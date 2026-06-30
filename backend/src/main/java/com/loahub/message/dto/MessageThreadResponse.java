package com.loahub.message.dto;

import java.time.OffsetDateTime;

public record MessageThreadResponse(
    long threadId,
    long opponentId,
    String opponentNickname,
    String opponentMainCharacterName,
    String lastMessage,
    OffsetDateTime lastMessageAt,
    long unreadCount
) {
}
