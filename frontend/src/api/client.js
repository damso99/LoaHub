import axios from 'axios';
import {
  calendarContents,
  commentsSeed,
  merchantsSeed,
  messagesSeed,
  postsSeed,
  profileSeed,
} from '../data/mockData';
import { readStorage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const useMock = import.meta.env.DEV && String(import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
  async searchCharacters(characterName) {
    const encodedCharacterName = encodeURIComponent(String(characterName ?? '').trim());
    return apiClient.get(`/api/lostark/characters/${encodedCharacterName}`);
  },
  async getMe() {
    if (!useMock) {
      try {
        return await apiClient.get('/api/auth/me');
      } catch {
        // fallback to mock data in local development
      }
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
    if (!useMock) {
      try {
        return await apiClient.get('/api/boards');
      } catch {
        // fallback to mock data in local development
      }
    }

    return delay({
      data: [
        { id: 1, boardType: 'FREE', boardName: 'Free Board', className: null },
        { id: 2, boardType: 'CLASS', boardName: 'Class Board', className: 'Slayer' },
      ],
    });
  },
  async getPosts() {
    if (!useMock) {
      try {
        return await apiClient.get('/api/posts');
      } catch {
        // fallback to mock data in local development
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
        return await apiClient.get('/api/calendar/week');
      } catch {
        // fallback to mock data in local development
      }
    }

    return delay({ data: clone(calendarContents) });
  },
  async getMerchants() {
    if (!useMock) {
      try {
        return await apiClient.get('/api/merchants');
      } catch {
        // fallback to mock data in local development
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
        // fallback to mock data in local development
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
