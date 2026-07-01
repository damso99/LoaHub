import { Badge } from './Badge';

export const ScheduleEmptyState = ({ description, label = '일정 없음' }) => {
  return (
    <div className="today-schedule-card__empty">
      <Badge tone="neutral">{label}</Badge>
      <p>{description}</p>
    </div>
  );
};
