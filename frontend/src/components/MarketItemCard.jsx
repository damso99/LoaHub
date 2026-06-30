import { Badge } from './Badge';
import { Card } from './Card';

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return new Intl.NumberFormat('ko-KR').format(value);
};

export const MarketItemCard = ({ item }) => {
  return (
    <Card className="market-card">
      <div className="market-card__top">
        <img className="market-card__icon" src={item.icon} alt={item.itemName} />
        <div className="market-card__heading">
          <div className="market-card__title-row">
            <h3>{item.itemName}</h3>
            <Badge tone="info">{item.grade || 'Normal'}</Badge>
          </div>
          <p>Item ID: {item.itemId || '-'}</p>
        </div>
      </div>

      <dl className="market-card__stats">
        <div>
          <dt>Current Min</dt>
          <dd>{formatPrice(item.currentMinPrice)}</dd>
        </div>
        <div>
          <dt>Recent Price</dt>
          <dd>{formatPrice(item.recentPrice)}</dd>
        </div>
        <div>
          <dt>Yesterday Avg</dt>
          <dd>{formatPrice(item.yDayAvgPrice)}</dd>
        </div>
        <div>
          <dt>Remain / Bundle</dt>
          <dd>
            {item.tradeRemainCount ?? '-'} / {item.bundleCount ?? '-'}
          </dd>
        </div>
      </dl>
    </Card>
  );
};
