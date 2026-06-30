export const ImageUploadBox = ({ previews = [], onSelect, onRemove }) => {
  return (
    <div className="write-upload-box">
      <label className="write-upload-box__dropzone">
        <input type="file" accept="image/*" multiple onChange={onSelect} />
        <strong>이미지를 드래그하거나 클릭해서 첨부</strong>
        <span>PNG, JPG, WEBP 파일을 최대한 가볍게 미리볼 수 있습니다.</span>
      </label>

      {previews.length ? (
        <div className="write-upload-grid">
          {previews.map((preview) => (
            <div key={preview.id} className="write-upload-preview">
              <button type="button" className="write-upload-preview__remove" onClick={() => onRemove(preview.id)}>
                ×
              </button>
              <img src={preview.url} alt={preview.name} />
              <div className="write-upload-preview__meta">
                <strong>{preview.name}</strong>
                <span>{preview.sizeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
