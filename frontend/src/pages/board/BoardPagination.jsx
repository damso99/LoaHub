import { Button } from '../../components/Button';

const buildPages = (current, total) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  const normalizedStart = Math.max(1, end - 4);

  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
};

export const BoardPagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const current = Math.max(Number(page ?? 1), 1);
  const lastPage = Math.max(Number(totalPages), 1);
  const visiblePages = buildPages(current, lastPage);

  return (
    <nav className="board-pagination" aria-label="게시판 페이지 이동">
      <Button variant="outline" onClick={() => onPageChange(Math.max(1, current - 1))} disabled={current <= 1}>
        이전
      </Button>

      <div className="board-pagination__pages">
        {visiblePages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === current ? 'primary' : 'outline'}
            className={`board-pagination__page ${pageNumber === current ? 'board-pagination__page--active' : ''}`.trim()}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
      </div>

      <Button variant="outline" onClick={() => onPageChange(Math.min(lastPage, current + 1))} disabled={current >= lastPage}>
        다음
      </Button>
    </nav>
  );
};
