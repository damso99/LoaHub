import { Button } from './Button';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const current = Math.max(Number(page ?? 1), 1);
  const lastPage = Math.max(Number(totalPages), 1);

  return (
    <div className="pagination">
      <Button variant="outline" onClick={() => onPageChange(Math.max(1, current - 1))} disabled={current <= 1}>
        이전
      </Button>
      <span className="pagination__info">
        {current} / {lastPage}
      </span>
      <Button variant="outline" onClick={() => onPageChange(Math.min(lastPage, current + 1))} disabled={current >= lastPage}>
        다음
      </Button>
    </div>
  );
};
