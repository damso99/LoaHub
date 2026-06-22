package com.loahub.common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class Requests {
    private Requests() {
    }

    public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String nickname,
        @NotBlank String mainCharacterName
    ) {
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record UpdateProfileRequest(String nickname, String bio) {
    }

    public record MainCharacterRequest(@NotBlank String characterName) {
    }

    public record CharacterSearchRequest(String name) {
    }

    public record CharacterSaveRequest(
        @NotBlank String characterName,
        @NotBlank String serverName,
        @NotBlank String characterClass,
        double itemLevel,
        String characterImage,
        boolean main
    ) {
    }

    public record PostRequest(
        long boardId,
        String title,
        String content,
        String className
    ) {
    }

    public record CommentRequest(@NotBlank String content) {
    }

    public record NotificationRequest(long contentId, boolean enabled, int notifyBeforeMinutes) {
    }

    public record MessageRequest(long receiverId, String title, String content) {
    }
}

