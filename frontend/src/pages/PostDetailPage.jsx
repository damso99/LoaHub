import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts, addComment, deletePost, togglePostLike } = useAppState();
  const { user, isAdmin, requireLogin } = useAuthGuard();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const post = useMemo(
    () => posts.find((item) => String(item.id) === String(postId)) ?? posts[0],
    [posts, postId],
  );
  const canManagePost = Boolean(post && (isAdmin || user?.id === post.userId));

  const handleComment = (event) => {
    event.preventDefault();

    if (!requireLogin()) {
      return;
    }

    const nextComment = addComment(post.id, comment);
    setComments((current) => [nextComment, ...current]);
    setComment('');
  };

  const handleDeleteComment = (commentId) => {
    setComments((current) => current.filter((item) => item.id !== commentId));
  };

  return (
    <div className="page-stack post-detail-page">
      <PageHeader
        title={post.title}
        description={`${post.author} · ${post.createdAt} · 조회수 ${post.viewCount.toLocaleString()}`}
        action={
          <div className="inline-actions">
            <Button
              variant="secondary"
              onClick={() => {
                if (!requireLogin()) {
                  return;
                }
                togglePostLike(post.id);
              }}
            >
              좋아요 {post.likeCount}
            </Button>
            {canManagePost ? (
              <>
                <Button as={Link} to={`/write?postId=${post.id}`} variant="outline">
                  수정
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    deletePost(post.id);
                    navigate('/boards/free');
                  }}
                >
                  삭제
                </Button>
              </>
            ) : null}
            <Button as={Link} to="/boards/free" variant="ghost">
              목록
            </Button>
          </div>
        }
      />

      <Card className="post-detail">
        <div className="post-detail__badges">
          <Badge tone="primary">{post.className}</Badge>
          {post.tags?.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="post-detail__content">{post.content}</p>
      </Card>

      <Card className="comment-card">
        <h2>댓글</h2>
        <form className="comment-form" onSubmit={handleComment}>
          <Input
            placeholder="댓글을 입력하세요"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <Button type="submit">작성</Button>
        </form>
        <div className="comment-list">
          {comments.map((item) => (
            <div key={item.id} className="comment-item">
              <strong>{item.author}</strong>
              <p>{item.content}</p>
              <div className="comment-item__footer">
                <span>{item.createdAt}</span>
                {isAdmin || user?.id === item.userId ? (
                  <button type="button" className="text-button" onClick={() => handleDeleteComment(item.id)}>
                    삭제
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
