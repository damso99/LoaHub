import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useAuthGuard } from '../hooks/useAuthGuard';

const normalizePayload = (response) => response?.data?.data ?? response?.data ?? response;

export const WritePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  const boardParam = searchParams.get('board') ?? 'free';
  const { user, isAdmin } = useAuthGuard();
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingPost, setLoadingPost] = useState(Boolean(postId));
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    boardSlug: boardParam,
    categoryCode: '',
    title: '',
    content: '',
    pinned: false,
  });

  useEffect(() => {
    let cancelled = false;

    const loadBoards = async () => {
      try {
        setLoadingBoards(true);
        const response = await api.getBoards();
        if (cancelled) {
          return;
        }

        const payload = normalizePayload(response);
        const boardList = Array.isArray(payload) ? payload : payload?.data ?? [];
        setBoards(boardList);
        setError('');
      } catch (exception) {
        if (!cancelled) {
          setError(exception?.message ?? '게시판 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoadingBoards(false);
        }
      }
    };

    void loadBoards();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBoard = useMemo(() => {
    return boards.find((board) => board.slug === form.boardSlug) ?? boards.find((board) => board.slug === boardParam) ?? boards.find((board) => board.boardType === 'FREE') ?? null;
  }, [boardParam, boards, form.boardSlug]);

  const categories = selectedBoard?.categories ?? [];

  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    setForm((current) => ({
      ...current,
      boardSlug: selectedBoard.slug,
      categoryCode: current.categoryCode || selectedBoard.categories?.[0]?.categoryCode || '',
    }));
  }, [selectedBoard]);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const loadPost = async () => {
      try {
        setLoadingPost(true);
        const response = await api.getPost(postId);
        if (cancelled) {
          return;
        }

        const payload = normalizePayload(response);
        const post = payload?.post ?? payload;
        if (!isAdmin && post.userId !== user?.id) {
          window.alert('본인이 작성한 게시글만 수정할 수 있습니다.');
          navigate(`/posts/${post.id}`, { replace: true });
          return;
        }

        setForm({
          boardSlug: post.boardSlug ?? boardParam,
          categoryCode: post.categoryCode ?? '',
          title: post.title ?? '',
          content: post.content ?? '',
          pinned: Boolean(post.pinned),
        });
        setError('');
      } catch (exception) {
        if (!cancelled) {
          setError(exception?.message ?? '게시글 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoadingPost(false);
        }
      }
    };

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [boardParam, isAdmin, navigate, postId, user?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBoard) {
      window.alert('게시판 정보를 확인할 수 없습니다.');
      return;
    }

    if (!form.categoryCode) {
      window.alert('카테고리를 선택해 주세요.');
      return;
    }

    try {
      const payload = {
        boardSlug: form.boardSlug,
        categoryCode: form.categoryCode,
        title: form.title.trim(),
        content: form.content.trim(),
        pinned: Boolean(form.pinned),
      };

      if (postId) {
        const response = await api.updatePost(postId, payload);
        const nextPost = normalizePayload(response)?.post ?? normalizePayload(response);
        navigate(`/posts/${nextPost.id}`);
        return;
      }

      const response = await api.createPost(payload);
      const nextPost = normalizePayload(response)?.post ?? normalizePayload(response);
      navigate(`/posts/${nextPost.id}`);
    } catch (exception) {
      window.alert(exception?.message ?? '게시글 저장에 실패했습니다.');
    }
  };

  const loading = loadingBoards || loadingPost;
  const boardLabel = selectedBoard?.boardName ?? '게시판';

  return (
    <div className="page-stack narrow">
      <PageHeader
        title={postId ? '게시글 수정' : '글쓰기'}
        description={`${boardLabel}에 게시글을 작성합니다. 카테고리와 공지 여부를 선택할 수 있습니다.`}
      />

      <Card className="form-card">
        {loading ? (
          <div className="loading-state">
            <p className="loading-state__title">불러오는 중입니다.</p>
            <p className="loading-state__desc">게시판과 기존 게시글 정보를 확인하고 있습니다.</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-state__title">정보를 불러오지 못했습니다.</p>
            <p className="error-state__desc">{error}</p>
          </div>
        ) : (
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="board-write-meta">
              <Badge tone="primary">{boardLabel}</Badge>
              <span className="field-hint">게시판은 URL의 `board` 값으로 고정됩니다.</span>
            </div>

            <label className="field">
              <span className="field-label">카테고리</span>
              <select
                className="input"
                value={form.categoryCode}
                onChange={(event) => setForm((current) => ({ ...current, categoryCode: event.target.value }))}
              >
                <option value="">카테고리를 선택해 주세요</option>
                {categories.map((category) => (
                  <option key={category.categoryCode} value={category.categoryCode}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="제목"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              maxLength={255}
            />

            <label className="field">
              <span className="field-label">내용</span>
              <textarea
                className="textarea"
                rows="12"
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              />
            </label>

            {isAdmin ? (
              <label className="board-write-pin">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(event) => setForm((current) => ({ ...current, pinned: event.target.checked }))}
                />
                <span>공지글로 등록</span>
              </label>
            ) : null}

            <div className="inline-actions">
              <Button type="submit">{postId ? '수정하기' : '등록하기'}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                취소
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
