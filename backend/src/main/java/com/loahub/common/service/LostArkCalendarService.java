package com.loahub.common.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.CalendarRewardResponse;
import com.loahub.common.dto.LostArkCalendarDayResponse;
import com.loahub.common.dto.LostArkCalendarResponseItem;
import com.loahub.common.dto.LostArkCalendarTodayItemResponse;
import com.loahub.common.dto.LostArkCalendarTodayResponse;
import com.loahub.common.dto.LostArkCalendarScheduleResponse;
import com.loahub.common.dto.LostArkCalendarSlotGroupResponse;
import com.loahub.common.dto.LostArkCalendarSyncResponse;
import com.loahub.common.dto.LostArkCalendarWeekResponse;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.Locale;
import java.util.stream.Stream;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LostArkCalendarService {
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
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final LostArkCalendarClient client;
    private final LostArkCalendarScheduleMapper scheduleMapper;
    private final LostArkCalendarSyncLogService syncLogService;
    private final TransactionTemplate transactionTemplate;
    private final ObjectMapper objectMapper;

    public LostArkCalendarService(
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

    public LostArkCalendarSyncResponse refreshWeeklyCalendar() {
        return syncCalendar("MANUAL");
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 6 * * WED", zone = "Asia/Seoul")
    public void refreshLostArkWeeklyCalendar() {
        try {
            syncCalendar("SCHEDULED");
        } catch (Exception ignored) {
            // 스케줄러는 실패해도 애플리케이션을 중단하지 않는다.
        }
    }

    public LostArkCalendarTodayResponse today() {
        ZoneId zoneId = ZoneId.of("Asia/Seoul");
        LocalDateTime now = LocalDateTime.now(zoneId);
        LocalDate baseDate = now.toLocalDate();
        LocalDateTime startTime = now.toLocalTime().isBefore(LocalTime.of(6, 0))
            ? baseDate.minusDays(1).atTime(6, 0)
            : baseDate.atTime(6, 0);
        LocalDateTime endTime = startTime.plusDays(1);

        List<LostArkCalendarSchedule> schedules = scheduleMapper.findActiveByStartTimeRange(startTime, endTime);
        return new LostArkCalendarTodayResponse(
            buildTodaySection(schedules, "모험섬"),
            buildTodaySection(schedules, "카게"),
            buildTodaySection(schedules, "필보")
        );
    }

    public LostArkCalendarWeekResponse week() {
        List<LostArkCalendarSchedule> schedules = scheduleMapper.findActiveWeek();
        if (schedules.isEmpty()) {
            return new LostArkCalendarWeekResponse(null, null, List.of());
        }

        LocalDate weekStartDate = schedules.stream()
            .map(LostArkCalendarSchedule::weekStartDate)
            .filter(Objects::nonNull)
            .min(LocalDate::compareTo)
            .orElse(null);
        LocalDate weekEndDate = schedules.stream()
            .map(LostArkCalendarSchedule::weekEndDate)
            .filter(Objects::nonNull)
            .max(LocalDate::compareTo)
            .orElse(null);

        List<LostArkCalendarDayResponse> days = new ArrayList<>();
        if (weekStartDate != null && weekEndDate != null) {
            LocalDate cursor = weekStartDate;
            while (!cursor.isAfter(weekEndDate)) {
                days.add(buildDayResponse(cursor, filterByDate(schedules, cursor)));
                cursor = cursor.plusDays(1);
            }
        }

        return new LostArkCalendarWeekResponse(
            formatDate(weekStartDate),
            formatDate(weekEndDate),
            days
        );
    }

    public LostArkCalendarDayResponse date(LocalDate date) {
        return buildDayResponse(date, scheduleMapper.findActiveByDate(date));
    }

    private List<LostArkCalendarTodayItemResponse> buildTodaySection(List<LostArkCalendarSchedule> schedules, String sectionType) {
        Map<String, LostArkCalendarTodayItemResponse> unique = new LinkedHashMap<>();
        schedules.stream()
            .filter(schedule -> sectionType.equals(resolveTodaySectionType(schedule)))
            .sorted(Comparator
                .comparing(LostArkCalendarSchedule::startTimeKst, Comparator.nullsLast(LocalDateTime::compareTo))
                .thenComparing(LostArkCalendarSchedule::contentsName, Comparator.nullsLast(String::compareTo)))
            .forEach(schedule -> {
                String startTime = formatShortTime(schedule.startTimeKst());
                String contentName = trim(schedule.contentsName());
                String dedupeKey = contentName + "|" + startTime;
                if (unique.containsKey(dedupeKey)) {
                    return;
                }

                List<CalendarRewardResponse> rewards = readRewards(schedule.rewards());
                String rewardText = rewards.isEmpty()
                    ? null
                    : rewards.stream()
                        .map(CalendarRewardResponse::name)
                        .filter(value -> value != null && !value.isBlank())
                        .collect(Collectors.joining(", "));
                String rewardType = rewards.isEmpty() ? null : firstNonBlank(rewards.get(0).grade(), "보상");
                unique.put(dedupeKey, new LostArkCalendarTodayItemResponse(
                    schedule.id(),
                    contentName,
                    sectionType,
                    startTime,
                    trim(schedule.contentsIcon()),
                    rewardType,
                    rewards,
                    rewards,
                    rewardText == null || rewardText.isBlank() ? null : rewardText
                ));
            });

        return List.copyOf(unique.values());
    }

    private String resolveTodaySectionType(LostArkCalendarSchedule schedule) {
        String categoryName = normalizeCategoryKey(schedule.categoryName());
        String contentName = normalizeCategoryKey(schedule.contentsName());
        String rawContent = normalizeCategoryKey(schedule.rawContent());

        if (matchesTodayCategory(categoryName, contentName, rawContent, "모험섬", "ADVENTUREISLAND")) {
            return "모험섬";
        }
        if (matchesTodayCategory(categoryName, contentName, rawContent, "카오스게이트", "카게", "CHAOSGATE")) {
            return "카게";
        }
        if (matchesTodayCategory(categoryName, contentName, rawContent, "필드보스", "필보", "FIELDBOSS")) {
            return "필보";
        }
        return null;
    }

    private boolean matchesTodayCategory(String categoryName, String contentsName, String rawContent, String... aliases) {
        for (String alias : aliases) {
            String normalizedAlias = normalizeCategoryKey(alias);
            if (normalizedAlias.isBlank()) {
                continue;
            }
            if (normalizedAlias.equals(categoryName) || normalizedAlias.equals(contentsName) || normalizedAlias.equals(rawContent)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeCategoryKey(String value) {
        if (value == null) {
            return "";
        }
        return value.trim()
            .replaceAll("[\\s_\\-]", "")
            .toUpperCase(Locale.ROOT);
    }

    private String formatShortTime(LocalDateTime dateTime) {
        return dateTime == null ? null : TIME_FORMATTER.format(dateTime);
    }

    private LostArkCalendarSyncResponse syncCalendar(String syncType) {
        String logId = syncLogService.start(syncType);
        SyncBatch batch = null;

        try {
            List<LostArkCalendarResponseItem> sourceItems = client.fetchWeeklyCalendar();
            batch = normalize(sourceItems);
            final LocalDate finalWeekStartDate = batch.weekStartDate();
            final LocalDate finalWeekEndDate = batch.weekEndDate();
            final List<LostArkCalendarSchedule> finalSchedules = batch.schedules();
            transactionTemplate.executeWithoutResult(status -> {
                scheduleMapper.deleteByWeekRange(finalWeekStartDate, finalWeekEndDate);
                if (!finalSchedules.isEmpty()) {
                    scheduleMapper.insertSchedules(finalSchedules);
                }
            });
            syncLogService.success(logId, finalWeekStartDate, finalWeekEndDate, batch.fetchedCount(), batch.filteredCount(), batch.savedCount());
            return new LostArkCalendarSyncResponse("SUCCESS", batch.fetchedCount(), batch.filteredCount(), batch.savedCount());
        } catch (Exception exception) {
            syncLogService.fail(
                logId,
                batch == null ? null : batch.weekStartDate(),
                batch == null ? null : batch.weekEndDate(),
                batch == null ? null : batch.fetchedCount(),
                batch == null ? null : batch.filteredCount(),
                batch == null ? null : batch.savedCount(),
                safeMessage(exception)
            );
            if (exception instanceof ResponseStatusException responseStatusException) {
                throw responseStatusException;
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 캘린더 동기화에 실패했습니다.", exception);
        }
    }

    private SyncBatch normalize(List<LostArkCalendarResponseItem> sourceItems) {
        List<ScheduleDraft> drafts = new ArrayList<>();
        List<LocalDateTime> allStartTimes = new ArrayList<>();

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

                String startHhmm = formatTime(startTime);
                String slotHhmm = resolveSlot(item.categoryName(), startHhmm);
                if (slotHhmm == null) {
                    continue;
                }

                List<CalendarRewardResponse> rewards = resolveRewards(item.rewardItems(), startTime);
                drafts.add(new ScheduleDraft(item, startTime, startHhmm, slotHhmm, rewards));
                allStartTimes.add(startTime);
            }
        }

        if (allStartTimes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "로스트아크 캘린더 응답에 유효한 일정이 없습니다.");
        }

        LocalDate weekStartDate = allStartTimes.stream()
            .map(LocalDateTime::toLocalDate)
            .min(LocalDate::compareTo)
            .orElseThrow();
        LocalDate weekEndDate = allStartTimes.stream()
            .map(LocalDateTime::toLocalDate)
            .max(LocalDate::compareTo)
            .orElseThrow();

        Map<String, LostArkCalendarSchedule> unique = new LinkedHashMap<>();
        OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Asia/Seoul"));
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

        return new SyncBatch(weekStartDate, weekEndDate, sourceItems.size(), drafts.size(), schedules.size(), schedules);
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

    private LostArkCalendarDayResponse buildDayResponse(LocalDate date, List<LostArkCalendarSchedule> schedules) {
        Map<String, List<LostArkCalendarScheduleResponse>> grouped = schedules.stream()
            .sorted(Comparator
                .comparing(LostArkCalendarSchedule::slotHhmm, Comparator.nullsLast(String::compareTo))
                .thenComparing(LostArkCalendarSchedule::categoryName, Comparator.nullsLast(String::compareTo))
                .thenComparing(LostArkCalendarSchedule::startTimeKst, Comparator.nullsLast(LocalDateTime::compareTo)))
            .map(this::toResponse)
            .collect(Collectors.groupingBy(LostArkCalendarScheduleResponse::slotHhmm, LinkedHashMap::new, Collectors.toList()));

        List<LostArkCalendarSlotGroupResponse> groups = new ArrayList<>();
        for (String slot : TARGET_SLOTS) {
            groups.add(new LostArkCalendarSlotGroupResponse(slot, grouped.getOrDefault(slot, List.of())));
        }

        return new LostArkCalendarDayResponse(formatDate(date), groups);
    }

    private List<LostArkCalendarSchedule> filterByDate(List<LostArkCalendarSchedule> schedules, LocalDate date) {
        return schedules.stream()
            .filter(schedule -> date.equals(schedule.startDate()))
            .collect(Collectors.toList());
    }

    private LostArkCalendarScheduleResponse toResponse(LostArkCalendarSchedule schedule) {
        return new LostArkCalendarScheduleResponse(
            schedule.categoryName(),
            schedule.contentsName(),
            schedule.contentsIcon(),
            schedule.minItemLevel(),
            schedule.location(),
            formatDateTime(schedule.startTimeKst()),
            formatDate(schedule.startDate()),
            schedule.startHhmm(),
            schedule.slotHhmm(),
            readRewards(schedule.rewards())
        );
    }

    private List<CalendarRewardResponse> readRewards(String rewardsJson) {
        if (rewardsJson == null || rewardsJson.isBlank()) {
            return List.of();
        }

        try {
            CalendarRewardResponse[] rewards = objectMapper.readValue(rewardsJson, CalendarRewardResponse[].class);
            return Arrays.stream(rewards)
                .map(reward -> new CalendarRewardResponse(reward.name(), reward.icon(), reward.grade(), firstNonBlank(reward.iconUrl(), reward.icon())))
                .collect(Collectors.toList());
        } catch (JsonProcessingException exception) {
            return List.of();
        }
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

    private String formatDate(LocalDate date) {
        return date == null ? null : DATE_FORMATTER.format(date);
    }

    private String firstNonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
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

    private String safeMessage(Exception exception) {
        String message = exception.getMessage();
        return message == null || message.isBlank() ? exception.getClass().getSimpleName() : message;
    }

    private record ScheduleDraft(
        LostArkCalendarResponseItem item,
        LocalDateTime startTime,
        String startHhmm,
        String slotHhmm,
        List<CalendarRewardResponse> rewards
    ) {
    }

    private record SyncBatch(
        LocalDate weekStartDate,
        LocalDate weekEndDate,
        int fetchedCount,
        int filteredCount,
        int savedCount,
        List<LostArkCalendarSchedule> schedules
    ) {
    }
}
