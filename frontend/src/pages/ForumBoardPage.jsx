import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ForumPostList } from '../components/ForumPostList';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { useAuthGuard } from '../hooks/useAuthGuard';

const normalizePayload = (response) => response?.data?.data ?? response?.data ?? response;

const boardLabelMap = {
  FREE: '자유게시판',
  CLASS: '직업게시판',
};

export const ForumBoardPage = ({ defaultBoardSlug = 'free', boardType = 'FREE', title, description, classCode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requireLogin, isAuthenticated } = useAuthGuard();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFetchingBoards, setIsFetchingBoards] = useState(true);

  const isBestPage = location.pathname.endsWith('/best');
  const currentCategory = searchParams.get('category') ?? '';
  const currentSort = searchParams.get('sort') ?? 'latest';
  const currentPage = Number(searchParams.get('page') ?? 1);
  const currentPeriod = searchParams.get('period') ?? 'daily';
  const currentKeyword = searchParams.get('keyword') ?? '';

  useEffect(() => {
    let cancelled = false;

    const loadBoards = async () => {
      try {
        setIsFetchingBoards(true);
        const response = await api.getBoards();
        if (cancelled) {
          return;
        }

        const payload = normalizePayload(response);
        setBoards(Array.isArray(payload) ? payload : payload?.data ?? []);
        setError('');
      } catch (exception) {
        if (!cancelled) {
          setError(exception?.message ?? '게시판 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsFetchingBoards(false);
        }
      }
    };

    void loadBoards();

    return () => {
      cancelled = true;
    };
  }, []);

  const classBoards = useMemo(() => boards.filter((board) => board.boardType === 'CLASS'), [boards]);

  const selectedBoard = useMemo(() => {
    if (boardType === 'FREE') {
      return boards.find((board) => board.slug === defaultBoardSlug) ?? boards.find((board) => board.boardType === 'FREE') ?? null;
    }

    if (classCode) {
      return boards.find((board) => board.slug === `class/${classCode}`) ?? null;
    }

    return boards.find((board) => board.boardType === 'CLASS') ?? null;
  }, [boardType, boards, classCode, defaultBoardSlug]);

  const pageTitle = title ?? (isBestPage ? `${selectedBoard?.boardName ?? boardLabelMap[boardType]} 인기글` : selectedBoard?.boardName ?? boardLabelMap[boardType]);
  const pageDescription = description ?? (isBestPage
    ? '추천 수가 높은 게시글을 먼저 확인할 수 있습니다.'
    : selectedBoard?.boardType === 'CLASS'
      ? `${selectedBoard.className ?? '직업'} 게시판의 공략, 세팅, 질문을 확인할 수 있습니다.`
      : '자유게시판의 최신 글과 공지, 인기글을 확인할 수 있습니다.');

  useEffect(() => {
    if (!selectedBoard) {
      return;
    }

    let cancelled = false;

    const loadPosts = async () => {
      try {
        setLoading(true);
        setError('');

        if (isBestPage) {
          const response = await api.getBestPosts({
            boardSlug: selectedBoard.slug,
            period: currentPeriod,
            category: currentCategory || undefined,
            keyword: currentKeyword.trim() || undefined,
          });
          if (cancelled) {
            return;
          }

          const payload = normalizePayload(response);
          const items = Array.isArray(payload) ? payload : payload?.items ?? [];
          setPageState({
            items,
            page: 1,
            size: items.length || 10,
            total: items.length,
            totalPages: 1,
            hasNext: false,
          });
          return;
        }

        const response = await api.getPosts({
          boardSlug: selectedBoard.slug,
          page: currentPage,
          size: 20,
          category: currentCategory || undefined,
          sort: currentSort,
          keyword: currentKeyword.trim() || undefined,
        });
        if (cancelled) {
          return;
        }

        const payload = normalizePayload(response);
        setPageState({
          items: payload?.items ?? [],
          page: payload?.page ?? currentPage,
          size: payload?.size ?? 20,
          total: payload?.total ?? 0,
          totalPages: payload?.totalPages ?? 0,
          hasNext: payload?.hasNext ?? false,
        });
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

    void loadPosts();

    return () => {
      cancelled = true;
    };
  }, [currentCategory, currentKeyword, currentPage, currentPeriod, currentSort, isBestPage, selectedBoard]);

  const categoryOptions = selectedBoard?.categories ?? [];

  const updateSearchParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (updates.page == null) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const goToWrite = () => {
    if (!requireLogin() || !selectedBoard) {
      return;
    }

    navigate(`/posts/write?board=${encodeURIComponent(selectedBoard.slug)}`);
  };

  if (isFetchingBoards || !selectedBoard) {
    return (
      <div className="page-stack board-page">
        <PageHeader title={pageTitle} description={pageDescription} />
        <Card className="empty-state empty-panel">
          <h2 className="empty-panel__title">게시판을 불러오는 중입니다.</h2>
          <p className="empty-panel__desc">잠시만 기다리면 게시글 목록이 표시됩니다.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack board-page">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        action={isAuthenticated ? <Button onClick={goToWrite}>글쓰기</Button> : null}
      />

      {boardType === 'CLASS' ? (
        <div className="board-tab-strip">
          {classBoards.map((board) => (
            <Button
              key={board.slug}
              variant={board.slug === selectedBoard.slug ? 'primary' : 'outline'}
              className="board-tab-strip__button"
              onClick={() => navigate(board.slug === 'free' ? '/boards/free' : `/boards/class/${board.classCode}`)}
            >
              {board.className ?? board.boardName}
            </Button>
          ))}
        </div>
      ) : null}

      <Card className="board-toolbar">
        <div className="board-toolbar__row">
          <div className="chip-scroll">
            <Button
              variant={!currentCategory ? 'primary' : 'outline'}
              onClick={() => updateSearchParams({ category: '', page: 1 })}
            >
              전체
            </Button>
            {categoryOptions.map((category) => (
              <Button
                key={category.categoryCode}
                variant={currentCategory === category.categoryCode ? 'primary' : 'outline'}
                onClick={() => updateSearchParams({ category: category.categoryCode, page: 1 })}
              >
                {category.categoryName}
              </Button>
            ))}
          </div>

          {!isBestPage ? (
            <div className="chip-scroll">
              {[
                { key: 'latest', label: '최신순' },
                { key: 'likes', label: '추천순' },
                { key: 'views', label: '조회순' },
                { key: 'comments', label: '댓글순' },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={currentSort === item.key ? 'secondary' : 'outline'}
                  onClick={() => updateSearchParams({ sort: item.key, page: 1 })}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="chip-scroll">
              {[
                { key: 'daily', label: '오늘' },
                { key: 'weekly', label: '주간' },
                { key: 'monthly', label: '월간' },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={currentPeriod === item.key ? 'secondary' : 'outline'}
                  onClick={() => updateSearchParams({ period: item.key })}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {error ? <Card className="board-error">{error}</Card> : null}

      {loading ? (
        <Card className="empty-state empty-panel">
          <h2 className="empty-panel__title">게시글을 불러오는 중입니다.</h2>
          <p className="empty-panel__desc">목록과 추천 수, 댓글 수를 정렬해서 가져오는 중입니다.</p>
        </Card>
      ) : (
        <ForumPostList
          posts={pageState.items}
          emptyTitle="등록된 게시글이 없습니다."
          emptyDescription="필터 조건을 바꾸거나 새 글을 작성해 보세요."
        />
      )}

      {!isBestPage ? (
        <Pagination
          page={pageState.page}
          totalPages={pageState.totalPages}
          onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
        />
      ) : null}
    </div>
  );
};
