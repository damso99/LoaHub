import { useState } from 'react';
import { Badge } from './Badge';
import { Card } from './Card';
import { RewardPopover } from './RewardPopover';

const getRewardList = (item) => {
  if (Array.isArray(item?.rewards) && item.rewards.length > 0) {
    return item.rewards;
  }

  if (Array.isArray(item?.rewardItems) && item.rewardItems.length > 0) {
    return item.rewardItems;
  }

  return [];
};

const getRewardCountLabel = (rewards) => `보상 ${rewards.length}개`;

export const CalendarTodaySection = ({ title, icon, tone, items, countdownText, eyebrow = '오늘 일정' }) => {
  const [hoveredRewardId, setHoveredRewardId] = useState(null);

  return (
    <Card className="calendar-today-section">
      <div className="calendar-today-section__header">
        <div className="calendar-today-section__title-wrap">
          <span className={`calendar-today-section__icon calendar-today-section__icon--${tone} material-symbols-outlined`}>
            {icon}
          </span>
          <div>
            <p className="calendar-today-section__eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
        </div>
        <Badge tone={tone}>{countdownText}</Badge>
      </div>

      <div className="calendar-today-section__items">
        {items.length > 0 ? (
          items.map((item) => {
            const rewards = getRewardList(item);
            const isHovered = hoveredRewardId === item.id;

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

                  <div className="calendar-today-item__headline">
                    <h3>{item.contentName}</h3>
                    {item.occurrenceCount > 1 ? <Badge tone="neutral">x{item.occurrenceCount}</Badge> : null}
                  </div>

                  <div className="calendar-today-item__reward-area">
                    <div
                      className="reward-hover-wrap"
                      onMouseEnter={() => setHoveredRewardId(item.id)}
                      onMouseLeave={() => setHoveredRewardId((current) => (current === item.id ? null : current))}
                      onFocusCapture={() => setHoveredRewardId(item.id)}
                      onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                          setHoveredRewardId((current) => (current === item.id ? null : current));
                        }
                      }}
                    >
                      <button
                        type="button"
                        className="reward-trigger"
                        aria-expanded={isHovered}
                        aria-haspopup="dialog"
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
                            setHoveredRewardId((current) => (current === item.id ? null : item.id));
                          }
                        }}
                      >
                        <span>{getRewardCountLabel(rewards)}</span>
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                      </button>

                      {isHovered ? <RewardPopover title={item.contentName} rewards={rewards} /> : null}
                    </div>
                  </div>
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
