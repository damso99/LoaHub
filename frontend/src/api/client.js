import axios from 'axios';
import {
  calendarContents,
  characterSearchResults,
  commentsSeed,
  merchantsSeed,
  messagesSeed,
  postsSeed,
  profileSeed,
} from '../data/mockData';
import { readStorage } from '../utils/storage';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8080' : '');
const useMock = import.meta.env.DEV && String(import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
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

export const api = {
  async searchCharacters(name) {
    if (!useMock) {
      const encodedName = encodeURIComponent(String(name ?? '').trim());
      const { data } = await apiClient.get(`/api/characters/search?characterName=${encodedName}`);
      return data;
    }

    if (!useMock) {
      try {
        const { data } = await apiClient.get('/api/characters/search', { params: { name } });
        return data;
      } catch {
        // 백엔드가 없을 때는 mock 데이터로 안전하게 폴백한다.
      }
    }

    const normalized = String(name ?? '').toLowerCase();
    const result = characterSearchResults.filter((item) =>
      item.characterName.toLowerCase().includes(normalized),
    );
    return delay({ data: clone(result.length > 0 ? result : characterSearchResults) });
  },
  async getMe() {
    if (!useMock) {
      try {
        const { data } = await apiClient.get('/api/auth/me');
        return data;
      } catch {
        // 폴백 유지
      }
    }
    return delay({
      data: {
        user: {
          id: 1,
          email: 'guardian@loahub.dev',
          nickname: '가디언 슬레이어',
          provider: 'local',
          role: 'ROLE_USER',
        },
        profile: clone(profileSeed),
      },
    });
  },
  async getBoards() {
    if (!useMock) {
      try {
        const { data } = await apiClient.get('/api/boards');
        return data;
      } catch {
        // 폴백 유지
      }
    }
    return delay({
      data: [
        { id: 1, boardType: 'FREE', boardName: '자유게시판', className: null },
        { id: 2, boardType: 'CLASS', boardName: '직업별 게시판', className: '슬레이어' },
      ],
    });
  },
  async getPosts() {
    if (!useMock) {
      try {
        const { data } = await apiClient.get('/api/posts');
        return data;
      } catch {
        // 폴백 유지
      }
    }
    return delay({ data: clone(postsSeed) });
  },
  async getPost(id) {
    const posts = clone(postsSeed);
    const post = posts.find((item) => String(item.id) === String(id)) ?? posts[0];
    const comments = clone(commentsSeed[post.id] ?? []);
    return delay({ data: { post, comments } });
  },
  async getCalendarContents() {
    if (!useMock) {
      try {
        const { data } = await apiClient.get('/api/calendar/week');
        return data;
      } catch {
        // 폴백 유지
      }
    }
    return delay({ data: clone(calendarContents) });
  },
  async getMerchants() {
    if (!useMock) {
      try {
        const { data } = await apiClient.get('/api/merchants');
        return data;
      } catch {
        // 폴백 유지
      }
    }
    return delay({ data: clone(merchantsSeed) });
  },
  async getMessages() {
    if (!useMock) {
      try {
        const [inbox, sent] = await Promise.all([
          apiClient.get('/api/messages/inbox'),
          apiClient.get('/api/messages/sent'),
        ]);
        return { inbox: inbox.data, sent: sent.data };
      } catch {
        // 폴백 유지
      }
    }
    return delay({
      data: {
        inbox: clone(messagesSeed.filter((item) => item.receiverId === 1)),
        sent: clone(messagesSeed.filter((item) => item.senderId === 1)),
      },
    });
  },
};
