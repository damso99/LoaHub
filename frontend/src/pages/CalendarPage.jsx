import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLostArkCalendarWeek } from '../api/lostarkCalendarApi';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CalendarTodaySection } from '../components/CalendarTodaySection';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';

const SECTION_CONFIG = [
  { key: 'adventureIslands', title: '모험 섬', icon: 'explore', tone: 'primary' },
  { key: 'fieldBosses', title: '필드 보스', icon: 'public', tone: 'info' },
  { key: 'chaosGates', title: '카오스게이트', icon: 'bolt', tone: 'warning' },
];

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const getKstDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const normalized = `${map.year}-${map.month}-${map.day}`;
  const weekdayIndex = new Date(`${normalized}T00:00:00Z`).getUTCDay();

  return {
    dateKey: normalized,
    weekdayIndex,
  };
};

const addDays = (dateKey, amount) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + amount);
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
};

const buildWeekDaysFromRange = (weekStartDate, weekEndDate) => {
  if (!weekStartDate || !weekEndDate) {
    return [];
  }

  const todayKey = getKstDateParts().dateKey;
  const start = weekStartDate;
  const end = weekEndDate;
  const days = [];

  let cursor = start;
  while (cursor <= end) {
    const dayIndex = new Date(`${cursor}T00:00:00Z`).getUTCDay();
    days.push({
      dateKey: cursor,
      dayLabel: WEEKDAY_LABELS[dayIndex],
      dayNumber: Number(cursor.slice(8, 10)),
      isToday: cursor === todayKey,
      isSaturday: dayIndex === 6,
      isSunday: dayIndex === 0,
    });
    cursor = addDays(cursor, 1);
  }

  return days;
};

const normalizeKey = (value) =>
  String(value ?? '')
    .trim()
    .replaceAll(/[\s_-]/g, '')
    .toUpperCase();

const resolveSectionKey = (schedule) => {
  const candidates = [schedule.categoryName, schedule.contentsName, schedule.rawContent].map(normalizeKey);

  if (candidates.some((value) => value.includes('모험섬') || value === 'ADVENTUREISLAND')) {
    return 'adventureIslands';
  }
  if (candidates.some((value) => value.includes('필드보스') || value.includes('필보') || value === 'FIELDBOSS')) {
    return 'fieldBosses';
  }
  if (candidates.some((value) => value.includes('카오스게이트') || value.includes('카오스') || value === 'CHAOSGATE')) {
    return 'chaosGates';
  }

  return null;
};

