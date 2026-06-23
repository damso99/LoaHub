import axios from 'axios';
import {
  calendarContents,
  commentsSeed,
  merchantsSeed,
  messagesSeed,
  postsSeed,
  profileSeed,
} from '../data/mockData';
import { marketItemsSeed } from '../data/marketMockData';
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
    return apiClient.get(`/api/lostark/characters/${encodedCharacterName}`, {
      timeout: 30000,
    });
  },
  async setMainCharacter(characterName) {
    return apiClient.post('/api/users/me/main-character', {
      characterName: String(characterName ?? '').trim(),
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
  async getMerchants(region) {
    if (useMock) {
      const normalized = String(region ?? '').trim();
      const filtered = normalized
        ? merchantsSeed.filter((item) => item.region.includes(normalized))
        : merchantsSeed;

      return delay({ data: clone(filtered) });
    }

    return apiClient.get('/api/merchants', {
      params: region ? { region } : undefined,
    });
  },
  async getCurrentMerchants(region) {
    if (useMock) {
      const current = merchantsSeed.filter((item) => item.spawnTime.includes('18:00'));
      const filtered = region ? current.filter((item) => item.region.includes(region)) : current;
      return delay({ data: clone(filtered) });
    }

    return apiClient.get('/api/merchants/current', {
      params: region ? { region } : undefined,
    });
  },
  async searchMerchants(keyword) {
    if (useMock) {
      const lower = String(keyword ?? '').trim().toLowerCase();
      return delay({
        data: clone(
          merchantsSeed.filter(
            (item) =>
              item.region.toLowerCase().includes(lower) ||
              item.merchantName.toLowerCase().includes(lower) ||
              item.description.toLowerCase().includes(lower) ||
              item.items.some((entry) => entry.toLowerCase().includes(lower)),
          ),
        ),
      });
    }

    return apiClient.get('/api/merchants/search', {
      params: { keyword },
    });
  },
  async getMerchant(id) {
    if (useMock) {
      const merchant = merchantsSeed.find((item) => String(item.id) === String(id)) ?? merchantsSeed[0];
      return delay({ data: clone(merchant) });
    }

    return apiClient.get(`/api/merchants/${id}`);
  },
  async favoriteMerchant(id) {
    if (useMock) {
      const merchant = merchantsSeed.find((item) => String(item.id) === String(id));
      return delay({
        data: merchant ? { ...clone(merchant), favorite: true } : null,
      });
    }

    return apiClient.post(`/api/merchants/${id}/favorite`);
  },
  async unfavoriteMerchant(id) {
    if (useMock) {
      const merchant = merchantsSeed.find((item) => String(item.id) === String(id));
      return delay({
        data: merchant ? { ...clone(merchant), favorite: false } : null,
      });
    }

    return apiClient.delete(`/api/merchants/${id}/favorite`);
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
