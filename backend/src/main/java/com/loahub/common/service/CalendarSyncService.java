package com.loahub.common.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.CalendarRewardResponse;
import com.loahub.common.dto.CalendarSyncResult;
import com.loahub.common.dto.LostArkCalendarResponseItem;
import com.loahub.common.dto.RewardGroup;
import com.loahub.common.dto.RewardItem;
import com.loahub.common.mapper.LostArkCalendarScheduleMapper;
import com.loahub.common.model.DomainModels.LostArkCalendarSchedule;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CalendarSyncService {
    private static final Logger log = LoggerFactory.getLogger(CalendarSyncService.class);
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final Set<String> TARGET_CATEGORIES = Set.of("모험 섬", "필드보스", "카오스게이트");
    private static final List<String> TARGET_SLOTS = List.of("11:00", "13:00", "19:00", "21:00", "23:00");
    private static final Map<String, String> CHAOS_SLOT_MAP = Map.of(
        "11:50", "11:00",
        "13:50", "13:00",
        "19:50", "19:00",
        "21:50", "21:00",
        "23:50", "23:00"
    );
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final DateTimeFormatter LEGACY_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final LostArkCalendarClient client;
    private final LostArkCalendarScheduleMapper scheduleMapper;
    private final LostArkCalendarSyncLogService syncLogService;
    private final TransactionTemplate transactionTemplate;
    private final ObjectMapper objectMapper;

    public CalendarSyncService(
        LostArkCalendarClient client,
        LostArkCalendarScheduleMapper scheduleMapper,
        LostArkCalendarSyncLogService syncLogService,
        org.springframework.transaction.PlatformTransactionManager transactionManager
    ) {
        this.client = client;
        this.scheduleMapper = scheduleMapper;
        this.syncLogService = syncLogService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.objectMapper = new ObjectMapper();
    }

    public CalendarSyncResult syncCurrentCalendar() {
        LocalDate baseDate = resolveScheduleDate();
        LocalDate weekStartDate = resolveWeekStartDate(baseDate);
        LocalDate weekEndDate = resolveWeekEndDate(weekStartDate);

        log.info("Calendar sync started. baseDate={}, weekStart={}, weekEnd={}", baseDate, weekStartDate, weekEndDate);

        SyncBatch batch = syncTodaySchedule(baseDate);
        CalendarSyncResult result = new CalendarSyncResult(
            "ok",
            "calendar synced",
            baseDate,
            weekStartDate,
            weekEndDate,
            LocalDateTime.now(KST),
            batch.fetchedCount(),
            batch.filteredCount(),
            batch.savedCount()
        );

        log.info("Calendar sync completed. syncedDays={}", batch.syncedDateCount());
        return result;
    }

    public SyncBatch syncTodaySchedule(LocalDate baseDate) {
        LocalDate normalizedBaseDate = baseDate == null ? resolveScheduleDate() : baseDate;
        LocalDate weekStartDate = resolveWeekStartDate(normalizedBaseDate);
        LocalDate weekEndDate = resolveWeekEndDate(weekStartDate);
        return syncWeekScheduleBatch(weekStartDate, weekEndDate);
    }

    public void syncWeekSchedule(LocalDate weekStartDate, LocalDate weekEndDate) {
        syncWeekScheduleBatch(weekStartDate, weekEndDate);
    }

    private SyncBatch syncWeekScheduleBatch(LocalDate weekStartDate, LocalDate weekEndDate) {
        String logId = syncLogService.start("MANUAL");

        try {
            List<LostArkCalendarResponseItem> sourceItems = client.fetchWeeklyCalendar();
            SyncBatch batch = normalize(sourceItems, weekStartDate, weekEndDate);

            transactionTemplate.executeWithoutResult(status -> {
                scheduleMapper.deleteAllSchedules();
                if (!batch.schedules().isEmpty()) {
                    scheduleMapper.insertSchedules(batch.schedules());
                }
            });

            syncLogService.success(logId, weekStartDate, weekEndDate, batch.fetchedCount(), batch.filteredCount(), batch.savedCount());
            return batch;
        } catch (Exception exception) {
            syncLogService.fail(
                logId,
                weekStartDate,
                weekEndDate,
                null,
                null,
                null,
                safeMessage(exception)
            );
            if (exception instanceof ResponseStatusException responseStatusException) {
                throw responseStatusException;
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 캘린더 동기화에 실패했습니다.", exception);
        }
    }

    private SyncBatch normalize(List<LostArkCalendarResponseItem> sourceItems, LocalDate weekStartDate, LocalDate weekEndDate) {
        List<ScheduleDraft> drafts = new ArrayList<>();

        for (LostArkCalendarResponseItem item : sourceItems) {
            if (!TARGET_CATEGORIES.contains(trim(item.categoryName()))) {
                continue;
            }

            List<String> startTimes = safeList(item.startTimes());
            for (String rawStartTime : startTimes) {
                LocalDateTime startTime = parseDateTime(rawStartTime);
                if (startTime == null) {
                    continue;
                }

                LocalDate startDate = startTime.toLocalDate();
                if ((weekStartDate != null && startDate.isBefore(weekStartDate)) || (weekEndDate != null && startDate.isAfter(weekEndDate))) {
                    continue;
                }

                String startHhmm = formatTime(startTime);
                String slotHhmm = resolveSlot(item.categoryName(), startHhmm);
                if (slotHhmm == null) {
                    continue;
                }

                List<CalendarRewardResponse> rewards = resolveRewards(item.rewardItems(), startTime);
                drafts.add(new ScheduleDraft(item, startTime, startHhmm, slotHhmm, rewards));
            }
        }

        if (drafts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 캘린더 응답에 유효한 일정이 없습니다.");
        }

        Map<String, LostArkCalendarSchedule> unique = new LinkedHashMap<>();
        OffsetDateTime now = OffsetDateTime.now(KST);
        for (ScheduleDraft draft : drafts) {
            LostArkCalendarSchedule schedule = new LostArkCalendarSchedule(
                UUID.randomUUID().toString(),
                weekStartDate,
                weekEndDate,
                trim(draft.item().categoryName()),
                trim(draft.item().contentsName()),
                trim(draft.item().contentsIcon()),
                draft.item().minItemLevel(),
                trim(draft.item().location()),
                draft.startTime(),
                draft.startTime().toLocalDate(),
                draft.startHhmm(),
                draft.slotHhmm(),
                toJson(draft.rewards()),
                toJson(draft.item()),
                true,
                now,
                now
            );
            String dedupeKey = schedule.categoryName() + "|" + schedule.contentsName() + "|" + schedule.location() + "|" + schedule.startTimeKst();
            unique.putIfAbsent(dedupeKey, schedule);
        }

        List<LostArkCalendarSchedule> schedules = new ArrayList<>(unique.values());
        schedules.sort(Comparator
            .comparing(LostArkCalendarSchedule::startDate, Comparator.nullsLast(LocalDate::compareTo))
            .thenComparing(LostArkCalendarSchedule::slotHhmm, Comparator.nullsLast(String::compareTo))
            .thenComparing(LostArkCalendarSchedule::categoryName, Comparator.nullsLast(String::compareTo))
            .thenComparing(LostArkCalendarSchedule::startTimeKst, Comparator.nullsLast(LocalDateTime::compareTo)));

        long syncedDateCount = schedules.stream()
            .map(LostArkCalendarSchedule::startDate)
            .filter(Objects::nonNull)
            .distinct()
            .count();

        return new SyncBatch(
            weekStartDate,
            weekEndDate,
            sourceItems.size(),
            drafts.size(),
            schedules.size(),
            syncedDateCount,
            schedules
        );
    }

    private LocalDate resolveScheduleDate() {
        LocalDateTime now = LocalDateTime.now(KST);
        if (now.toLocalTime().isBefore(LocalTime.of(6, 0))) {
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
    }

    private LocalDate resolveWeekStartDate(LocalDate baseDate) {
        LocalDate normalizedBaseDate = baseDate == null ? resolveScheduleDate() : baseDate;
        return normalizedBaseDate.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
    }

    private LocalDate resolveWeekEndDate(LocalDate weekStartDate) {
        return (weekStartDate == null ? resolveWeekStartDate(resolveScheduleDate()) : weekStartDate).plusDays(6);
    }

    private List<CalendarRewardResponse> resolveRewards(List<RewardGroup> rewardGroups, LocalDateTime startTime) {
        if (rewardGroups == null || rewardGroups.isEmpty()) {
            return List.of();
        }

        List<RewardItem> rewardItems = rewardGroups.stream()
            .filter(Objects::nonNull)
            .flatMap(group -> group.rewardItems() == null ? Stream.empty() : group.rewardItems().stream())
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        LinkedHashSet<String> seen = new LinkedHashSet<>();
        List<CalendarRewardResponse> rewards = new ArrayList<>();
        for (RewardItem rewardItem : rewardItems) {
            if (!matchesRewardStartTimes(rewardItem.startTimes(), startTime)) {
                continue;
            }

            CalendarRewardResponse reward = new CalendarRewardResponse(trim(rewardItem.name()), trim(rewardItem.icon()), trim(rewardItem.grade()), trim(rewardItem.icon()));
            String key = reward.name() + "|" + reward.icon() + "|" + reward.grade();
            if (seen.add(key)) {
                rewards.add(reward);
            }
        }
        return rewards;
    }

    private boolean matchesRewardStartTimes(List<String> startTimes, LocalDateTime scheduleStartTime) {
        if (startTimes == null || startTimes.isEmpty()) {
            return true;
        }

        for (String candidate : startTimes) {
            LocalDateTime parsed = parseDateTime(candidate);
            if (parsed != null && parsed.equals(scheduleStartTime)) {
                return true;
            }
            if (candidate != null && candidate.trim().equalsIgnoreCase(formatDateTime(scheduleStartTime))) {
                return true;
            }
        }
        return false;
    }

    private String resolveSlot(String categoryName, String startHhmm) {
        String normalizedCategory = trim(categoryName);
        if ("카오스게이트".equals(normalizedCategory)) {
            return CHAOS_SLOT_MAP.get(startHhmm);
        }
        if ("모험 섬".equals(normalizedCategory) || "필드보스".equals(normalizedCategory)) {
            return TARGET_SLOTS.contains(startHhmm) ? startHhmm : null;
        }
        return null;
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim();
        for (DateTimeFormatter formatter : List.of(DATE_TIME_FORMATTER, LEGACY_DATE_TIME_FORMATTER)) {
            try {
                return LocalDateTime.parse(normalized, formatter);
            } catch (Exception ignored) {
            }
        }

        try {
            return LocalDateTime.parse(normalized);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String formatTime(LocalDateTime dateTime) {
        return TIME_FORMATTER.format(dateTime);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return DATE_TIME_FORMATTER.format(dateTime);
    }

    private String safeMessage(Exception exception) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? exception.getClass().getSimpleName() : message;
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 캘린더 데이터를 저장할 수 없습니다.", exception);
        }
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private record ScheduleDraft(
        LostArkCalendarResponseItem item,
        LocalDateTime startTime,
        String startHhmm,
        String slotHhmm,
        List<CalendarRewardResponse> rewards
    ) {
    }

    public record SyncBatch(
        LocalDate weekStartDate,
        LocalDate weekEndDate,
        int fetchedCount,
        int filteredCount,
        int savedCount,
        long syncedDateCount,
        List<LostArkCalendarSchedule> schedules
    ) {
    }
}
