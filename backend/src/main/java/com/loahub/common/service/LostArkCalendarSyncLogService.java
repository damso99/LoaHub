package com.loahub.common.service;

import com.loahub.common.mapper.LostArkCalendarSyncLogMapper;
import com.loahub.common.model.DomainModels.LostArkCalendarSyncLog;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

@Service
public class LostArkCalendarSyncLogService {
    private final LostArkCalendarSyncLogMapper mapper;

    public LostArkCalendarSyncLogService(LostArkCalendarSyncLogMapper mapper) {
        this.mapper = mapper;
    }

    public String start(String syncType) {
        String id = UUID.randomUUID().toString();
        mapper.insertLog(new LostArkCalendarSyncLog(
            id,
            syncType,
            "RUNNING",
            null,
            null,
            null,
            null,
            null,
            "캘린더 동기화를 시작했습니다.",
            null,
            now(),
            null
        ));
        return id;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void success(String id, LocalDate weekStartDate, LocalDate weekEndDate, int fetchedCount, int filteredCount, int savedCount) {
        mapper.updateSuccess(
            id,
            weekStartDate,
            weekEndDate,
            fetchedCount,
            filteredCount,
            savedCount,
            "캘린더 동기화가 완료되었습니다.",
            now()
        );
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void fail(
        String id,
        LocalDate weekStartDate,
        LocalDate weekEndDate,
        Integer fetchedCount,
        Integer filteredCount,
        Integer savedCount,
        String errorMessage
    ) {
        mapper.updateFail(
            id,
            weekStartDate,
            weekEndDate,
            fetchedCount,
            filteredCount,
            savedCount,
            "캘린더 동기화에 실패했습니다.",
            errorMessage,
            now()
        );
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(ZoneId.of("Asia/Seoul"));
    }
}
