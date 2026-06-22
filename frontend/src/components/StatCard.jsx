import { Card } from './Card';

export const StatCard = ({ title, description, stat }) => {
  return (
    <Card className="stat-card">
      <p className="stat-card__title">{title}</p>
      <strong className="stat-card__stat">{stat}</strong>
      <p className="stat-card__desc">{description}</p>
    </Card>
  );
};

