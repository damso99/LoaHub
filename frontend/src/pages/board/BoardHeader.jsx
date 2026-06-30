export const BoardHeader = ({ title, description, action, meta }) => {
  return (
    <section className="board-hero-card">
      <div className="board-hero-card__copy">
        <p className="board-eyebrow">LoaHub Community</p>
        <h1 className="board-hero-card__title">{title}</h1>
        <p className="board-hero-card__description">{description}</p>
        {meta ? <p className="board-hero-card__meta">{meta}</p> : null}
      </div>
      {action ? <div className="board-hero-card__action">{action}</div> : null}
    </section>
  );
};
