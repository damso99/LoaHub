import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { formatRelativeLabel } from './boardUtils';

const formatCount = (value) => Number(value ?? 0).toLocaleString();

export const BoardPostCard = ({ post, isMine = false }) => {
  const categoryTone = post.isNotice ? 'primary' : 'neutral';

  return (
    <Link to={`/posts/${post.id}`} className={`post-row-card ${post.isNotice ? 'post-row-card--notice' : ''}`}>
      <div className="post-row-card__left">
        <Badge tone={categoryTone}>{post.isNotice ? '공지' : post.categoryName}</Badge>
        {post.isHot ? <Badge tone="default">HOT</Badge> : null}
        {post.isNew ? <Badge tone="default">NEW</Badge> : null}
        {isMine ? <Badge tone="primary">MY</Badge> : null}
      </div>

      <div className="post-row-card__content">
        <div className="post-row-card__title-line">
          <strong className="post-row-card__title">{post.title}</strong>
          <span className="post-row-card__comment-count">[{formatCount(post.commentCount)}]</span>
        </div>
        <div className="post-row-card__meta">
          <span className="post-row-card__writer">{post.writer}</span>
          <span className="post-row-card__dot">·</span>
          <span>{formatRelativeLabel(post.createdAt)}</span>
        </div>
      </div>

      <div className="post-row-card__stats">
        <span>
          <em>조회</em>
          {formatCount(post.viewCount)}
        </span>
        <span>
          <em>댓글</em>
          {formatCount(post.commentCount)}
        </span>
        <span>
          <em>추천</em>
          {formatCount(post.likeCount)}
        </span>
      </div>
    </Link>
  );
};
