import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CalendarTodaySection } from '../components/CalendarTodaySection';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useAuthGuard } from '../hooks/useAuthGuard';

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

const buildWeekDays = () => {
  const { dateKey: todayKey, weekdayIndex } = getKstDateParts();
  const mondayOffset = (weekdayIndex + 6) % 7;
  const mondayKey = addDays(todayKey, -mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDays(mondayKey, index);
    const dayIndex = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
    return {
      dateKey,
      dayLabel: WEEKDAY_LABELS[dayIndex],
      dayNumber: Number(dateKey.slice(8, 10)),
      isToday: dateKey === todayKey,
      isSaturday: dayIndex === 6,
      isSunday: dayIndex === 0,
    };
  });
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

const getSectionCountdown = (items, now) => {
  if (!Array.isArray(items) || items.length === 0) {
    return '오늘 일정이 없습니다.';
  }

  const sortedTimes = items
    .map((item) => parseKstDateTime(item.startTime))
    .filter((value) => value instanceof Date && !Number.isNaN(value.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());

  if (sortedTimes.length === 0) {
    return '오늘 일정이 없습니다.';
  }

  const upcoming = sortedTimes.find((time) => time.getTime() > now.getTime()) ?? sortedTimes[0];
  return formatCountdown(upcoming.toISOString(), now);
};

export const CalendarPage = () => {
  const { notifications, setNotifications } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [calendarToday, setCalendarToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSlowLoadingHint, setShowSlowLoadingHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [nowTick, setNowTick] = useState(() => new Date());

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    setShowSlowLoadingHint(false);

    try {
      const response = await api.getLostArkCalendarToday();
      const payload = response?.data?.data ?? response?.data ?? {};
      setCalendarToday(payload);
    } catch (error) {
      const isTimeout =
        error?.code === 'ECONNABORTED' ||
        String(error?.message ?? '').toLowerCase().includes('timeout');
      const message =
        (isTimeout
          ? '검색 시간이 초과되었습니다. 서버가 준비 중일 수 있으니 잠시 후 다시 시도해 주세요.'
          : null) ||
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        '캘린더 데이터를 불러오지 못했습니다.';
      setCalendarToday(null);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const weekDays = useMemo(() => buildWeekDays(), []);

  const sectionData = useMemo(
    () =>
      SECTION_CONFIG.map((section) => ({
        ...section,
        items: Array.isArray(calendarToday?.[section.key]) ? calendarToday[section.key] : [],
      })),
    [calendarToday],
  );

  const toggleNotification = (id) => {
    if (!requireLogin()) {
      return;
    }

    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  return (
    <div className="page-stack calendar-page">
      <PageHeader
        title="로스트아크 오늘 일정"
        description="DB에 저장된 오늘자 로스트아크 일정만 모아 모험 섬, 필드 보스, 카오스게이트를 보여줍니다."
        action={<Button variant="secondary" onClick={() => void loadCalendar()}>새로고침</Button>}
      />

      <Card className="section-card calendar-today-toolbar">
        <div className="calendar-today-toolbar__header">
          <div>
            <h2>이번 주 날짜</h2>
            <p>오늘 날짜를 보라색으로 강조했습니다.</p>
          </div>
          <Badge tone="primary">{calendarToday?.date ?? getKstDateParts().dateKey}</Badge>
        </div>

        <div className="calendar-week-bar" role="list" aria-label="이번 주 날짜 선택 바">
          {weekDays.map((day) => (
            <div
              key={day.dateKey}
              role="listitem"
              className={[
                'calendar-week-pill',
                day.isToday ? 'is-today' : '',
                day.isSaturday ? 'is-saturday' : '',
                day.isSunday ? 'is-sunday' : '',
              ].join(' ')}
            >
              <span className="calendar-week-pill__day">{day.dayLabel}</span>
              <strong className="calendar-week-pill__date">{day.dayNumber}</strong>
            </div>
          ))}
        </div>
      </Card>

      {loading ? (
        <>
          <Card className="loading-state calendar-loading-card">
            <h2 className="loading-state__title">캘린더를 불러오는 중입니다.</h2>
            <p className="loading-state__desc">DB에 저장된 오늘 로스트아크 일정을 읽고 있습니다.</p>
            {showSlowLoadingHint ? (
              <p className="calendar-loading-card__hint">
                서버 응답이 길어지고 있습니다. 잠시만 기다려 주세요.
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
                      <p className="calendar-today-section__eyebrow">오늘 일정</p>
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
      ) : (
        <section className="calendar-today-grid">
          {sectionData.map((section) => (
            <CalendarTodaySection
              key={section.key}
              title={section.title}
              icon={section.icon}
              tone={section.tone}
              items={section.items}
              countdownText={getSectionCountdown(section.items, nowTick)}
            />
          ))}
        </section>
      )}

      <Card className="section-card">
        <h2>알림 설정</h2>
        <div className="notification-list">
          {notifications.map((item) => (
            <div key={item.id} className="notification-item">
              <div>
                <strong>{item.contentName}</strong>
                <p>{item.notifyBeforeMinutes}분 전에 알림</p>
              </div>
              <button
                type="button"
                className={`toggle-pill ${item.enabled ? 'on' : ''}`}
                onClick={() => toggleNotification(item.id)}
              >
                {item.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
