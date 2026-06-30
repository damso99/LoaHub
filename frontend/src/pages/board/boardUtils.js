const now = Date.now();

const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const mockBoards = [
  {
    slug: 'free',
    boardType: 'FREE',
    boardName: '자유게시판',
    description: '모험가들의 자유로운 이야기를 나누는 공간입니다.',
    categories: [
      { categoryCode: 'all', categoryName: '전체' },
      { categoryCode: 'notice', categoryName: '공지' },
      { categoryCode: 'hot', categoryName: '인기' },
      { categoryCode: 'question', categoryName: '질문' },
      { categoryCode: 'info', categoryName: '정보' },
      { categoryCode: 'chat', categoryName: '잡담' },
    ],
  },
  {
    slug: 'class/warrior',
    boardType: 'CLASS',
    boardName: '전사 게시판',
    className: '전사',
    classCode: 'warrior',
    description: '전사 직업 유저들이 공략과 정보를 공유하는 공간입니다.',
    categories: [
      { categoryCode: 'all', categoryName: '전체' },
      { categoryCode: 'notice', categoryName: '공지' },
      { categoryCode: 'question', categoryName: '질문' },
      { categoryCode: 'info', categoryName: '정보' },
      { categoryCode: 'guide', categoryName: '공략' },
    ],
  },
  {
    slug: 'class/sorceress',
    boardType: 'CLASS',
    boardName: '소서리스 게시판',
    className: '소서리스',
    classCode: 'sorceress',
    description: '소서리스 유저들의 빌드와 플레이 경험을 공유하는 공간입니다.',
    categories: [
      { categoryCode: 'all', categoryName: '전체' },
      { categoryCode: 'notice', categoryName: '공지' },
      { categoryCode: 'question', categoryName: '질문' },
      { categoryCode: 'info', categoryName: '정보' },
      { categoryCode: 'guide', categoryName: '공략' },
    ],
  },
];

const basePosts = [
  {
    id: 1001,
    boardSlug: 'free',
    boardType: 'FREE',
    categoryCode: 'notice',
    categoryName: '공지',
    title: 'LoaHub 이용 안내',
    writer: '운영팀',
    createdAt: daysAgo(1),
    viewCount: 3480,
    commentCount: 18,
    likeCount: 124,
    isNotice: true,
    isHot: true,
    isNew: false,
    content: '게시판 이용 규칙, 신고 방법, 주요 공지사항을 한 번에 확인할 수 있는 안내문입니다.',
  },
  {
    id: 1002,
    boardSlug: 'free',
    boardType: 'FREE',
    categoryCode: 'question',
    categoryName: '질문',
    title: '오늘 모험섬 보상 뭐가 좋나요?',
    writer: '별빛항해',
    createdAt: daysAgo(0.2),
    viewCount: 912,
    commentCount: 27,
    likeCount: 43,
    isNotice: false,
    isHot: true,
    isNew: true,
    content: '모험섬 선택 기준이 궁금합니다. 금화, 카드팩, 재련 재료 중 어디를 우선하면 좋을까요?',
  },
  {
    id: 1003,
    boardSlug: 'free',
    boardType: 'FREE',
    categoryCode: 'info',
    categoryName: '정보',
    title: '카오스게이트 일정 정리',
    writer: '레이드정리왕',
    createdAt: daysAgo(2),
    viewCount: 12480,
    commentCount: 42,
    likeCount: 88,
    isNotice: false,
    isHot: true,
    isNew: false,
    content: '주간 카오스게이트 입장 시간과 보상 정리입니다.',
  },
  {
    id: 1004,
    boardSlug: 'free',
    boardType: 'FREE',
    categoryCode: 'chat',
    categoryName: '잡담',
    title: '이번 밸패 다들 어떻게 생각함?',
    writer: '파란별',
    createdAt: daysAgo(0.8),
    viewCount: 745,
    commentCount: 15,
    likeCount: 19,
    isNotice: false,
    isHot: false,
    isNew: true,
    content: '밸런스 패치 체감이 생각보다 큽니다. 각 직업별 느낌을 공유해 주세요.',
  },
  {
    id: 2001,
    boardSlug: 'class/warrior',
    boardType: 'CLASS',
    classCode: 'warrior',
    className: '전사',
    categoryCode: 'guide',
    categoryName: '공략',
    title: '전사 아크패시브 세팅 가이드',
    writer: '방패든용사',
    createdAt: daysAgo(1.4),
    viewCount: 2112,
    commentCount: 9,
    likeCount: 61,
    isNotice: false,
    isHot: true,
    isNew: false,
    content: '전사 직업군에서 자주 쓰는 세팅과 추천 각인을 정리했습니다.',
  },
  {
    id: 2002,
    boardSlug: 'class/sorceress',
    boardType: 'CLASS',
    classCode: 'sorceress',
    className: '소서리스',
    categoryCode: 'question',
    categoryName: '질문',
    title: '점화 소서 보석 우선순위 알려주세요',
    writer: '마나가부족해',
    createdAt: daysAgo(0.4),
    viewCount: 890,
    commentCount: 11,
    likeCount: 24,
    isNotice: false,
    isHot: false,
    isNew: true,
    content: '점화 소서를 처음 해보는데 보석 우선순위를 어떻게 잡아야 할지 궁금합니다.',
  },
];

export const normalizeBoardPayload = (response) => response?.data?.data ?? response?.data ?? response;

export const formatDate = (value, options = {}) => {
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
    hour: options.hour ? '2-digit' : undefined,
    minute: options.hour ? '2-digit' : undefined,
  }).format(date);
};

export const formatRelativeLabel = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const diffMinutes = Math.max(Math.floor((Date.now() - date.getTime()) / 60000), 0);
  if (diffMinutes < 1) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
};

export const getBoardSlugByType = (boardType, classCode) => {
  if (boardType === 'CLASS' && classCode) {
    return `class/${classCode}`;
  }

  return 'free';
};

export const getBoardPathBySlug = (slug) => {
  if (!slug || slug === 'free') {
    return '/boards/free';
  }

  if (slug.startsWith('class/')) {
    const classCode = slug.split('/')[1];
    return classCode ? `/boards/jobs/${classCode}` : '/boards/jobs';
  }

  return '/boards/free';
};

export const getBoardTitle = (boardType) => (boardType === 'CLASS' ? '직업게시판' : '자유게시판');

export const getBoardDescription = (boardType) =>
  boardType === 'CLASS'
    ? '직업별 공략, 세팅, 질문을 나누는 LoaHub 전용 게시판입니다.'
    : '모험가들이 자유롭게 소통하는 커뮤니티 게시판입니다.';

export const getBoardLabel = (board) => board?.className ?? board?.boardName ?? '게시판';

export const getCategoryLabel = (categoryCode) => {
  const normalized = String(categoryCode ?? '').toLowerCase();

  switch (normalized) {
    case 'notice':
      return '공지';
    case 'hot':
      return '인기';
    case 'question':
      return '질문';
    case 'info':
      return '정보';
    case 'guide':
      return '공략';
    case 'chat':
      return '잡담';
    default:
      return '일반';
  }
};

export const buildMockPosts = (boardSlug) =>
  basePosts.filter((post) => post.boardSlug === boardSlug).map((post) => ({ ...post }));

export const resolveBoardList = (response) => {
  const payload = normalizeBoardPayload(response);
  const items = Array.isArray(payload) ? payload : payload?.data ?? [];

  return items.length ? items : mockBoards;
};

