const getRewardKey = (reward, index) => {
  const name = reward?.name ?? reward?.Name ?? '';
  const icon = reward?.icon ?? reward?.iconUrl ?? reward?.Icon ?? '';
  const grade = reward?.grade ?? reward?.Grade ?? '';
  return `${name}-${icon}-${grade}-${index}`;
};

const normalizeReward = (reward) => ({
  name: reward?.name ?? reward?.Name ?? '보상',
  icon: reward?.icon ?? reward?.iconUrl ?? reward?.Icon ?? '',
  grade: reward?.grade ?? reward?.Grade ?? '',
});

export const RewardPopover = ({ title, rewards = [] }) => {
  const rewardList = Array.isArray(rewards) ? rewards.map(normalizeReward) : [];

  return (
    <div className="reward-popover" role="dialog" aria-label={`${title} 보상 정보`}>
      <div className="reward-popover__title">
        <strong>{title} 보상 정보</strong>
      </div>

      {rewardList.length > 0 ? (
        <div className="reward-list">
          {rewardList.map((reward, index) => (
            <div key={getRewardKey(reward, index)} className="reward-item">
              <div className="reward-item__icon">
                {reward.icon ? <img src={reward.icon} alt={reward.name} /> : <span className="material-symbols-outlined">redeem</span>}
              </div>
              <div className="reward-item__copy">
                <strong>{reward.name}</strong>
                {reward.grade ? <span>{reward.grade}</span> : <span>보상 항목</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="reward-popover__empty">보상 정보 없음</div>
      )}
    </div>
  );
};
