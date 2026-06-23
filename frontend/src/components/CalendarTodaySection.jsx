import { Badge } from './Badge';
import { Card } from './Card';

const formatRewardList = (rewards) => (Array.isArray(rewards) ? rewards : []);

export const CalendarTodaySection = ({ title, icon, tone, items, countdownText }) => {
  return (
    <Card className="calendar-today-section">
      <div className="calendar-today-section__header">
        <div className="calendar-today-section__title-wrap">
          <span className={`calendar-today-section__icon calendar-today-section__icon--${tone} material-symbols-outlined`}>
            {icon}
          </span>
          <div>
            <p className="calendar-today-section__eyebrow">오늘 일정</p>
            <h2>{title}</h2>
          </div>
        </div>
        <Badge tone={tone}>{countdownText}</Badge>
      </div>

      <div className="calendar-today-section__items">
        {items.length > 0 ? (
          items.map((item) => {
            const rewards = formatRewardList(item.rewards ?? item.rewardItems);

            return (
              <article key={item.id} className="calendar-today-item">
                <div className="calendar-today-item__media">
                  {item.imageUrl ? (
                    <img className="calendar-today-item__image" src={item.imageUrl} alt={item.contentName} />
                  ) : (
                    <div className="calendar-today-item__image calendar-today-item__image--placeholder">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                </div>

                <div className="calendar-today-item__body">
                  <div className="calendar-today-item__topline">
                    {item.rewardType ? <Badge tone="neutral">{item.rewardType}</Badge> : <span />}
                    <Badge tone={tone}>{item.contentType}</Badge>
                  </div>

                  <h3>{item.contentName}</h3>
                  <p className="calendar-today-item__time">{item.startTime} 시작</p>

                  {item.rewardText ? <p className="calendar-today-item__reward-text">{item.rewardText}</p> : null}

                  {rewards.length > 0 ? (
                    <div className="calendar-today-item__rewards" aria-label={`${item.contentName} 보상`}>
                      {rewards.map((reward) => {
                        const rewardIcon = reward.iconUrl || reward.icon || '';
                        const rewardName = reward.name || reward.Name || '';

                        return (
                          <span key={`${item.id}-${rewardName}-${rewardIcon}`} className="calendar-today-item__reward">
                            {rewardIcon ? <img src={rewardIcon} alt={rewardName} title={rewardName} /> : null}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
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