const formatSelectedDateLabel = (dateKey) => {
  if (!dateKey) {
    return '-';
  }

  const date = new Date(`${dateKey}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date);
};

const formatShortTime = (value) => {
  const text = String(value ?? '').trim();
  if (!text) {
    return '-';
  }

  return text.length >= 5 ? text.slice(0, 5) : text;
};

const parseKstDateTime = (value) => {
  const text = String(value ?? '').trim();
  if (!text) {
    return null;
  }

  const normalized = text.includes(' ') ? text.replace(' ', 'T') : text;
  const withZone = /[zZ]|[+-]\d\d:\d\d$/.test(normalized) ? normalized : `${normalized}+09:00`;
  const parsed = new Date(withZone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatCountdown = (startTime, now) => {
  const target = parseKstDateTime(startTime);
  if (!target) {
    return '';
  }

  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return '진행 중';
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `시작까지 ${hours}:${minutes}:${seconds}`;
};

const getSectionBadgeText = (items, selectedDate, now, todayKey) => {
  if (!Array.isArray(items) || items.length === 0) {
    return '일정 없음';
  }

  if (selectedDate !== todayKey) {
    return `총 ${items.length}개`;
  }

  const sortedTimes = items
    .map((item) => parseKstDateTime(item.startTime))
    .filter((value) => value instanceof Date && !Number.isNaN(value.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());

  if (sortedTimes.length === 0) {
    return `총 ${items.length}개`;
  }

  const upcoming = sortedTimes.find((time) => time.getTime() > now.getTime()) ?? sortedTimes[0];
  return formatCountdown(upcoming.toISOString(), now) || `총 ${items.length}개`;
};

const normalizeCalendarItem = (schedule, sectionTitle) => ({
  id: schedule.id,
  itemKey: schedule.id
    ? String(schedule.id)
    : `${schedule.startDate ?? ''}|${schedule.startHhmm ?? schedule.startTimeKst ?? ''}|${schedule.contentsName ?? ''}|${sectionTitle}`,
  contentName: schedule.contentsName ?? '-',
  contentType: sectionTitle,
  startTime: formatShortTime(schedule.startHhmm ?? schedule.startTimeKst),
  imageUrl: schedule.contentsIcon ?? '',
  rewardType: Array.isArray(schedule.rewards) && schedule.rewards.length > 0 ? schedule.rewards[0]?.grade ?? null : null,
  rewards: Array.isArray(schedule.rewards) ? schedule.rewards : [],
  sourceIds: [schedule.id].filter(Boolean),
});

const groupCalendarItemsByName = (items) => {
  const groups = new Map();

  for (const item of items) {
    const key = normalizeKey(item.contentName);
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        ...item,
        itemKey: item.itemKey,
        occurrenceCount: 1,
        rewards: Array.isArray(item.rewards) ? [...item.rewards] : [],
        sourceIds: Array.isArray(item.sourceIds) ? [...item.sourceIds] : item.id ? [item.id] : [],
      });
      continue;
    }

    groups.set(key, {
      ...current,
      rewardType: current.rewardType ?? item.rewardType ?? null,
      imageUrl: current.imageUrl || item.imageUrl || '',
      startTime: current.startTime || item.startTime || '',
      itemKey: current.itemKey || item.itemKey,
      occurrenceCount: current.occurrenceCount + 1,
      rewards: Array.isArray(current.rewards) && current.rewards.length > 0 ? current.rewards : Array.isArray(item.rewards) ? [...item.rewards] : [],
      sourceIds: Array.isArray(current.sourceIds) ? [...current.sourceIds, ...(Array.isArray(item.sourceIds) ? item.sourceIds : item.id ? [item.id] : [])] : [],
    });
  }

  return Array.from(groups.values());
};

export const CalendarPage = () => {
  const todayKey = useMemo(() => getKstDateParts().dateKey, []);
  const [calendarWeek, setCalendarWeek] = useState({ weekStartDate: null, weekEndDate: null, items: [] });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [loading, setLoading] = useState(true);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [nowTick, setNowTick] = useState(() => new Date());

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    setShowSlowLoadingHint(false);

    try {
      const response = await getLostArkCalendarWeek();
      const payload = response?.data?.data ?? response?.data ?? response ?? {};
      const items = Array.isArray(payload.items) ? payload.items : [];

      setCalendarWeek({
        weekStartDate: payload.weekStartDate ?? items[0]?.weekStartDate ?? null,
        weekEndDate: payload.weekEndDate ?? items.at(-1)?.weekEndDate ?? null,
        items,
      });

      const availableDates = Array.from(new Set(items.map((item) => item.startDate).filter(Boolean))).sort();
      setSelectedDate((current) => {
        if (current && availableDates.includes(current)) {
          return current;
        }
        return availableDates[0] ?? todayKey;
      });
    } catch (error) {
      const isTimeout =
        error?.code === 'ECONNABORTED' ||
        String(error?.message ?? '').toLowerCase().includes('timeout');
      const message =
        (isTimeout
          ? '검색 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'
          : null) ||
        error?.message ||
        '캘린더 데이터를 불러오지 못했습니다.';

      setCalendarWeek({ weekStartDate: null, weekEndDate: null, items: [] });
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    if (!loading) {
      setShowSlowLoadingHint(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setShowSlowLoadingHint(true), 4000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const weekDays = useMemo(
    () => buildWeekDaysFromRange(calendarWeek.weekStartDate, calendarWeek.weekEndDate),
    [calendarWeek.weekEndDate, calendarWeek.weekStartDate],
  );

  const selectedDayItems = useMemo(
    () => calendarWeek.items.filter((item) => item.startDate === selectedDate),
    [calendarWeek.items, selectedDate],
  );

  const sectionData = useMemo(
    () =>
      SECTION_CONFIG.map((section) => {
        const items = groupCalendarItemsByName(
          selectedDayItems
            .filter((item) => resolveSectionKey(item) === section.key)
            .map((item) => normalizeCalendarItem(item, section.title)),
        );

        return {
          ...section,
          items,
          badgeText: getSectionBadgeText(items, selectedDate, nowTick, todayKey),
        };
      }),
    [nowTick, selectedDayItems, selectedDate, todayKey],
  );

  const hasWeekData = calendarWeek.items.length > 0 && weekDays.length > 0;
  const weekRangeText =
    calendarWeek.weekStartDate && calendarWeek.weekEndDate
      ? `${formatSelectedDateLabel(calendarWeek.weekStartDate)} - ${formatSelectedDateLabel(calendarWeek.weekEndDate)}`
      : '주간 일정';

  return (
    <div className="page-stack calendar-page">
      <PageHeader
        title="로스트아크 주간 일정"
        description="일주일치 일정을 한 번에 불러와서 날짜를 누르면 그날 일정을 바로 확인할 수 있습니다."
        action={<Button variant="secondary" onClick={() => void loadCalendar()}>새로고침</Button>}
      />

      <Card className="section-card calendar-today-toolbar">
        <div className="calendar-today-toolbar__header">
          <div>
            <h2>이번 주 날짜</h2>
            <p>{weekRangeText}</p>
          </div>
          <Badge tone="primary">{formatSelectedDateLabel(selectedDate)}</Badge>
        </div>

        <div className="calendar-week-bar" role="list" aria-label="이번 주 날짜 선택 바">
          {weekDays.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              role="listitem"
              className={[
                'calendar-week-pill',
                day.isToday ? 'is-today' : '',
                selectedDate === day.dateKey ? 'is-selected' : '',
                day.isSaturday ? 'is-saturday' : '',
                day.isSunday ? 'is-sunday' : '',
              ].join(' ')}
              onClick={() => setSelectedDate(day.dateKey)}
            >
              <span className="calendar-week-pill__day">{day.dayLabel}</span>
              <strong className="calendar-week-pill__date">{day.dayNumber}</strong>
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <>
          <Card className="loading-state calendar-loading-card">
            <h2 className="loading-state__title">캘린더를 불러오는 중입니다.</h2>
            <p className="loading-state__desc">일주일치 일정을 읽고 있습니다.</p>
            {showSlowLoadingHint ? (
              <p className="calendar-loading-card__hint">
                응답이 길어지고 있습니다. 잠시만 기다려 주세요.
              </p>
            ) : null}
          </Card>

          <section className="calendar-today-grid" aria-label="캘린더 로딩 중">
            {SECTION_CONFIG.map((section) => (
              <Card key={section.key} className="calendar-today-section calendar-today-skeleton">
                <div className="calendar-today-section__header">
                  <div className="calendar-today-section__title-wrap">
                    <span className={`calendar-today-section__icon calendar-today-section__icon--${section.tone} material-symbols-outlined`}>
                      {section.icon}
                    </span>
                    <div>
                      <p className="calendar-today-section__eyebrow">선택 날짜 일정</p>
                      <h2>{section.title}</h2>
                    </div>
                  </div>
                  <span className="calendar-loading-pill" />
                </div>

                <div className="calendar-today-section__items">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <article key={`${section.key}-skeleton-${index}`} className="calendar-today-item calendar-today-item--skeleton">
                      <div className="calendar-today-item__media">
                        <div className="calendar-today-item__image calendar-today-item__image--placeholder calendar-loading-block" />
                      </div>
                      <div className="calendar-today-item__body">
                        <div className="calendar-today-item__topline">
                          <span className="calendar-loading-pill" />
                          <span className="calendar-loading-pill" />
                        </div>
                        <div className="calendar-loading-line calendar-loading-block" />
                        <div className="calendar-loading-line calendar-loading-block calendar-loading-line--short" />
                        <div className="calendar-loading-row">
                          <span className="calendar-loading-chip calendar-loading-block" />
                          <span className="calendar-loading-chip calendar-loading-block" />
                          <span className="calendar-loading-chip calendar-loading-block" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </Card>
            ))}
          </section>
        </>
      ) : errorMessage ? (
        <EmptyState title="캘린더 조회 실패" description={errorMessage} />
      ) : hasWeekData ? (
        <section className="calendar-today-grid">
          {sectionData.map((section) => (
            <CalendarTodaySection
              key={section.key}
              title={section.title}
              icon={section.icon}
              tone={section.tone}
              eyebrow={selectedDate === todayKey ? '오늘 일정' : '선택 날짜 일정'}
              items={section.items}
              countdownText={section.badgeText}
            />
          ))}
        </section>
      ) : (
        <EmptyState title="일정이 없습니다." description="이번 주에 표시할 일정이 없습니다." />
      )}
    </div>
  );
};
