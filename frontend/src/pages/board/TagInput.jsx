import { Button } from '../../components/Button';

export const TagInput = ({ value = [], inputValue, onInputChange, onAddTag, onRemoveTag }) => {
  return (
    <div className="write-tag-box">
      <div className="write-tag-box__input-row">
        <input
          className="board-input"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="태그를 입력하고 Enter"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onAddTag();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={onAddTag}>
          추가
        </Button>
      </div>

      <div className="write-tag-list">
        {value.map((tag) => (
          <span key={tag} className="write-tag-chip">
            {tag}
            <button type="button" onClick={() => onRemoveTag(tag)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
