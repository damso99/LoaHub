import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useAuthGuard } from '../hooks/useAuthGuard';

const SECTION_CONFIG = [
  { key: 'adventureIslands', title: '모험섬', tone: 'primary' },
  { key: 'chaosGates', title: '카게', tone: 'warning' },
  { key: 'fieldBosses', title: '필보', tone: 'info' },
];

const normalizeRewardText = (item) => {
  if (item?.rewardText) {
    return String(item.rewardText).trim();
  }

  if (!Array.isArray(item?.rewardItems) || item.rewardItems.length === 0) {
    return '';
  }

  return item.rewardItems
    .map((reward) => reward?.name ?? reward?.Name ?? '')
    .filter((rewardName) => rewardName.trim().length > 0)
    .join(', ');
};

const formatStartTime = (value) => {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  if (text.includes('T')) {
    return text.slice(11, 16);
  }

  return text.slice(0, 5);
};

const TodayScheduleCard = ({ title, tone, items }) => {
  return (
    <Card className="calendar-today-section">
      <div className="calendar-today-section__header">
        <div>
          <p className="calendar-today-section__eyebrow">오늘 일정</p>
          <h2>{title}</h2>
        </div>
        <Badge tone={tone}>{items.length}개</Badge>
      </div>

      <div className="calendar-today-section__items">
        {items.length > 0 ? (
          items.map((item) => {
            const rewardText = normalizeRewardText(item);

            return (
              <article key={item.id} className="calendar-today-item">
                <div className="calendar-today-item__top">
                  <div className="calendar-today-item__body">
                    <div className="calendar-today-item__badges">
                      <Badge tone={tone}>{item.contentType}</Badge>
                      <Badge tone="neutral">{formatStartTime(item.startTime)}</Badge>
                    </div>
                    <h3>{item.contentName}</h3>
                  </div>

                  <div className="calendar-today-item__time">
                    <strong>{formatStartTime(item.startTime)} 시작</strong>
                  </div>
                </div>

                {rewardText ? <p className="calendar-today-item__reward">{rewardText}</p> : null}
              </article>
            );
          })
        ) : (
          <div className="calendar-today-section__empty">오늘 일정이 없습니다.</div>
        )}
      </div>
    </Card>
  );
};

export const CalendarPage = () => {
  const { notifications, setNotifications } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [calendarToday, setCalendarToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.getLostArkCalendarToday();
      const payload = response?.data?.data ?? response?.data ?? {};
      setCalendarToday(payload);
    } catch (error) {
      const message =
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

  const sectionData = useMemo(() => {
    return SECTION_CONFIG.map((section) => ({
      ...section,
      items: Array.isArray(calendarToday?.[section.key]) ? calendarToday[section.key] : [],
    }));
  }, [calendarToday]);

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
        description="Supabase에 저장된 캐시를 읽어 오늘자 모험섬, 카게, 필보 일정을 보여줍니다."
        action={<Button variant="secondary" onClick={() => void loadCalendar()}>새로고침</Button>}
      />

      <Card className="section-card calendar-summary-card">
        <div className="section-card__header calendar-page__meta">
          <div>
            <h2>오늘 기준 일정</h2>
            <p>로스트아크 기준 06:00부터 다음날 05:59:59까지의 데이터를 표시합니다.</p>
          </div>
          <Badge tone="primary">모험섬 / 카게 / 필보</Badge>
        </div>
      </Card>

      {loading ? (
        <Card className="loading-state">
          <h2 className="loading-state__title">캘린더를 불러오는 중입니다.</h2>
          <p className="loading-state__desc">DB에 저장된 오늘 로스트아크 일정을 읽고 있습니다.</p>
        </Card>
      ) : errorMessage ? (
        <EmptyState title="캘린더 조회 실패" description={errorMessage} />
      ) : (
        <section className="calendar-today-grid">
          {sectionData.map((section) => (
            <TodayScheduleCard
              key={section.key}
              title={section.title}
              tone={section.tone}
              items={section.items}
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
