package com.loahub.auth.dto;

public record RegisterResponse(
    Long id,
    String email,
    String nickname,
    String mainCharacterName,
    String message
) {
}
