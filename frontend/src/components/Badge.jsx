export const Badge = ({ children, tone = 'default' }) => {
  return <span className={`badge badge-${tone}`}>{children}</span>;
};

