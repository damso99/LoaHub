import { Card } from './Card';

export const ScheduleSkeletonCard = ({ title }) => {
  return (
    <Card className="today-schedule-card schedule-skeleton-card" aria-hidden="true">
      <div className="today-schedule-card__top">
        <span className="schedule-skeleton__pill schedule-skeleton__block" />
        <span className="schedule-skeleton__pill schedule-skeleton__block" />
      </div>

      <div className="schedule-skeleton__headline schedule-skeleton__block" />
      <div className="schedule-skeleton__title">{title}</div>

      <div className="today-schedule-card__meta">
        <div className="schedule-skeleton__label schedule-skeleton__block" />
        <div className="schedule-skeleton__line schedule-skeleton__block" />
        <div className="schedule-skeleton__line schedule-skeleton__block schedule-skeleton__line--short" />
      </div>

      <div className="today-schedule-card__chips">
        <span className="schedule-skeleton__chip schedule-skeleton__block" />
        <span className="schedule-skeleton__chip schedule-skeleton__block" />
        <span className="schedule-skeleton__chip schedule-skeleton__block" />
      </div>
    </Card>
  );
};
