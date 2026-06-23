package com.loahub.common.mapper;

import com.loahub.common.model.DomainModels.LostArkCalendarSyncLog;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface LostArkCalendarSyncLogMapper {
    void insertLog(LostArkCalendarSyncLog log);

    void updateSuccess(
        @Param("id") String id,
        @Param("weekStartDate") LocalDate weekStartDate,
        @Param("weekEndDate") LocalDate weekEndDate,
        @Param("fetchedCount") Integer fetchedCount,
        @Param("filteredCount") Integer filteredCount,
        @Param("savedCount") Integer savedCount,
        @Param("message") String message,
        @Param("finishedAt") OffsetDateTime finishedAt
    );

    void updateFail(
        @Param("id") String id,
        @Param("weekStartDate") LocalDate weekStartDate,
        @Param("weekEndDate") LocalDate weekEndDate,
        @Param("fetchedCount") Integer fetchedCount,
        @Param("filteredCount") Integer filteredCount,
        @Param("savedCount") Integer savedCount,
        @Param("message") String message,
        @Param("errorMessage") String errorMessage,
        @Param("finishedAt") OffsetDateTime finishedAt
    );
}
