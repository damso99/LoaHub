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
  buildMockPosts,
  formatDate,
  getBoardDescription,
  getBoardPathBySlug,
  getBoardTitle,
  getCategoryLabel,
  mockBoards,
  normalizeBoardPayload,
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

const getCategoryKey = (post) => {
  if (post.isNotice) return 'notice';
  if (post.isHot) return 'hot';

  const code = String(post.categoryCode ?? '').toLowerCase();
  if (code.includes('question')) return 'question';
  if (code.includes('info')) return 'info';
  if (code.includes('guide') || code.includes('skill') || code.includes('setting')) return 'guide';
  if (code.includes('chat') || code.includes('talk')) return 'chat';
  return 'all';
};

export const BoardListPage = ({ boardType = 'FREE', classCode = null, defaultBoardSlug = 'free' }) => {
  const navigate = useNavigate();
  const routeParams = useParams();
  const resolvedClassCode = classCode ?? routeParams.classCode ?? null;
  const { user, requireLogin } = useAuthGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const [boards, setBoards] = useState(mockBoards);
  const [pageState, setPageState] = useState({
    items: [],
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState(searchParams.get('keyword') ?? '');
  const [usingFallback, setUsingFallback] = useState(false);

  const categoryValue = searchParams.get('category') ?? 'all';
  const sortValue = searchParams.get('sort') ?? 'latest';
  const pageValue = Number(searchParams.get('page') ?? 1);

  const selectedBoard = useMemo(() => {
    if (!boards.length) {
      return mockBoards[0];
    }

    if (boardType === 'FREE') {
      return boards.find((board) => board.slug === defaultBoardSlug) ?? boards.find((board) => board.boardType === 'FREE') ?? boards[0];
    }

    if (resolvedClassCode) {
      return boards.find((board) => board.slug === `class/${resolvedClassCode}`) ?? boards.find((board) => board.boardType === 'CLASS') ?? boards[0];
    }

    return boards.find((board) => board.boardType === 'CLASS') ?? boards[0];
  }, [boards, boardType, defaultBoardSlug, resolvedClassCode]);

  const pageTitle = selectedBoard?.boardName ?? getBoardTitle(boardType);
  const pageDescription =
    selectedBoard?.boardType === 'CLASS'
      ? `${selectedBoard.className ?? '직업'} 게시판의 공략, 세팅, 질문을 확인할 수 있습니다.`
      : getBoardDescription(boardType);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const response = await api.getBoards();
        if (cancelled) {
          return;
        }

        const payload = normalizeBoardPayload(response);
        const nextBoards = Array.isArray(payload) ? payload : payload?.data ?? [];
        setBoards(nextBoards.length ? nextBoards : mockBoards);
        setUsingFallback(!nextBoards.length);
        setError('');
      } catch (exception) {
        if (!cancelled) {
          setBoards(mockBoards);
          setUsingFallback(true);
          setError('');
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
    setSearchValue(searchParams.get('keyword') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);

        const response = await api.getPosts({
          boardSlug: selectedBoard.slug,
          page: pageValue,
          size: 20,
          category: categoryValue === 'all' ? undefined : categoryValue.toUpperCase(),
          sort: sortValue,
        });

        if (cancelled) {
          return;
        }

        const payload = normalizeBoardPayload(response);
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setPageState({
          items: items.map((post) => normalizePost(post, user?.id)),
          page: payload?.page ?? pageValue,
          size: payload?.size ?? 20,
          total: payload?.total ?? items.length,
          totalPages: payload?.totalPages ?? Math.max(1, Math.ceil((payload?.total ?? items.length) / 20)),
          hasNext: payload?.hasNext ?? false,
        });
        setUsingFallback(false);
        setError('');
      } catch (exception) {
        if (!cancelled) {
          const mockItems = buildMockPosts(selectedBoard.slug).map((post) => normalizePost(post, user?.id));
          setPageState({
            items: mockItems,
            page: 1,
            size: mockItems.length,
            total: mockItems.length,
            totalPages: mockItems.length > 0 ? 1 : 0,
            hasNext: false,
          });
          setUsingFallback(true);
          setError('실제 게시글을 불러오지 못해 샘플 데이터로 표시 중입니다.');
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
  }, [categoryValue, pageValue, selectedBoard, sortValue, user?.id]);

  const boardOptions = useMemo(() => boards.filter((board) => board.boardType === 'CLASS'), [boards]);

  const visiblePosts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    return pageState.items.filter((post) => {
      const categoryKey = getCategoryKey(post);
      const matchedCategory =
        categoryValue === 'all' ||
        (categoryValue === 'notice' && post.isNotice) ||
        (categoryValue === 'hot' && post.isHot) ||
        categoryKey === categoryValue;

      const matchedKeyword =
        !keyword ||
        [post.title, post.writer, post.categoryName, post.content]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      return matchedCategory && matchedKeyword;
    });
  }, [categoryValue, pageState.items, searchValue]);

  const pinnedPosts = useMemo(() => visiblePosts.filter((post) => post.isNotice), [visiblePosts]);
  const normalPosts = useMemo(() => visiblePosts.filter((post) => !post.isNotice), [visiblePosts]);
  const hotPosts = useMemo(
    () => [...visiblePosts].sort((left, right) => Number(right.likeCount ?? 0) - Number(left.likeCount ?? 0)).slice(0, 3),
    [visiblePosts],
  );
  const recentComments = useMemo(
    () =>
      [...visiblePosts]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 3)
        .map((post, index) => ({
          id: `${post.id}-${index}`,
          author: post.writer,
          content: `${post.title.slice(0, 24)}${post.title.length > 24 ? '…' : ''}`,
          createdAt: post.createdAt,
        })),
    [visiblePosts],
  );

  const onlineMembers = useMemo(
    () => [
      { name: 'Guardian', role: '대전 중' },
      { name: 'Moko', role: '파티 모집 중' },
      { name: 'Rainfall', role: '채팅 중' },
      { name: 'BlueShield', role: '레이드 준비 중' },
    ],
    [],
  );

  const activeBoards = boardType === 'CLASS' ? boardOptions : [];

  const handleBoardChange = (nextSlug) => {
    navigate(getBoardPathBySlug(nextSlug));
  };

  const handleWrite = () => {
    if (!requireLogin() || !selectedBoard) {
      return;
    }

    navigate(`/boards/write?board=${encodeURIComponent(selectedBoard.slug)}`);
  };

  const handleCategoryChange = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value === 'all') {
        next.delete('category');
      } else {
        next.set('category', value);
      }
      next.delete('page');
      return next;
    });
  };

  const handleSortChange = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('sort', value);
      next.delete('page');
      return next;
    });
  };

  const handlePageChange = (value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('page', String(value));
      return next;
    });
  };

  if (loading && !pageState.items.length) {
    return (
      <div className="page-stack board-page board-shell">
        <BoardHeader title={pageTitle} description="게시판 정보를 불러오는 중입니다." />
        <Card className="board-empty-card">
          <h2>게시판을 준비하는 중입니다.</h2>
          <p>잠시만 기다리면 목록 화면이 표시됩니다.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack board-page board-shell">
      <BoardHeader
        title={pageTitle}
        description={pageDescription}
        meta={`마지막 갱신: ${formatDate(new Date().toISOString())}${usingFallback ? ' · 샘플 데이터 표시 중' : ''}`}
        action={
          <Button onClick={handleWrite} className="board-write-button">
            글쓰기
          </Button>
        }
      />

      {boardType === 'CLASS' ? (
        <div className="board-class-strip" role="tablist" aria-label="직업게시판 선택">
          {boards
            .filter((board) => board.boardType === 'CLASS')
            .map((board) => (
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
        onSearchChange={setSearchValue}
        categoryValue={categoryValue}
        onCategoryChange={handleCategoryChange}
        sortValue={sortValue}
        onSortChange={handleSortChange}
        boardValue={selectedBoard?.slug ?? defaultBoardSlug}
        onBoardChange={handleBoardChange}
        boardOptions={activeBoards}
        showBoardPicker={boardType === 'CLASS' && activeBoards.length > 0}
      />

      {error ? <Card className="board-error-card">{error}</Card> : null}

      <div className="board-content-grid">
        <section className="board-list-column">
          <Card className="post-list-card">
            <div className="post-list-card__header">
              <div>
                <p className="board-eyebrow">BOARD</p>
                <h2>게시물 목록</h2>
              </div>
              <span className="post-list-card__count">{visiblePosts.length}개</span>
            </div>

            <div className="post-list-stack">
              {pinnedPosts.map((post) => (
                <BoardPostCard key={post.id} post={post} isMine={post.isMine} />
              ))}
              {normalPosts.map((post) => (
                <BoardPostCard key={post.id} post={post} isMine={post.isMine} />
              ))}
            </div>

            {!visiblePosts.length ? (
              <EmptyState
                title="게시물이 없습니다."
                description="검색어와 필터를 바꾸면 더 많은 게시물을 확인할 수 있습니다."
              />
            ) : null}
          </Card>

          <BoardPagination page={pageState.page} totalPages={pageState.totalPages} onPageChange={handlePageChange} />
        </section>

        <BoardSidebar hotPosts={hotPosts} recentComments={recentComments} onlineMembers={onlineMembers} />
      </div>
    </div>
  );
};
