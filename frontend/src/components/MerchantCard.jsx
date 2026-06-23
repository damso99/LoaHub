import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export const MerchantCard = ({ merchant, onFavorite, onOpen }) => {
  return (
    <Card className="merchant-card">
      <div className="merchant-card__top">
        <div className="merchant-card__heading">
          <div className="merchant-card__title-row">
            <h3>{merchant.merchantName}</h3>
            <Badge tone={merchant.current ? 'warning' : 'info'}>{merchant.region}</Badge>
          </div>
          <p>{merchant.spawnTime}</p>
        </div>
        <button
          type="button"
          className={`favorite-button ${merchant.favorite ? 'active' : ''}`}
          onClick={onFavorite}
          aria-label={merchant.favorite ? 'Remove favorite' : 'Add favorite'}
        >
          {merchant.favorite ? 'ON' : 'OFF'}
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

      <Button variant="outline" className="merchant-card__action" onClick={onOpen}>
        View details
      </Button>
    </Card>
  );
};
