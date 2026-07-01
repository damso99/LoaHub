import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { TodayScheduleSection } from '../components/TodayScheduleSection';
import { useEffect, useState } from 'react';

export const HomePage = () => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPopularPosts = async () => {
      setLoadingPosts(true);
      try {
        const response = await api.getBestPosts({ boardSlug: 'free', period: 'daily' });
        if (cancelled) return;

        const payload = response?.data?.data ?? response?.data ?? [];
        setPopularPosts(Array.isArray(payload) ? payload : payload?.items ?? []);
      } catch {
        if (!cancelled) {
          setPopularPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPosts(false);
        }
      }
    };

    void loadPopularPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-stack home-page">
      <TodayScheduleSection />

      <PageHeader
        title="인기 게시물"
        description="지금 가장 반응이 많은 게시물을 확인하세요."
        action={
          <Button as={Link} to="/boards/free" variant="ghost">
            게시판으로 이동
          </Button>
        }
      />

      {loadingPosts ? (
        <Card className="section-card">
          <h2>인기 게시물을 불러오는 중입니다.</h2>
          <p>잠시만 기다려 주세요.</p>
        </Card>
      ) : (
        <section className="grid grid-2">
          {popularPosts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="popular-post-link">
              <Card className="popular-post-card">
                <div className="popular-post-card__top">
                  <div className="popular-post-card__meta">
                    {post.pinned ? <Badge tone="primary">공지</Badge> : <Badge tone="neutral">인기</Badge>}
                    {post.categoryName ? <Badge tone="info">{post.categoryName}</Badge> : null}
                  </div>
                  <span className="popular-post-card__count">좋아요 {Number(post.likeCount ?? 0)}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <div className="popular-post-card__bottom">
                  <span>{post.author}</span>
                  <span>{post.createdAt}</span>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}

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
