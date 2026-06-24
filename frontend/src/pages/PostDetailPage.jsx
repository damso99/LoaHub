import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

const normalizePayload = (response) => response?.data?.data ?? response?.data ?? response;

const formatDateTime = (value) => {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, requireLogin } = useAuthGuard();
  const [detail, setDetail] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetail = async () => {
    const response = await api.getPost(postId);
    const payload = normalizePayload(response);
    setDetail(payload);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.getPost(postId);
        if (cancelled) {
          return;
        }

        setDetail(normalizePayload(response));
      } catch (exception) {
        if (!cancelled) {
          setError(exception?.message ?? '게시글을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const post = detail?.post ?? null;
  const comments = detail?.comments ?? [];
  const canManagePost = Boolean(post && (isAdmin || user?.id === post.userId));

  const refreshPost = async () => {
    await loadDetail();
  };

  const handleLike = async () => {
    if (!requireLogin()) {
      return;
    }

    try {
      await api.togglePostLike(post.id);
      await refreshPost();
    } catch (exception) {
      window.alert(exception?.message ?? '추천 처리에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!requireLogin()) {
      return;
    }

    const trimmed = commentContent.trim();
    if (!trimmed) {
      window.alert('댓글 내용을 입력해 주세요.');
      return;
    }

    try {
      await api.createComment(post.id, { content: trimmed });
      setCommentContent('');
      await refreshPost();
    } catch (exception) {
      window.alert(exception?.message ?? '댓글 작성에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.deletePost(post.id);
      const nextBoardPath =
        post.boardType === 'CLASS' && post.classCode ? `/boards/class/${post.classCode}` : '/boards/free';
      navigate(nextBoardPath, { replace: true });
    } catch (exception) {
      window.alert(exception?.message ?? '게시글 삭제에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.deleteComment(commentId);
      await refreshPost();
    } catch (exception) {
      window.alert(exception?.message ?? '댓글 삭제에 실패했습니다.');
    }
  };

  const writeLink = useMemo(() => {
    if (!post) {
      return '/posts/write?board=free';
    }
    return `/posts/write?board=${encodeURIComponent(post.boardSlug)}&postId=${post.id}`;
  }, [post]);

  if (loading) {
    return (
      <div className="page-stack board-page">
        <PageHeader title="게시글 상세" description="게시글 정보를 불러오는 중입니다." />
        <Card className="empty-state empty-panel">
          <h2 className="empty-panel__title">게시글을 불러오는 중입니다.</h2>
          <p className="empty-panel__desc">댓글과 추천 수를 포함한 상세 정보를 조회하고 있습니다.</p>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page-stack board-page">
        <PageHeader title="게시글 상세" description="게시글 정보를 불러오지 못했습니다." />
        <Card className="empty-state empty-panel">
          <h2 className="empty-panel__title">게시글을 찾을 수 없습니다.</h2>
          <p className="empty-panel__desc">{error || '삭제되었거나 잘못된 주소입니다.'}</p>
          <Button as={Link} to="/boards/free" variant="outline">
            목록으로
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack post-detail-page">
      <PageHeader
        title={post.title}
        description={`${post.author} · ${formatDateTime(post.createdAt)} · 조회 ${Number(post.viewCount ?? 0).toLocaleString()} · 추천 ${Number(post.likeCount ?? 0).toLocaleString()}`}
        action={
          <div className="inline-actions">
            <Button variant="secondary" onClick={handleLike}>
              추천 {Number(post.likeCount ?? 0).toLocaleString()}
            </Button>
            {canManagePost ? (
              <>
            <Button as={Link} to={writeLink} variant="outline">
                  수정
                </Button>
                <Button variant="ghost" onClick={handleDeletePost}>
                  삭제
                </Button>
              </>
            ) : null}
            <Button
              as={Link}
              to={post.boardType === 'CLASS' && post.classCode ? `/boards/class/${post.classCode}` : '/boards/free'}
              variant="ghost"
            >
              목록
            </Button>
          </div>
        }
      />

      <Card className="post-detail">
        <div className="post-detail__badges">
          <Badge tone={post.pinned ? 'primary' : 'neutral'}>{post.pinned ? '공지' : post.categoryName}</Badge>
          <Badge tone="neutral">{post.boardName}</Badge>
          {post.boardType === 'CLASS' ? <Badge tone="neutral">{post.className}</Badge> : null}
        </div>
        <p className="post-detail__content">{post.content}</p>
      </Card>

      <Card className="comment-card">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">댓글</p>
            <h2>댓글 {comments.length}</h2>
          </div>
        </div>

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <Input
            placeholder="댓글을 입력해 주세요."
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
          />
          <Button type="submit">작성</Button>
        </form>

        <div className="comment-list">
          {comments.map((item) => (
            <div key={item.id} className="comment-item">
              <strong>{item.author}</strong>
              <p>{item.content}</p>
              <div className="comment-item__footer">
                <span>{formatDateTime(item.createdAt)}</span>
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
