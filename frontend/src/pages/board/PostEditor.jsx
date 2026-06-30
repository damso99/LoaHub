export const PostEditor = ({ value, onChange, error }) => {
  return (
    <div className="write-editor">
      <div className="write-editor__toolbar" aria-hidden="true">
        <button type="button">굵게</button>
        <button type="button">링크</button>
        <button type="button">이미지</button>
        <button type="button">코드</button>
      </div>
      <textarea
        className={`write-textarea ${error ? 'write-textarea--error' : ''}`.trim()}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="모험가들과 나누고 싶은 이야기를 편하게 작성해 주세요."
      />
      {error ? <p className="write-field-error">{error}</p> : null}
    </div>
  );
};
