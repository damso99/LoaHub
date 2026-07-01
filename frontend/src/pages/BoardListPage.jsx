import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { BoardFilterBar } from './board/BoardFilterBar';
import { BoardHeader } from './board/BoardHeader';
import { BoardPagination } from './board/BoardPagination';
import { BoardPostCard } from './board/BoardPostCard';
import { BoardSidebar } from './board/BoardSidebar';
import {
  formatDate,
  getBoardDescription,
  getBoardPathBySlug,
  getBoardTitle,
  getCategoryLabel,
  normalizeBoardPayload,
  resolveBoardList,
} from './board/boardUtils';

const normalizePost = (post, currentUserId) => {
  const createdAt = post.createdAt ?? new Date().toISOString();
  const isNew = Date.now() - new Date(createdAt).getTime() <= 1000 * 60 * 60 * 24;
  const isHot = Number(post.likeCount ?? 0) >= 15 || Number(post.commentCount ?? 0) >= 10;
  const categoryName = post.categoryName ?? getCategoryLabel(post.categoryCode);

  return {
    ...post,
    title: post.title ?? '제목 없음',
    writer: post.author ?? post.writer ?? '익명',
    createdAt,
    categoryName,
    categoryCode: post.categoryCode ?? categoryName,
    isNotice: Boolean(post.pinned ?? post.isNotice),
    isHot: Boolean(post.isHot ?? isHot),
    isNew: Boolean(post.isNew ?? isNew),
    isMine: Number(post.userId ?? 0) === Number(currentUserId ?? 0),
  };
};

const parsePage = (value) => {
  const next = Number(value ?? 1);
  return Number.isFinite(next) && next > 0 ? next : 1;
};

const normalizeItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.items) ? payload.items : [];
};

