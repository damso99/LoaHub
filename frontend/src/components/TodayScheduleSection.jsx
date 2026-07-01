import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLostArkCalendar, getLostArkCalendarKey } from '../api/lostarkCalendarApi';
import { resolveLoaScheduleDate, isScheduleDateMatch } from '../utils/calendarDate';
import { Button } from './Button';
import { ScheduleSkeletonCard } from './ScheduleSkeletonCard';
import { TodayScheduleCard } from './TodayScheduleCard';

const SCHEDULE_CONFIG = [
  {
    key: 'adventureIslands',
    title: '모험섬',
    matchers: ['모험섬', '모험 섬', 'adventureisland'],
    emptyDescription: '오늘 예정된 모험섬 일정이 없습니다.',
  },
  {
    key: 'chaosGates',
    title: '카오스게이트',
    matchers: ['카오스게이트', '카오스 게이트', 'chaosgate'],
    emptyDescription: '오늘 예정된 카오스게이트 일정이 없습니다.',
  },
  {
    key: 'fieldBosses',
    title: '필드보스',
    matchers: ['필드보스', '필드 보스', 'fieldboss'],
    emptyDescription: '오늘 예정된 필드보스 일정이 없습니다.',
  },
];

const normalizeKey = (value) => getLostArkCalendarKey(value);

const resolveScheduleKey = (item) => {
  const candidates = [
    item.categoryName,
    item.contentsName,
    item.rawContent?.CategoryName,
    item.rawContent?.ContentsName,
    item.rawContent?.contentsName,
  ].map(normalizeKey);

  if (
    candidates.some((value) =>
      SCHEDULE_CONFIG[0].matchers.some((matcher) => value.includes(normalizeKey(matcher))),
    )
  ) {
    return 'adventureIslands';
  }

  if (
    candidates.some((value) =>
      SCHEDULE_CONFIG[1].matchers.some((matcher) => value.includes(normalizeKey(matcher))),
    )
  ) {
    return 'chaosGates';
  }

  if (
    candidates.some((value) =>
      SCHEDULE_CONFIG[2].matchers.some((matcher) => value.includes(normalizeKey(matcher))),
    )
  ) {
    return 'fieldBosses';
  }

  return null;
};

const buildEntriesByCategory = (items, targetDate) => {
  const grouped = new Map(SCHEDULE_CONFIG.map((config) => [config.key, []]));

  for (const item of items) {
    const scheduleKey = resolveScheduleKey(item);
    if (!scheduleKey) {
      continue;
    }

    const startTimes = Array.isArray(item.startTimes) ? item.startTimes : [];
    for (const startTime of startTimes) {
      if (!isScheduleDateMatch(startTime, targetDate)) {
        continue;
      }

      const normalizedTime = String(startTime).trim();
      const entries = grouped.get(scheduleKey) ?? [];
      const dedupeKey = `${String(item.contentsName ?? '').trim()}|${normalizedTime}`;
      if (entries.some((entry) => entry.dedupeKey === dedupeKey)) {
        continue;
      }

      entries.push({
        dedupeKey,
        categoryName: item.categoryName,
        contentsName: item.contentsName,
        contentsIcon: item.contentsIcon,
        minItemLevel: item.minItemLevel,
        location: item.location,
        startTime: normalizedTime,
        rewards: Array.isArray(item.rewardItems) ? item.rewardItems : [],
      });
      grouped.set(scheduleKey, entries);
    }
  }

  return grouped;
};

const sortEntries = (entries) =>
  [...entries].sort((left, right) => String(left.startTime).localeCompare(String(right.startTime)));

export const TodayScheduleSection = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorType, setErrorType] = useState('');
  const [retryIndex, setRetryIndex] = useState(0);
  const targetDate = resolveLoaScheduleDate();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadSchedule = async () => {
      setStatus('loading');
      setErrorType('');

      try {
        const response = await fetchLostArkCalendar({ signal: controller.signal });
        if (!active) {
          return;
        }

        setItems(Array.isArray(response) ? response : []);
        setStatus('ready');
      } catch (error) {
        if (!active) {
          return;
        }

        setItems([]);
        setStatus('error');
        setErrorType(error?.code === 'MISSING_LOSTARK_API_KEY' ? 'missing-api-key' : 'request-failed');
      }
    };

    void loadSchedule();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryIndex]);

  const sections = useMemo(() => {
    const grouped = buildEntriesByCategory(items, targetDate);

    return SCHEDULE_CONFIG.map((config) => ({
      ...config,
      entries: sortEntries(grouped.get(config.key) ?? []),
    }));
  }, [items, targetDate]);

  const hasError = status === 'error';
  const isLoading = status === 'loading';

  return (
    <section className="today-schedule-section">
      <div className="today-schedule-section__header">
        <div className="today-schedule-section__copy">
          <p className="eyebrow">오늘의 일정</p>
          <h2 className="today-schedule-section__title">오늘 진행되는 모험섬, 카오스게이트, 필드보스 일정을 확인하세요.</h2>
          <p className="today-schedule-section__desc">
            한국시간 기준 오전 6시를 기준으로 오늘 일정을 계산해 표시합니다.
          </p>
        </div>
        <Button as={Link} to="/calendar" variant="secondary">
          캘린더 전체보기
        </Button>
      </div>

      {isLoading ? (
        <div className="today-schedule-grid" aria-label="오늘의 일정 로딩 상태">
          {SCHEDULE_CONFIG.map((config) => (
            <ScheduleSkeletonCard key={config.key} title={config.title} />
          ))}
        </div>
      ) : hasError ? (
        <div className="today-schedule-error">
          <div className="today-schedule-error__card">
            <p className="today-schedule-error__title">일정을 불러오지 못했습니다.</p>
            <p className="today-schedule-error__desc">잠시 후 다시 시도해주세요.</p>
            {import.meta.env.DEV && errorType === 'missing-api-key' ? (
              <p className="today-schedule-error__detail">VITE_LOSTARK_API_KEY가 설정되지 않았습니다.</p>
            ) : null}
            <Button variant="secondary" onClick={() => setRetryIndex((current) => current + 1)}>
              다시 시도
            </Button>
          </div>
        </div>
      ) : (
        <div className="today-schedule-grid">
          {sections.map((section) => (
            <TodayScheduleCard
              key={section.key}
              title={section.title}
              entries={section.entries}
              emptyDescription={section.emptyDescription}
            />
          ))}
        </div>
      )}
    </section>
  );
};
