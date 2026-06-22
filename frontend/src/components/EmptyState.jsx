import { Card } from './Card';

export const EmptyState = ({ title, description, action }) => {
  return (
    <Card className="empty-state empty-panel">
      <h2 className="empty-panel__title">{title}</h2>
      <p className="empty-panel__desc">{description}</p>
      {action ? <div>{action}</div> : null}
    </Card>
  );
};
