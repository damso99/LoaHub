import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { PostTable } from '../components/PostTable';
import { useAuthGuard } from '../hooks/useAuthGuard';

export const BoardsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { posts } = useAppState();
  const { requireLogin } = useAuthGuard();
  const [tab, setTab] = useState(location.pathname.includes('/class') ? 'class' : 'free');

  const visiblePosts = useMemo(() => {
    if (tab === 'free') {
      return posts.filter((post) => post.boardId === 1);
    }
    return posts.filter((post) => post.boardId !== 1);
  }, [posts, tab]);

  return (
    <div className="page-stack board-page">
      <PageHeader
        title="커뮤니티 게시판"
        description="자유게시판과 직업별 게시판을 한눈에 탐색할 수 있습니다."
        action={
          <Button
            onClick={() => {
              if (!requireLogin()) {
                return;
              }
              navigate('/write');
            }}
          >
            글쓰기
          </Button>
        }
      />

      <div className="tab-row">
        <button type="button" className={`tab-pill ${tab === 'free' ? 'active' : ''}`} onClick={() => setTab('free')}>
          자유
        </button>
        <button type="button" className={`tab-pill ${tab === 'class' ? 'active' : ''}`} onClick={() => setTab('class')}>
          직업
        </button>
      </div>

      {tab === 'class' ? (
        <div className="chip-scroll">
          {['슬레이어', '소서리스', '바드', '아르카나', '리퍼', '기상술사'].map((className) => (
            <Badge key={className} tone="neutral">
              {className}
            </Badge>
          ))}
        </div>
      ) : null}

      <PostTable posts={visiblePosts} />
    </div>
  );
};
