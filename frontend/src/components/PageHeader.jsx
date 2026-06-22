export const PageHeader = ({ title, description, action }) => {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">LoaHub Community</p>
        <h1>{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action ? <div className="page-action">{action}</div> : null}
    </div>
  );
};

