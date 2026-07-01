import { Badge } from './Badge';
import { Card } from './Card';
import { ScheduleEmptyState } from './ScheduleEmptyState';
import { formatKstTime } from '../utils/calendarDate';

const formatRewardSummary = (entries) => {
  const rewards = entries.flatMap((entry) => (Array.isArray(entry.rewards) ? entry.rewards : []));
  const uniqueRewards = Array.from(
    new Map(
      rewards
        .filter((reward) => reward?.name)
        .map((reward) => [reward.name, reward]),
    ).values(),
  );

  if (uniqueRewards.length === 0) {
    return '';
  }

  const preview = uniqueRewards.slice(0, 2).map((reward) => reward.grade || reward.name).filter(Boolean);
  const extraCount = uniqueRewards.length - preview.length;
  return extraCount > 0 ? `${preview.join(', ')} 외 ${extraCount}개 보상` : preview.join(', ');
};

const formatTimeSummary = (entries) => {
  const times = Array.from(
    new Set(
      entries
        .map((entry) => formatKstTime(entry.startTime))
        .filter(Boolean),
    ),
  );

  return times.length > 0 ? times.join(' · ') : '';
};

const formatNameSummary = (entries) => {
  return Array.from(
    new Set(
      entries
        .map((entry) => String(entry.contentsName ?? '').trim())
        .filter(Boolean),
    ),
  );
};

export const TodayScheduleCard = ({ title, entries, emptyDescription }) => {
  const hasEntries = Array.isArray(entries) && entries.length > 0;
  const timeSummary = hasEntries ? formatTimeSummary(entries) : '';
  const nameSummary = hasEntries ? formatNameSummary(entries) : [];
  const rewardSummary = hasEntries ? formatRewardSummary(entries) : '';
  const firstEntry = hasEntries ? entries[0] : null;

  return (
    <Card className="today-schedule-card">
      <div className="today-schedule-card__top">
        <Badge tone="primary">{hasEntries ? '오늘' : '일정 없음'}</Badge>
        <span className="today-schedule-card__count">{hasEntries ? `${entries.length}개` : '대기 중'}</span>
      </div>

      <div className="today-schedule-card__title-wrap">
        <h3>{title}</h3>
        {firstEntry?.location ? <p className="today-schedule-card__sub">{firstEntry.location}</p> : null}
      </div>

      {hasEntries ? (
        <>
          <div className="today-schedule-card__meta">
            <span className="today-schedule-card__meta-label">진행 시간</span>
            <p className="today-schedule-card__meta-value">{timeSummary || '시간 정보 없음'}</p>
          </div>

          <div className="today-schedule-card__chips" aria-label={`${title} 일정 목록`}>
            {nameSummary.slice(0, 4).map((name) => (
              <span key={name} className="today-schedule-chip" title={name}>
                {name}
              </span>
            ))}
            {nameSummary.length > 4 ? (
              <span className="today-schedule-chip today-schedule-chip--muted">외 {nameSummary.length - 4}개</span>
            ) : null}
          </div>

          {rewardSummary ? (
            <div className="today-schedule-card__footer">
              <span className="today-schedule-card__footer-label">보상</span>
              <span className="today-schedule-card__footer-value">{rewardSummary}</span>
            </div>
          ) : null}
        </>
      ) : (
        <ScheduleEmptyState description={emptyDescription} />
      )}
    </Card>
  );
};
