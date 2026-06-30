export const BoardHeader = ({ title, description, action, meta }) => {
  return (
    <section className="board-header-card">
      <div className="board-header-card__copy">
        <p className="board-eyebrow">LoaHub Community</p>
        <h1 className="board-header-card__title">{title}</h1>
        <p className="board-header-card__description">{description}</p>
        {meta ? <p className="board-header-card__meta">{meta}</p> : null}
      </div>
      {action ? <div className="board-header-card__action">{action}</div> : null}
    </section>
  );
};
