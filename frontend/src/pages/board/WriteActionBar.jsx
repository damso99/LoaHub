import { Button } from '../../components/Button';

export const WriteActionBar = ({ onCancel, loading }) => {
  return (
    <div className="write-action-bar">
      <Button type="button" variant="outline" onClick={onCancel}>
        취소
      </Button>
      <Button type="submit" className="write-action-bar__submit" disabled={loading}>
        {loading ? '작성 중...' : '작성 완료'}
      </Button>
    </div>
  );
};
