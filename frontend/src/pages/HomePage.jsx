import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { TodayScheduleSection } from '../components/TodayScheduleSection';

export const HomePage = () => {
  const { posts } = useAppState();
  const popularPosts = [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 4);

  return (
    <div className="page-stack home-page">
      <TodayScheduleSection />

      <PageHeader
        title="인기 게시물"
        description="로아허브에서 지금 가장 반응이 많은 게시물을 한눈에 확인하세요."
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
          <h2>LoaHub 둘러보기</h2>
          <p>게시판과 캘린더, 쪽지까지 이어지는 게임 커뮤니티의 기본 흐름을 한곳에 모았습니다.</p>
        </div>
        <div className="hero-actions">
          <Button as={Link} to="/boards/free">
            게시판 보기
          </Button>
          <Button as={Link} to="/messages" variant="secondary">
            쪽지 확인
          </Button>
        </div>
      </Card>
    </div>
  );
};
