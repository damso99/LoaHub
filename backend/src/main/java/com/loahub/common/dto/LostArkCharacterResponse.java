package com.loahub.common.dto;

public record LostArkCharacterResponse(
    String characterName,
    String serverName,
    String characterClassName,
    String itemAvgLevel,
    String characterLevel,
    String expeditionLevel,
    String pvpGradeName,
    String townLevel,
    String townName,
    String title,
    String guildName,
    String characterImage
) {
}
