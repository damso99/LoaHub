import { useEffect, useState } from 'react';
import { Badge } from './Badge';
import { Card } from './Card';

const formatRewardList = (rewards) => (Array.isArray(rewards) ? rewards : []);

const getRewardKey = (itemId, rewardName, rewardIcon, rewardGrade) =>
  `${itemId}-${rewardName}-${rewardIcon}-${rewardGrade}`;

export const CalendarTodaySection = ({ title, icon, tone, items, countdownText, eyebrow = '오늘 일정' }) => {
  const [openRewardItemId, setOpenRewardItemId] = useState(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (!event.target.closest('[data-reward-popover-root]')) {
        setOpenRewardItemId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenRewardItemId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
            const rewards = formatRewardList(item.rewards ?? item.rewardItems);
            const rewardPanelId = `calendar-reward-popover-${item.id}`;
            const isRewardPanelOpen = openRewardItemId === item.id;

            return (
              <article key={item.id} className="calendar-today-item" data-reward-popover-root>
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

                  {rewards.length > 0 ? (
                    <div className="calendar-today-item__reward-area">
                      <button
                        type="button"
                        className="calendar-today-item__reward-button"
                        aria-expanded={isRewardPanelOpen}
                        aria-controls={rewardPanelId}
                        onClick={() => {
                          setOpenRewardItemId((current) => (current === item.id ? null : item.id));
                        }}
                      >
                        <span>보상 {rewards.length}개</span>
                        <span className="material-symbols-outlined">unfold_more</span>
                      </button>

                      {isRewardPanelOpen ? (
                        <div className="calendar-today-item__reward-popover" id={rewardPanelId} role="dialog" aria-label={`${item.contentName} 보상 정보`}>
                          <div className="calendar-today-item__reward-popover-header">
                            <strong>보상 정보</strong>
                            <button
                              type="button"
                              className="calendar-today-item__reward-popover-close"
                              aria-label="보상 정보 닫기"
                              onClick={() => setOpenRewardItemId(null)}
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </div>

                          <div className="calendar-today-item__reward-list">
                            {rewards.map((reward) => {
                              const rewardIcon = reward.iconUrl || reward.icon || '';
                              const rewardName = reward.name || reward.Name || '보상';
                              const rewardGrade = reward.grade || reward.Grade || '';

                              return (
                                <div key={getRewardKey(item.id, rewardName, rewardIcon, rewardGrade)} className="calendar-today-item__reward-entry">
                                  <div className="calendar-today-item__reward-entry-icon">
                                    {rewardIcon ? (
                                      <img src={rewardIcon} alt={rewardName} />
                                    ) : (
                                      <span className="material-symbols-outlined">redeem</span>
                                    )}
                                  </div>
                                  <div className="calendar-today-item__reward-entry-copy">
                                    <strong>{rewardName}</strong>
                                    {rewardGrade ? <span>{rewardGrade}</span> : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
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
