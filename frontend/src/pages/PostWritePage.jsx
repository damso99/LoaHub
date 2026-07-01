import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/Card';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { BoardHeader } from './board/BoardHeader';
import { PostEditor } from './board/PostEditor';
import { WriteActionBar } from './board/WriteActionBar';
import { getBoardSlugByType, getBoardTitle, normalizeBoardPayload, resolveBoardList } from './board/boardUtils';

const createInitialForm = (boardSlug) => ({
  boardType: boardSlug.startsWith('class/') ? 'CLASS' : 'FREE',
  boardSlug,
  categoryCode: '',
  jobClass: '',
  title: '',
  content: '',
  pinned: false,
});

const buildPostRequestBody = (form, selectedBoard) => {
  const boardId = Number(selectedBoard?.id ?? 0);

  return {
    boardId: Number.isFinite(boardId) && boardId > 0 ? boardId : undefined,
    boardSlug: selectedBoard?.slug ?? form.boardSlug,
    categoryCode: form.categoryCode,
    title: form.title.trim(),
    content: form.content.trim(),
    pinned: Boolean(form.pinned),
  };
};

export const PostWritePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardParam = searchParams.get('board') ?? 'free';
  const postId = searchParams.get('postId');
  const { user, isAdmin } = useAuthGuard();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(createInitialForm(boardParam));

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const response = await api.getBoards();
        if (cancelled) return;

        const payload = normalizeBoardPayload(response);
        setBoards(resolveBoardList(payload));
      } catch (exception) {
        if (!cancelled) {
          setBoards([]);
          setErrors((current) => ({ ...current, form: exception?.message ?? '게시판 정보를 불러오지 못했습니다.' }));
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
  }, []);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const response = await api.getPost(postId);
        if (cancelled) return;

        const payload = normalizeBoardPayload(response);
        const post = payload?.post ?? payload;
        if (!post) {
          return;
        }

        setForm((current) => ({
          ...current,
          boardType: post.boardType ?? current.boardType,
          boardSlug: post.boardSlug ?? current.boardSlug,
          categoryCode: post.categoryCode ?? current.categoryCode,
          jobClass: post.classCode ?? current.jobClass,
          title: post.title ?? current.title,
          content: post.content ?? current.content,
          pinned: Boolean(post.pinned),
        }));
      } catch {
        // 기존 글을 불러오지 못해도 작성 화면은 유지한다.
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const selectedBoard = useMemo(() => {
    if (!boards.length) {
      return null;
    }

    return (
      boards.find((board) => board.slug === form.boardSlug) ??
      boards.find((board) => board.slug === boardParam) ??
      boards.find((board) => board.boardType === form.boardType) ??
      boards[0]
    );
  }, [boardParam, boards, form.boardSlug, form.boardType]);

  const boardOptions = useMemo(() => boards.filter((board) => board.boardType === 'CLASS'), [boards]);
  const categories = selectedBoard?.categories ?? [];

  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    setForm((current) => ({
      ...current,
      boardType: selectedBoard.boardType,
      boardSlug: selectedBoard.slug,
      categoryCode: current.categoryCode || selectedBoard.categories?.[0]?.categoryCode || '',
      jobClass: selectedBoard.classCode ?? current.jobClass,
    }));
  }, [selectedBoard]);

  const updateBoardType = (nextBoardType) => {
    const nextType = nextBoardType === 'CLASS' ? 'CLASS' : 'FREE';
    const nextBoard =
      nextType === 'CLASS'
        ? boards.find((board) => board.boardType === 'CLASS')
        : boards.find((board) => board.boardType === 'FREE');

    setForm((current) => ({
      ...current,
      boardType: nextType,
      boardSlug: nextBoard?.slug ?? getBoardSlugByType(nextType, nextBoard?.classCode),
      categoryCode: nextBoard?.categories?.[0]?.categoryCode ?? '',
      jobClass: nextType === 'CLASS' ? nextBoard?.classCode ?? '' : '',
    }));
  };

  const updateJobClass = (slug) => {
    const nextBoard = boards.find((board) => board.slug === slug);
    if (!nextBoard) {
      return;
    }

    setForm((current) => ({
      ...current,
      boardType: nextBoard.boardType,
      boardSlug: nextBoard.slug,
      categoryCode: current.categoryCode || nextBoard.categories?.[0]?.categoryCode || '',
      jobClass: nextBoard.classCode ?? '',
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = '제목을 입력해 주세요.';
    }
    if (!form.content.trim()) {
      nextErrors.content = '내용을 입력해 주세요.';
    }
    if (!form.categoryCode) {
      nextErrors.categoryCode = '카테고리를 선택해 주세요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const payload = buildPostRequestBody(form, selectedBoard);

      if (postId) {
        const response = await api.updatePost(postId, payload);
        const nextPayload = normalizeBoardPayload(response);
        const nextPost = nextPayload?.post ?? nextPayload;
        navigate(`/posts/${nextPost.id}`);
        return;
      }

      const response = await api.createPost(payload);
      const nextPayload = normalizeBoardPayload(response);
      const nextPost = nextPayload?.post ?? nextPayload;
      navigate(`/posts/${nextPost.id}`);
    } catch (exception) {
      setErrors((current) => ({ ...current, form: exception?.message ?? '게시글 작성에 실패했습니다.' }));
    } finally {
      setSaving(false);
    }
  };

  const boardTitle = selectedBoard?.boardName ?? getBoardTitle(form.boardType);

  return (
    <div className="page-stack write-page write-shell">
      <BoardHeader
        title={postId ? '게시글 수정' : '게시글 작성'}
        description="LoaHub 게시판에 실제로 저장되는 글을 작성합니다."
        meta={`${user?.nickname ?? '익명'} · ${boardTitle}`}
      />

      <Card className="write-form-card">
        <form className="write-form" onSubmit={handleSubmit}>
          <div className="write-form__grid">
            <label className="write-field">
              <span className="write-field__label">
                게시판 선택 <em>*</em>
              </span>
              <select
                className="board-input board-select"
                value={form.boardType}
                onChange={(event) => updateBoardType(event.target.value)}
              >
                <option value="FREE">자유게시판</option>
                <option value="CLASS">직업게시판</option>
              </select>
            </label>

            <label className="write-field">
              <span className="write-field__label">
                카테고리 선택 <em>*</em>
              </span>
              <select
                className={`board-input board-select ${errors.categoryCode ? 'board-input--error' : ''}`.trim()}
                value={form.categoryCode}
                onChange={(event) => setForm((current) => ({ ...current, categoryCode: event.target.value }))}
              >
                <option value="">카테고리를 선택해 주세요.</option>
                {categories.map((category) => (
                  <option key={category.categoryCode} value={category.categoryCode}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryCode ? <p className="write-field-error">{errors.categoryCode}</p> : null}
            </label>

            {form.boardType === 'CLASS' ? (
              <label className="write-field write-field--full">
                <span className="write-field__label">직업 선택</span>
                <select
                  className="board-input board-select"
                  value={form.boardSlug}
                  onChange={(event) => updateJobClass(event.target.value)}
                >
                  {boardOptions.map((board) => (
                    <option key={board.slug} value={board.slug}>
                      {board.className ?? board.boardName}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="write-field write-field--full">
              <span className="write-field__label">
                제목 입력 <em>*</em>
              </span>
              <input
                className={`board-input ${errors.title ? 'board-input--error' : ''}`.trim()}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="게시글 제목을 입력해 주세요."
                maxLength={120}
              />
              {errors.title ? <p className="write-field-error">{errors.title}</p> : null}
            </label>
          </div>

          <section className="write-editor-card">
            <div className="write-field__label write-field__label--block">
              <span>본문 입력 <em>*</em></span>
              <span className="write-field__hint">작성한 내용은 서버에 저장됩니다.</span>
            </div>
            <PostEditor
              value={form.content}
              onChange={(value) => setForm((current) => ({ ...current, content: value }))}
              error={errors.content}
            />
          </section>

          {isAdmin ? (
            <label className="write-pin-toggle">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(event) => setForm((current) => ({ ...current, pinned: event.target.checked }))}
              />
              <span>공지글로 등록</span>
            </label>
          ) : null}

          {errors.form ? <p className="write-field-error write-field-error--form">{errors.form}</p> : null}

          <WriteActionBar onCancel={() => navigate(-1)} loading={saving || loading || !boards.length} />
        </form>
      </Card>
    </div>
  );
};
