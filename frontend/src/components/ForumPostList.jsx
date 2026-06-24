import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Card } from './Card';
import { EmptyState } from './EmptyState';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const getTitleBadge = (post) => {
  if (post.pinned) {
    return '공지';
  }

  return post.categoryName ?? post.categoryCode ?? '기타';
};

export const ForumPostList = ({ posts = [], emptyTitle, emptyDescription }) => {
  if (!posts.length) {
    return (
      <EmptyState
        title={emptyTitle ?? '등록된 게시글이 없습니다.'}
        description={emptyDescription ?? '조건에 맞는 게시글이 없으면 새 글을 작성해 보세요.'}
      />
    );
  }

  return (
    <Card className="forum-list-card">
      <div className="forum-list forum-list--desktop">
        <div className="forum-list__header">
          <span>제목</span>
          <span>작성자</span>
          <span>조회</span>
          <span>추천</span>
          <span>댓글</span>
          <span>작성일</span>
        </div>
        <div className="forum-list__body">
          {posts.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className={`forum-row ${post.pinned ? 'forum-row--pinned' : ''}`}>
              <div className="forum-row__title">
                <div className="forum-row__badges">
                  <Badge tone={post.pinned ? 'primary' : 'neutral'}>{getTitleBadge(post)}</Badge>
                  {post.boardType === 'CLASS' ? <Badge tone="neutral">{post.className}</Badge> : null}
                </div>
                <strong>{post.title}</strong>
                <span className="forum-row__comments">댓글 {post.commentCount}</span>
              </div>
              <span>{post.author}</span>
              <span>{Number(post.viewCount ?? 0).toLocaleString()}</span>
              <span>{Number(post.likeCount ?? 0).toLocaleString()}</span>
              <span>{Number(post.commentCount ?? 0).toLocaleString()}</span>
              <span>{formatDate(post.createdAt)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="forum-list forum-list--mobile">
        {posts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`} className={`forum-card ${post.pinned ? 'forum-card--pinned' : ''}`}>
            <div className="forum-card__top">
              <div className="forum-row__badges">
                <Badge tone={post.pinned ? 'primary' : 'neutral'}>{getTitleBadge(post)}</Badge>
                {post.boardType === 'CLASS' ? <Badge tone="neutral">{post.className}</Badge> : null}
              </div>
              <span className="forum-card__date">{formatDate(post.createdAt)}</span>
            </div>
            <strong className="forum-card__title">{post.title}</strong>
            <p className="forum-card__meta">
              {post.author} · 조회 {Number(post.viewCount ?? 0).toLocaleString()} · 추천 {Number(post.likeCount ?? 0).toLocaleString()} · 댓글 {Number(post.commentCount ?? 0).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
};
