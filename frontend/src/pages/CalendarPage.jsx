import { useAppState } from '../context/AppStateContext';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { CalendarCard } from '../components/CalendarCard';
import { useAuthGuard } from '../hooks/useAuthGuard';

export const CalendarPage = () => {
  const { notifications, setNotifications } = useAppState();
  const { requireLogin } = useAuthGuard();

  const contents = [
    {
      id: 1,
      contentName: '카오스 던전',
      contentType: 'TODAY',
      startTime: '2026-06-17 18:00',
      description: '오늘의 카오스 던전 콘텐츠입니다.',
    },
    {
      id: 2,
      contentName: '어드벤처',
      contentType: 'TODAY',
      startTime: '2026-06-17 19:30',
      description: '서버별 일정 확인 콘텐츠입니다.',
    },
    {
      id: 3,
      contentName: '모험 섬',
      contentType: 'WEEK',
      startTime: '2026-06-19 12:00',
      description: '주간 알림 콘텐츠입니다.',
    },
  ];

  const toggleNotification = (id) => {
    if (!requireLogin()) {
      return;
    }

    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="캘린더 콘텐츠"
        description="오늘과 이번 주 콘텐츠를 카드 형태로 보여주고 알림을 설정합니다."
      />
      <section className="grid grid-2">
        {contents.map((content) => (
          <CalendarCard
            key={content.id}
            content={content}
            enabled={notifications.some((item) => item.contentName === content.contentName && item.enabled)}
            onToggle={() => toggleNotification(content.id)}
          />
        ))}
      </section>
      <Card className="section-card">
        <h2>알림 설정</h2>
        <div className="notification-list">
          {notifications.map((item) => (
            <div key={item.id} className="notification-item">
              <div>
                <strong>{item.contentName}</strong>
                <p>{item.notifyBeforeMinutes}분 전 알림</p>
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
