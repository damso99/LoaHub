import { useEffect, useRef, useState } from 'react';
import { Badge } from './Badge';
import { Card } from './Card';
import { RewardPopover } from './RewardPopover';

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .replaceAll(/[\s_-]/g, '')
    .toLowerCase();

const isRewardForCurrentItem = (reward, item) => {
  const rewardIslandId = reward?.islandId ?? reward?.scheduleId ?? reward?.schedule_id ?? reward?.id ?? null;
  const itemId = item?.id ?? null;

  if (rewardIslandId != null && itemId != null && String(rewardIslandId) === String(itemId)) {
    return true;
  }

  const rewardIslandName = normalizeText(reward?.islandName ?? reward?.island_name ?? reward?.contentName ?? reward?.contentsName ?? reward?.name);
  const itemName = normalizeText(item?.contentName ?? item?.name);
  if (rewardIslandName && itemName && rewardIslandName === itemName) {
    return true;
  }

  const rewardContentType = normalizeText(reward?.contentType ?? reward?.content_type ?? reward?.type);
  const itemContentType = normalizeText(item?.contentType);
  if (rewardContentType && itemContentType && rewardContentType === itemContentType) {
    return true;
  }

  return false;
};

const getRewardList = (item) => {
  const baseRewards = Array.isArray(item?.rewards) ? item.rewards : Array.isArray(item?.rewardItems) ? item.rewardItems : [];

  if (baseRewards.length === 0) {
    return [];
  }

  const hasRewardMeta = baseRewards.some(
    (reward) =>
      reward?.islandId != null ||
      reward?.scheduleId != null ||
      reward?.schedule_id != null ||
      reward?.islandName ||
      reward?.island_name ||
      reward?.contentName ||
      reward?.contentsName ||
      reward?.contentType ||
      reward?.content_type ||
      reward?.type,
  );

  const filteredRewards = baseRewards.filter((reward) => isRewardForCurrentItem(reward, item));
  if (filteredRewards.length > 0) {
    return filteredRewards;
  }

  return hasRewardMeta ? [] : baseRewards;
};

const getRewardCountLabel = (rewards) => `보상 ${rewards.length}개`;

export const CalendarTodaySection = ({ title, icon, tone, items, countdownText, eyebrow = '오늘 일정' }) => {
  const [hoveredRewardKey, setHoveredRewardKey] = useState(null);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = (itemKey) => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setHoveredRewardKey((current) => (current === itemKey ? null : current));
    }, 180);
  };

  useEffect(() => () => clearCloseTimer(), []);

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
            const itemKey = item.itemKey ?? item.id ?? item.contentName;
            const isHovered = hoveredRewardKey === itemKey;

            return (
              <article key={itemKey} className="calendar-today-item">
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
                  </div>

                  <div className="calendar-today-item__reward-area">
                    <div
                      className="reward-hover-wrap"
                      onMouseEnter={() => {
                        clearCloseTimer();
                        setHoveredRewardKey(itemKey);
                      }}
                      onMouseLeave={() => scheduleClose(itemKey)}
                      onFocusCapture={() => {
                        clearCloseTimer();
                        setHoveredRewardKey(itemKey);
                      }}
                      onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                          scheduleClose(itemKey);
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
                            setHoveredRewardKey((current) => (current === itemKey ? null : itemKey));
                          }
                        }}
                      >
                        <span>{getRewardCountLabel(rewards)}</span>
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                      </button>

                      {isHovered ? (
                        <div onMouseEnter={clearCloseTimer} onMouseLeave={() => scheduleClose(itemKey)}>
                          <RewardPopover title={item.contentName} rewards={rewards} />
                        </div>
                      ) : null}
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
