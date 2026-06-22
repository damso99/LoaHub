import { Card } from './Card';

export const CalendarCard = ({ content, onToggle, enabled }) => {
  return (
    <Card className="calendar-card">
      <div className="calendar-card__header">
        <div>
          <p className="calendar-card__eyebrow">{content.contentType === 'TODAY' ? '오늘' : '이번 주'}</p>
          <h3>{content.contentName}</h3>
        </div>
        <button type="button" className={`toggle-pill ${enabled ? 'on' : ''}`} onClick={onToggle}>
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <p className="calendar-card__time">{content.startTime}</p>
      <p className="calendar-card__desc">{content.description}</p>
    </Card>
  );
};