export const BoardListPage = ({ boardType = 'FREE', classCode = null, defaultBoardSlug = 'free' }) => {
  const navigate = useNavigate();
  const routeParams = useParams();
  const resolvedClassCode = classCode ?? routeParams.classCode ?? null;
  const { user, requireLogin } = useAuthGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const [boards, setBoards] = useState([]);
  const [pageState, setPageState] = useState({
    items: [],
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
  });
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState(searchParams.get('keyword') ?? '');

  const categoryValue = searchParams.get('category') ?? 'all';
  const sortValue = searchParams.get('sort') ?? 'latest';
  const pageValue = parsePage(searchParams.get('page'));

  const selectedBoard = useMemo(() => {
    if (!boards.length) {
      return null;
    }

    if (boardType === 'CLASS') {
      if (resolvedClassCode) {
        return (
          boards.find((board) => board.slug === `class/${resolvedClassCode}`) ??
          boards.find((board) => board.boardType === 'CLASS') ??
          boards[0]
        );
      }

      return boards.find((board) => board.boardType === 'CLASS') ?? boards[0];
    }

    return boards.find((board) => board.slug === defaultBoardSlug) ?? boards.find((board) => board.boardType === 'FREE') ?? boards[0];
  }, [boardType, boards, defaultBoardSlug, resolvedClassCode]);

  const pageTitle = selectedBoard?.boardName ?? getBoardTitle(boardType);
  const pageDescription = selectedBoard?.description ?? getBoardDescription(boardType);
  const boardOptions = useMemo(() => boards.filter((board) => board.boardType === 'CLASS'), [boards]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadingBoards(true);
        const response = await api.getBoards();
        if (cancelled) return;

        const payload = normalizeBoardPayload(response);
        const nextBoards = resolveBoardList(payload);
        setBoards(nextBoards);
        setError('');
      } catch (exception) {
        if (!cancelled) {
          setBoards([]);
          setError(exception?.message ?? '게시판 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoadingBoards(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearchValue(searchParams.get('keyword') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoadingPosts(true);
        const response = await api.getPosts({
          boardSlug: selectedBoard.slug,
          page: pageValue,
          size: 20,
          category: categoryValue === 'all' ? undefined : categoryValue.toUpperCase(),
          sort: sortValue,
          keyword: searchValue.trim() || undefined,
        });

        if (cancelled) return;

        const payload = normalizeBoardPayload(response);
        const items = normalizeItems(payload);
        setPageState({
          items: items.map((post) => normalizePost(post, user?.id)),
          page: payload?.page ?? pageValue,
          size: payload?.size ?? 20,
          total: payload?.total ?? items.length,
          totalPages: payload?.totalPages ?? Math.max(1, Math.ceil((payload?.total ?? items.length) / 20)),
          hasNext: payload?.hasNext ?? false,
        });
        setError('');
      } catch (exception) {
        if (!cancelled) {
          setPageState({
            items: [],
            page: pageValue,
            size: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
          });
          setError(exception?.message ?? '게시글 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoadingPosts(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [boardType, categoryValue, pageValue, searchValue, selectedBoard, sortValue, user?.id]);

  const pinnedPosts = useMemo(() => pageState.items.filter((post) => post.isNotice), [pageState.items]);
  const normalPosts = useMemo(() => pageState.items.filter((post) => !post.isNotice), [pageState.items]);
  const hotPosts = useMemo(
    () => [...pageState.items].sort((left, right) => Number(right.likeCount ?? 0) - Number(left.likeCount ?? 0)).slice(0, 3),
    [pageState.items],
  );

  const updateSearchParams = (updater) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next);
  };

  const handleBoardChange = (nextSlug) => {
    navigate(getBoardPathBySlug(nextSlug));
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    updateSearchParams((next) => {
      if (value.trim()) {
        next.set('keyword', value.trim());
      } else {
        next.delete('keyword');
      }
      next.delete('page');
    });
  };

  const handleCategoryChange = (value) => {
    updateSearchParams((next) => {
      if (value === 'all') {
        next.delete('category');
      } else {
        next.set('category', value);
      }
      next.delete('page');
    });
  };

  const handleSortChange = (value) => {
    updateSearchParams((next) => {
      next.set('sort', value);
      next.delete('page');
    });
  };

  const handlePageChange = (value) => {
    updateSearchParams((next) => {
      next.set('page', String(value));
    });
  };

  const isInitialLoading = (loadingBoards || loadingPosts) && !pageState.items.length && !error;

  if (isInitialLoading) {
    return (
      <div className="page-stack board-page board-shell">
        <BoardHeader title={pageTitle} description="게시판 정보를 불러오는 중입니다." />
        <Card className="board-empty-card">
          <h2>게시판을 불러오는 중입니다.</h2>
          <p>잠시 후 목록이 표시됩니다.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack board-page board-shell">
      <BoardHeader
        title={pageTitle}
        description={pageDescription}
        meta={`마지막 갱신: ${formatDate(new Date().toISOString())}`}
        action={
          <Button onClick={() => {
            if (!requireLogin() || !selectedBoard) {
              return;
            }

            navigate(`/boards/write?board=${encodeURIComponent(selectedBoard.slug)}`);
          }} className="board-write-button">
            글쓰기
          </Button>
        }
      />

      {boardType === 'CLASS' && boardOptions.length ? (
        <div className="board-class-strip" role="tablist" aria-label="직업게시판 선택">
          {boardOptions.map((board) => (
            <Button
              key={board.slug}
              variant={board.slug === selectedBoard?.slug ? 'primary' : 'outline'}
              className="board-class-strip__button"
              onClick={() => handleBoardChange(board.slug)}
            >
              {board.className ?? board.boardName}
            </Button>
          ))}
        </div>
      ) : null}

      <BoardFilterBar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        categoryValue={categoryValue}
        onCategoryChange={handleCategoryChange}
        sortValue={sortValue}
        onSortChange={handleSortChange}
        boardValue={selectedBoard?.slug ?? defaultBoardSlug}
        onBoardChange={handleBoardChange}
        boardOptions={boardOptions}
        showBoardPicker={boardType === 'CLASS' && boardOptions.length > 0}
      />

      {error ? <Card className="board-error-card">{error}</Card> : null}

      <div className="board-content-grid">
        <section className="board-list-column post-list-section">
          <Card className="post-list-card">
            <div className="post-list-card__header">
              <div>
                <p className="board-eyebrow">BOARD</p>
                <h2>게시글 목록</h2>
              </div>
              <span className="post-list-card__count">{pageState.total.toLocaleString()}개</span>
            </div>

            <div className="post-list-stack">
              {pinnedPosts.map((post) => (
                <BoardPostCard key={post.id} post={post} isMine={post.isMine} />
              ))}
              {normalPosts.map((post) => (
                <BoardPostCard key={post.id} post={post} isMine={post.isMine} />
              ))}
            </div>

            {!pageState.items.length ? (
              <EmptyState
                title="게시글이 없습니다."
                description="검색어 또는 필터를 바꿔 다시 확인해 주세요."
              />
            ) : null}
          </Card>

          <BoardPagination page={pageState.page} totalPages={pageState.totalPages} onPageChange={handlePageChange} />
        </section>

        <BoardSidebar hotPosts={hotPosts} recentComments={[]} onlineMembers={[]} />
      </div>
    </div>
  );
};
