package com.loahub.message.dto;

import java.time.OffsetDateTime;

public record MessageNotificationResponse(
    long threadId,
    long messageId,
    long senderId,
    String senderNickname,
    String preview,
    OffsetDateTime createdAt,
    long unreadCount
) {
}
