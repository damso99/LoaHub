import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useAuthGuard } from '../hooks/useAuthGuard';

const FIXED_SLOTS = ['11:00', '13:00', '19:00', '21:00', '23:00'];

const CATEGORY_TONE = {
  '모험 섬': 'primary',
  필드보스: 'info',
  카오스게이트: 'warning',
};

const normalizeScheduleItem = (item) => ({
  ...item,
  rewards: Array.isArray(item?.rewards) ? item.rewards : [],
});

const getCategoryTone = (categoryName) => CATEGORY_TONE[categoryName] ?? 'neutral';

export const CalendarPage = () => {
  const { notifications, setNotifications } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [calendarDay, setCalendarDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.getLostArkCalendarToday();
      const payload = response?.data?.data ?? response?.data ?? {};
      setCalendarDay(payload);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        '캘린더 데이터를 불러오지 못했습니다.';
      setCalendarDay(null);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const slotGroups = useMemo(() => {
    const grouped = new Map((calendarDay?.groups ?? []).map((group) => [group.slotHhmm, group.items ?? []]));

    return FIXED_SLOTS.map((slotHhmm) => ({
      slotHhmm,
      items: (grouped.get(slotHhmm) ?? []).map(normalizeScheduleItem),
    }));
  }, [calendarDay]);

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
        title="로스트아크 캘린더"
        description="백엔드에 저장된 주간 캐시에서 오늘 일정만 읽어와 11:00, 13:00, 19:00, 21:00, 23:00 타임라인으로 보여줍니다."
        action={<Button variant="secondary" onClick={() => void loadCalendar()}>새로고침</Button>}
      />

      <Card className="section-card calendar-summary-card">
        <div className="section-card__header calendar-page__meta">
          <div>
            <h2>오늘 기준 일정</h2>
            <p>{calendarDay?.date ? `${calendarDay.date} KST` : '날짜를 불러오는 중입니다.'}</p>
          </div>
          <Badge tone="primary">11:00 / 13:00 / 19:00 / 21:00 / 23:00</Badge>
        </div>
        <p className="calendar-page__summary">
          카오스게이트는 실제 시작 시간이 11:50, 13:50, 19:50, 21:50, 23:50인 항목을 사용하고, 화면에서는 대응하는 정각 타임라인에 넣습니다.
        </p>
      </Card>

      {loading ? (
        <Card className="loading-state">
          <h2 className="loading-state__title">캘린더를 불러오는 중입니다.</h2>
          <p className="loading-state__desc">Supabase 캐시에서 오늘 로스트아크 일정을 읽고 있습니다.</p>
        </Card>
      ) : errorMessage ? (
        <EmptyState title="캘린더 조회 실패" description={errorMessage} />
      ) : (
        <section className="calendar-timeline">
          {slotGroups.map((group) => (
            <Card key={group.slotHhmm} className="calendar-slot">
              <div className="calendar-slot__header">
                <div>
                  <p className="calendar-slot__eyebrow">타임라인</p>
                  <h2>{group.slotHhmm}</h2>
                </div>
                <Badge tone={group.items.length > 0 ? 'info' : 'neutral'}>{group.items.length}개</Badge>
              </div>

              <div className="calendar-slot__items">
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <article key={`${item.categoryName}-${item.contentsName}-${item.startTimeKst}`} className="calendar-event">
                      <div className="calendar-event__top">
                        {item.contentsIcon ? (
                          <img className="calendar-event__icon" src={item.contentsIcon} alt={item.contentsName} />
                        ) : (
                          <div className="calendar-event__icon calendar-event__icon--placeholder" />
                        )}

                        <div className="calendar-event__body">
                          <div className="calendar-event__badges">
                            <Badge tone={getCategoryTone(item.categoryName)}>{item.categoryName}</Badge>
                            <Badge tone="neutral">{item.slotHhmm}</Badge>
                          </div>
                          <h3>{item.contentsName}</h3>
                          <p>{item.location || '지역 정보 없음'}</p>
                        </div>

                        <div className="calendar-event__time">
                          <strong>{item.startHhmm} 시작</strong>
                          {item.minItemLevel ? <span>최소 {item.minItemLevel}</span> : null}
                        </div>
                      </div>

                      {item.rewards.length > 0 ? (
                        <div className="calendar-event__rewards">
                          {item.rewards.map((reward) => (
                            <Badge key={`${reward.name}-${reward.grade}-${reward.icon}`} tone="warning">
                              {reward.name}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="calendar-slot__empty">해당 시간대 일정이 없습니다.</div>
                )}
              </div>
            </Card>
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
