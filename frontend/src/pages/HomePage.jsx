import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CalendarCard } from '../components/CalendarCard';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';

export const HomePage = () => {
  const { highlights, posts } = useAppState();
  const popularPosts = [...posts]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 4);
  const calendarItems = highlights.slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-copy">
          <p className="eyebrow">LoaHub Community</p>
          <h1>로스트아크 커뮤니티 허브</h1>
          <p>캘린더 콘텐츠와 인기 게시물을 한 번에 확인할 수 있는 홈 화면입니다.</p>
        </div>
      </section>

      <PageHeader
        title="오늘의 캘린더"
        description="로아 주요 콘텐츠와 알림 상태를 빠르게 확인하세요."
        action={
          <Button as={Link} to="/calendar" variant="secondary">
            캘린더 전체보기
          </Button>
        }
      />

      <section className="grid grid-3">
        {calendarItems.map((content) => (
          <CalendarCard key={content.id} content={content} enabled={false} onToggle={() => undefined} />
        ))}
      </section>

      <PageHeader
        title="인기 게시물"
        description="좋아요가 많은 게시물을 먼저 확인할 수 있습니다."
        action={
          <Button as={Link} to="/boards/free" variant="ghost">
            게시판으로 이동
          </Button>
        }
      />

      <section className="grid grid-2">
        {popularPosts.map((post) => (
          <Card key={post.id} className="popular-post-card">
            <div className="popular-post-card__top">
              <div className="popular-post-card__meta">
                {post.pinned ? <Badge tone="primary">공지</Badge> : <Badge tone="neutral">인기</Badge>}
                {post.tags?.[0] ? <Badge tone="info">{post.tags[0]}</Badge> : null}
              </div>
              <span className="popular-post-card__count">좋아요 {post.likeCount}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <div className="popular-post-card__bottom">
              <span>{post.author}</span>
              <span>{post.createdAt}</span>
            </div>
          </Card>
        ))}
      </section>

      <Card className="section-card home-footer-card">
        <div>
          <h2>LoaHub 한눈에 보기</h2>
          <p>게시판, 캘린더, 떠돌이상인, 쪽지까지 이어지는 게임 커뮤니티 흐름을 홈에서 보여줍니다.</p>
        </div>
        <div className="hero-actions">
          <Button as={Link} to="/boards/free">게시판 보기</Button>
          <Button as={Link} to="/merchant" variant="secondary">떠돌이상인</Button>
        </div>
      </Card>
    </div>
  );
};
