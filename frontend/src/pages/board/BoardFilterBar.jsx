import { Button } from '../../components/Button';

const filterTabs = [
  { key: 'all', label: '전체' },
  { key: 'notice', label: '공지' },
  { key: 'hot', label: '인기' },
  { key: 'question', label: '질문' },
  { key: 'info', label: '정보' },
];

export const BoardFilterBar = ({
  searchValue,
  onSearchChange,
  categoryValue,
  onCategoryChange,
  sortValue,
  onSortChange,
  boardValue,
  onBoardChange,
  boardOptions = [],
  showBoardPicker = false,
}) => {
  return (
    <section className="board-filter-card">
      <div className="board-filter-grid">
        <label className="board-field board-field--search">
          <span className="board-field__label">검색</span>
          <input
            className="board-input board-input--search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="제목, 작성자 검색"
          />
        </label>

        {showBoardPicker ? (
          <label className="board-field">
            <span className="board-field__label">직업 선택</span>
            <select className="board-input board-select" value={boardValue} onChange={(event) => onBoardChange(event.target.value)}>
              {boardOptions.map((board) => (
                <option key={board.slug} value={board.slug}>
                  {board.className ?? board.boardName}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="board-field">
          <span className="board-field__label">정렬</span>
          <select className="board-input board-select" value={sortValue} onChange={(event) => onSortChange(event.target.value)}>
            <option value="latest">최신순</option>
            <option value="likes">추천순</option>
            <option value="views">조회순</option>
            <option value="comments">댓글순</option>
          </select>
        </label>
      </div>

      <div className="board-category-tabs">
        {filterTabs.map((item) => (
          <Button
            key={item.key}
            variant={categoryValue === item.key ? 'secondary' : 'outline'}
            className="board-filter-tab"
            onClick={() => onCategoryChange(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </section>
  );
};
