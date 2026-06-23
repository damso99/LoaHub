package com.loahub.common.model;

import java.time.OffsetDateTime;
import java.util.List;

public final class DomainModels {
    private DomainModels() {
    }

    public record User(
        long id,
        String email,
        String password,
        String nickname,
        String provider,
        String providerId,
        String role,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
    }

    public record UserProfile(
        long id,
        long userId,
        String mainCharacterName,
        String serverName,
        String characterClass,
        double itemLevel,
        String characterImage,
        String bio,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
    }

    public record Character(
        long id,
        long userId,
        String characterName,
        String serverName,
        String characterClass,
        double itemLevel,
        String characterImage,
        boolean main,
        OffsetDateTime createdAt
    ) {
    }

    public record Board(long id, String boardType, String boardName, String className, int sortOrder, OffsetDateTime createdAt) {
    }

    public record Post(
        long id,
        long boardId,
        long userId,
        String title,
        String content,
        long viewCount,
        long likeCount,
        long commentCount,
        String author,
        String className,
        boolean deletedYn,
        boolean pinned,
        List<String> tags,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
    }

    public record Comment(
        long id,
        long postId,
        long userId,
        String content,
        String author,
        boolean deletedYn,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
    }

    public record CalendarContent(
        long id,
        String contentName,
        String contentType,
        String startTime,
        String description,
        OffsetDateTime createdAt
    ) {
    }

    public record CalendarNotification(
        long id,
        long userId,
        long contentId,
        boolean enabled,
        int notifyBeforeMinutes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
    }

    public record WanderingMerchant(
        long id,
        String region,
        String merchantName,
        String spawnTime,
        List<String> items,
        String description,
        String serverName,
        OffsetDateTime createdAt
    ) {
    }

    public record MerchantFavorite(long id, long userId, long merchantId, OffsetDateTime createdAt) {
    }

    public record Message(
        long id,
        long senderId,
        long receiverId,
        String title,
        String content,
        boolean isRead,
        boolean deletedBySender,
        boolean deletedByReceiver,
        OffsetDateTime createdAt
    ) {
    }

    public record LostArkCalendarSchedule(
        String id,
        java.time.LocalDate weekStartDate,
        java.time.LocalDate weekEndDate,
        String categoryName,
        String contentsName,
        String contentsIcon,
        Integer minItemLevel,
        String location,
        java.time.LocalDateTime startTimeKst,
        java.time.LocalDate startDate,
        String startHhmm,
        String slotHhmm,
        String rewards,
        String rawContent,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
    ) {
    }

    public record LostArkCalendarSyncLog(
        String id,
        String syncType,
        String status,
        java.time.LocalDate weekStartDate,
        java.time.LocalDate weekEndDate,
        Integer fetchedCount,
        Integer filteredCount,
        Integer savedCount,
        String message,
        String errorMessage,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt
    ) {
    }
}
