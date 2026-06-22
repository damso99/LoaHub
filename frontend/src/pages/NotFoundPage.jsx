import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const NotFoundPage = () => {
  return (
    <Card className="empty-state">
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>요청한 경로가 존재하지 않습니다.</p>
      <Button as={Link} to="/intro">
        홈으로 이동
      </Button>
    </Card>
  );
};
