import axios from 'axios';
import {
  boardsSeed,
  commentsSeed,
  postsSeed,
  profileSeed,
} from '../data/mockData';
import { marketItemsSeed } from '../data/marketMockData';
import { readStorage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const useMock = import.meta.env.DEV && String(import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = readStorage('authToken', null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 180));
const clone = (value) => JSON.parse(JSON.stringify(value));
const unwrapApiData = (response) => response?.data?.data ?? response?.data ?? response;

const boardCategories = {
  FREE: [
    { id: 1, boardType: 'FREE', categoryCode: 'CHAT', categoryName: '잡담', sortOrder: 1 },
    { id: 2, boardType: 'FREE', categoryCode: 'INFO', categoryName: '정보', sortOrder: 2 },
    { id: 3, boardType: 'FREE', categoryCode: 'QUESTION', categoryName: '질문', sortOrder: 3 },
    { id: 4, boardType: 'FREE', categoryCode: 'GUIDE', categoryName: '공략', sortOrder: 4 },
    { id: 5, boardType: 'FREE', categoryCode: 'STREAM', categoryName: '인방', sortOrder: 5 },
    { id: 6, boardType: 'FREE', categoryCode: 'FUN', categoryName: '웃긴글', sortOrder: 6 },
    { id: 7, boardType: 'FREE', categoryCode: 'ETC', categoryName: '기타', sortOrder: 7 },
  ],
  CLASS: [
    { id: 8, boardType: 'CLASS', categoryCode: 'CHAT', categoryName: '잡담', sortOrder: 1 },
    { id: 9, boardType: 'CLASS', categoryCode: 'INFO', categoryName: '정보', sortOrder: 2 },
    { id: 10, boardType: 'CLASS', categoryCode: 'QUESTION', categoryName: '질문', sortOrder: 3 },
    { id: 11, boardType: 'CLASS', categoryCode: 'SETTING', categoryName: '세팅', sortOrder: 4 },
    { id: 12, boardType: 'CLASS', categoryCode: 'DPS', categoryName: '전분', sortOrder: 5 },
    { id: 13, boardType: 'CLASS', categoryCode: 'SKILL', categoryName: '스킬트리', sortOrder: 6 },
    { id: 14, boardType: 'CLASS', categoryCode: 'ETC', categoryName: '기타', sortOrder: 7 },
  ],
};

const boardSlugById = {
  1: 'free',
  2: 'class/warlord',
  3: 'class/paladin',
  4: 'class/bard',
  5: 'class/sorceress',
};

const boardMetaBySlug = {
  free: { boardType: 'FREE', boardName: '자유게시판', classCode: null, className: null, sortOrder: 1 },
  'class/warlord': { boardType: 'CLASS', boardName: '워로드 게시판', classCode: 'warlord', className: '워로드', sortOrder: 2 },
  'class/paladin': { boardType: 'CLASS', boardName: '팔라딘 게시판', classCode: 'paladin', className: '팔라딘', sortOrder: 3 },
  'class/bard': { boardType: 'CLASS', boardName: '바드 게시판', classCode: 'bard', className: '바드', sortOrder: 4 },
  'class/sorceress': { boardType: 'CLASS', boardName: '소서리스 게시판', classCode: 'sorceress', className: '소서리스', sortOrder: 5 },
};

const normalizeBoardMock = (board) => ({
  id: board.id,
  slug: board.slug ?? boardSlugById[board.id] ?? 'free',
  boardType: board.boardType,
  boardName: board.boardName,
  classCode: board.classCode ?? null,
  className: board.className ?? null,
  sortOrder: board.sortOrder ?? 0,
  categories: clone(boardCategories[board.boardType] ?? []),
});

const normalizePostMock = (post) => {
  const slug = boardSlugById[post.boardId] ?? 'free';
  const boardMeta = boardMetaBySlug[slug] ?? boardMetaBySlug.free;
  const categoryCode = String(post.tags?.[0] ?? (post.boardId === 1 ? 'CHAT' : 'SETTING')).toUpperCase();
  const categoryName =
    (boardCategories[boardMeta.boardType] ?? []).find((item) => item.categoryCode === categoryCode)?.categoryName ?? '기타';

  return {
    id: post.id,
    boardId: post.boardId,
    boardSlug: slug,
    boardType: boardMeta.boardType,
    boardName: boardMeta.boardName,
    classCode: boardMeta.classCode,
    className: boardMeta.className,
    categoryCode,
    categoryName,
    userId: post.userId,
    author: post.author,
    title: post.title,
    content: post.content,
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    pinned: post.pinned,
    status: post.deletedYn ? 'DELETED' : 'ACTIVE',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const normalizeCommentMock = (comment, postId) => ({
  id: comment.id,
  postId: comment.postId ?? Number(postId),
  userId: comment.userId ?? 1,
  author: comment.author,
  content: comment.content,
  status: 'ACTIVE',
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt ?? comment.createdAt,
});

const buildPostRequestBody = (payload = {}) => {
  const boardId = Number(payload.boardId ?? Object.entries(boardSlugById).find(([, slug]) => slug === payload.boardSlug)?.[0] ?? 0);

  return {
    boardId: Number.isFinite(boardId) && boardId > 0 ? boardId : undefined,
    boardSlug: payload.boardSlug ?? boardMetaBySlug[payload.boardSlug]?.slug ?? 'free',
    categoryCode: payload.categoryCode,
    title: payload.title,
    content: payload.content,
    pinned: Boolean(payload.pinned),
  };
};

export const api = {
  async searchCharacters(characterName) {
    const encodedCharacterName = encodeURIComponent(String(characterName ?? '').trim());
    return apiClient.get(`/api/lostark/characters/${encodedCharacterName}`, {
      timeout: 30000,
    });
  },
  async getLostArkCalendarToday() {
    return apiClient.get('/api/lostark/calendar/today', {
      timeout: 30000,
    });
  },
  async getLostArkCalendarWeek() {
    return apiClient.get('/api/lostark/calendar/week', {
      timeout: 30000,
    });
  },
  async getLostArkCalendarDate(date) {
    return apiClient.get('/api/lostark/calendar/daily', {
      params: { date },
      timeout: 30000,
    });
  },
  async setMainCharacter(characterName) {
    return apiClient.post('/api/users/me/main-character', {
      characterName: String(characterName ?? '').trim(),
    });
  },
  async updateMe(payload) {
    return apiClient.put('/api/users/me', {
      nickname: String(payload?.nickname ?? '').trim(),
      bio: String(payload?.bio ?? '').trim(),
    });
  },
  async searchMarketItems(keyword) {
    const normalized = String(keyword ?? '').trim();
    if (useMock) {
      const lower = normalized.toLowerCase();
      return delay({
        data: marketItemsSeed.filter((item) => item.itemName.toLowerCase().includes(lower)),
      });
    }

    return apiClient.get('/api/lostark/markets/search', {
      params: { keyword: normalized },
      timeout: 30000,
    });
  },
  async getMe() {
    if (!useMock) {
      return apiClient.get('/api/auth/me');
    }

    return delay({
      data: {
        user: {
          id: 1,
          email: 'guardian@loahub.dev',
          nickname: 'Guardian',
          provider: 'local',
          role: 'ROLE_USER',
        },
        profile: clone(profileSeed),
      },
    });
  },
  async getBoards() {
    try {
      return await apiClient.get('/api/boards');
    } catch {
      if (useMock) {
        return delay({ data: clone(boardsSeed).map(normalizeBoardMock) });
      }
      throw new Error('게시판 목록을 불러오지 못했습니다.');
    }
  },
  async getPosts(params = {}) {
    try {
      return await apiClient.get('/api/posts', {
        params,
      });
    } catch {
      if (useMock) {
        const boardSlug = String(params.boardSlug ?? 'free');
        const board = boardMetaBySlug[boardSlug] ?? boardMetaBySlug.free;
        const boardId = Number(
          Object.entries(boardSlugById).find(([, slug]) => slug === boardSlug)?.[0] ?? 1,
        );
        const filtered = clone(postsSeed)
          .filter((item) => item.boardId === boardId)
          .map(normalizePostMock);
        const category = params.category ? String(params.category).toUpperCase() : null;
        const byCategory = category ? filtered.filter((item) => item.categoryCode === category) : filtered;
        return delay({
          data: {
            items: byCategory,
            page: Number(params.page ?? 1),
            size: Number(params.size ?? 20),
            total: byCategory.length,
            totalPages: 1,
            hasNext: false,
          },
        });
      }
      throw new Error('게시글 목록을 불러오지 못했습니다.');
    }
  },
  async getBestPosts(params = {}) {
    try {
      return await apiClient.get('/api/posts/best', {
        params,
      });
    } catch {
      if (useMock) {
        const boardSlug = String(params.boardSlug ?? 'free');
        const boardId = Number(
          Object.entries(boardSlugById).find(([, slug]) => slug === boardSlug)?.[0] ?? 1,
        );
        const category = params.category ? String(params.category).toUpperCase() : null;
        const items = clone(postsSeed)
          .filter((item) => item.boardId === boardId)
          .map(normalizePostMock)
          .filter((item) => (category ? item.categoryCode === category : true))
          .sort((left, right) => right.likeCount - left.likeCount)
          .slice(0, 10);
        return delay({ data: items });
      }
      throw new Error('인기글을 불러오지 못했습니다.');
    }
  },
  async getPost(id) {
    try {
      return await apiClient.get(`/api/posts/${id}`);
    } catch {
      if (useMock) {
        const posts = clone(postsSeed);
        const post = normalizePostMock(posts.find((item) => String(item.id) === String(id)) ?? posts[0]);
        const comments = clone(commentsSeed[post.id] ?? []).map((comment) => normalizeCommentMock(comment, post.id));
        return delay({ data: { post, comments } });
      }
      throw new Error('게시글을 불러오지 못했습니다.');
    }
  },
  async createPost(payload) {
    try {
      return await apiClient.post('/api/posts', buildPostRequestBody(payload));
    } catch {
      if (useMock) {
        const post = {
          id: Date.now(),
          boardId: Number(Object.entries(boardSlugById).find(([, slug]) => slug === payload.boardSlug)?.[0] ?? 1),
          boardSlug: payload.boardSlug ?? 'free',
          boardType: payload.boardSlug?.startsWith('class/') ? 'CLASS' : 'FREE',
          boardName: payload.boardSlug?.startsWith('class/') ? '직업게시판' : '자유게시판',
          classCode: payload.boardSlug?.startsWith('class/') ? payload.boardSlug.split('/')[1] : null,
          className: payload.boardSlug?.startsWith('class/') ? payload.boardSlug.split('/')[1] : null,
          categoryCode: payload.categoryCode,
          categoryName: payload.categoryCode,
          userId: 1,
          author: 'Guardian',
          title: payload.title,
          content: payload.content,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          pinned: Boolean(payload.pinned),
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return delay({ data: { post } });
      }
      throw new Error('게시글 작성에 실패했습니다.');
    }
  },
  async updatePost(postId, payload) {
    try {
      return await apiClient.put(`/api/posts/${postId}`, buildPostRequestBody(payload));
    } catch {
      if (useMock) {
        return delay({
          data: {
            post: {
              id: Number(postId),
              boardSlug: payload.boardSlug ?? 'free',
              categoryCode: payload.categoryCode,
              title: payload.title,
              content: payload.content,
              pinned: Boolean(payload.pinned),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      }
      throw new Error('게시글 수정에 실패했습니다.');
    }
  },
  async deletePost(postId) {
    try {
      return await apiClient.delete(`/api/posts/${postId}`);
    } catch {
      if (useMock) {
        return delay({ data: { deleted: true, postId: Number(postId) } });
      }
      throw new Error('게시글 삭제에 실패했습니다.');
    }
  },
  async togglePostLike(postId) {
    try {
      return await apiClient.post(`/api/posts/${postId}/like`);
    } catch {
      if (useMock) {
        return delay({ data: { liked: true } });
      }
      throw new Error('추천 처리에 실패했습니다.');
    }
  },
  async getComments(postId) {
    try {
      return await apiClient.get(`/api/posts/${postId}/comments`);
    } catch {
      if (useMock) {
        return delay({ data: clone(commentsSeed[postId] ?? []).map((comment) => normalizeCommentMock(comment, postId)) });
      }
      throw new Error('댓글을 불러오지 못했습니다.');
    }
  },
  async createComment(postId, payload) {
    try {
      return await apiClient.post(`/api/posts/${postId}/comments`, payload);
    } catch {
      if (useMock) {
        return delay({
          data: {
            comment: {
              id: Date.now(),
              postId: Number(postId),
              userId: 1,
              author: 'Guardian',
              content: payload.content,
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });
      }
      throw new Error('댓글 작성에 실패했습니다.');
    }
  },
  async deleteComment(commentId) {
    try {
      return await apiClient.delete(`/api/comments/${commentId}`);
    } catch {
      if (useMock) {
        return delay({ data: { deleted: true, commentId: Number(commentId) } });
      }
      throw new Error('댓글 삭제에 실패했습니다.');
    }
  },
  async getCalendarContents() {
    return apiClient.get('/api/lostark/calendar/week', {
      timeout: 30000,
    });
  },
  async getMessageThreads() {
    return apiClient.get('/api/messages');
  },
  async getMessageThread(threadId) {
    return apiClient.get(`/api/messages/${threadId}`);
  },
  async createMessage(payload) {
    return apiClient.post('/api/messages', payload);
  },
  async markMessageThreadRead(threadId) {
    return apiClient.patch(`/api/messages/${threadId}/read`);
  },
  async getUnreadMessageCount() {
    return apiClient.get('/api/messages/unread-count');
  },
  async deleteMessageThread(threadId) {
    return apiClient.delete(`/api/messages/${threadId}`);
  },
};
