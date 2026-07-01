import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLostArkCalendarToday } from '../api/lostarkCalendarApi';
import { Button } from './Button';
import { ScheduleSkeletonCard } from './ScheduleSkeletonCard';
import { TodayScheduleCard } from './TodayScheduleCard';

const SCHEDULE_CONFIG = [
  {
    key: 'adventureIslands',
    title: '모험섬',
    emptyDescription: '오늘 예정된 모험섬 일정이 없습니다.',
  },
  {
    key: 'chaosGates',
    title: '카오스게이트',
    emptyDescription: '오늘 예정된 카오스게이트 일정이 없습니다.',
  },
  {
    key: 'fieldBosses',
    title: '필드보스',
    emptyDescription: '오늘 예정된 필드보스 일정이 없습니다.',
  },
];

export const TodayScheduleSection = () => {
  const [schedule, setSchedule] = useState({
    date: '',
    adventureIslands: [],
    chaosGates: [],
    fieldBosses: [],
  });
  const [status, setStatus] = useState('loading');
  const [errorType, setErrorType] = useState('');
  const [retryIndex, setRetryIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadSchedule = async () => {
      setStatus('loading');
      setErrorType('');

      try {
        const response = await getLostArkCalendarToday();
        if (cancelled) {
          return;
        }

        setSchedule({
          date: response.date ?? '',
          adventureIslands: response.adventureIslands ?? [],
          chaosGates: response.chaosGates ?? [],
          fieldBosses: response.fieldBosses ?? [],
        });
        setStatus('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSchedule({
          date: '',
          adventureIslands: [],
          chaosGates: [],
          fieldBosses: [],
        });
        setStatus('error');
        setErrorType(error?.code === 'MISSING_LOSTARK_API_KEY' ? 'missing-api-key' : 'request-failed');
      }
    };

    void loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [retryIndex]);

  const sections = useMemo(
    () =>
      SCHEDULE_CONFIG.map((config) => ({
        ...config,
        items: schedule[config.key] ?? [],
      })),
    [schedule],
  );

  return (
    <section className="today-schedule-section">
      <div className="today-schedule-section__header">
        <div className="today-schedule-section__copy">
          <p className="eyebrow">오늘의 일정</p>
          <h2 className="today-schedule-section__title">오늘 진행되는 모험섬, 카오스게이트, 필드보스 일정을 확인하세요.</h2>
          <p className="today-schedule-section__desc">
            백엔드 DB를 기준으로 오늘 일정을 불러옵니다.
          </p>
        </div>
        <Button as={Link} to="/calendar" variant="secondary">
          캘린더 전체보기
        </Button>
      </div>

      {status === 'loading' ? (
        <div className="today-schedule-grid" aria-label="오늘의 일정 로딩 상태">
          {SCHEDULE_CONFIG.map((config) => (
            <ScheduleSkeletonCard key={config.key} title={config.title} />
          ))}
        </div>
      ) : status === 'error' ? (
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
              entries={section.items}
              emptyDescription={section.emptyDescription}
            />
          ))}
        </div>
      )}
    </section>
  );
};
