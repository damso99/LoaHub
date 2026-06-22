import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export const MerchantCard = ({ merchant, onFavorite }) => {
  return (
    <Card className="merchant-card">
      <div className="merchant-card__top">
        <div>
          <div className="merchant-card__title-row">
            <h3>{merchant.merchantName}</h3>
            <Badge tone="info">{merchant.region}</Badge>
          </div>
          <p>{merchant.spawnTime}</p>
        </div>
        <button type="button" className={`favorite-button ${merchant.favorite ? 'active' : ''}`} onClick={onFavorite}>
          ★
        </button>
      </div>
      <div className="merchant-card__items">
        {merchant.items.map((item) => (
          <span key={item} className="merchant-tag">
            {item}
          </span>
        ))}
      </div>
      <p className="merchant-card__desc">{merchant.description}</p>
      <Button variant="outline" className="merchant-card__action">
        상세 보기
      </Button>
    </Card>
  );
};

