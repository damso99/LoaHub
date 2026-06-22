import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { EmptyState } from './EmptyState';
import { Card } from './Card';

export const PostTable = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="아직 등록된 게시글이 없습니다."
        description="조건에 맞는 게시글이 없을 때는 글쓰기 버튼으로 첫 게시글을 작성해보세요."
      />
    );
  }

  return (
    <Card className="table-card">
      <div className="table-card__header">
        <span>제목</span>
        <span>작성자</span>
        <span>조회수</span>
        <span>작성일</span>
      </div>
      <div className="table-card__body">
        {posts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`} className="table-row">
            <div className="table-row__title">
              <div className="table-row__meta">
                {post.pinned ? <Badge tone="primary">가이드</Badge> : null}
                {post.tags?.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
              <strong>{post.title}</strong>
            </div>
            <span>{post.author}</span>
            <span>{post.viewCount.toLocaleString()}</span>
            <span>{post.createdAt}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
};
