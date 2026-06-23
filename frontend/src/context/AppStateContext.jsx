import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import {
  charactersSeed,
  currentUserSeed,
  messagesSeed,
  merchantsSeed,
  postsSeed,
  profileSeed,
  todayHighlights,
} from '../data/mockData';
import { readStorage, writeStorage } from '../utils/storage';

const AppStateContext = createContext(null);

const normalizeRole = (role) => {
  if (!role) {
    return '';
  }
  return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
};

const resolveAuthPayload = (input) => {
  if (input && typeof input === 'object' && 'user' in input) {
    return {
      token: input.token ?? null,
      user: input.user ?? null,
      profile: input.profile ?? null,
    };
  }

  return {
    token: null,
    user: input ?? null,
    profile: null,
  };
};

export const AppStateProvider = ({ children }) => {
  const [token, setToken] = useState(() => readStorage('authToken', null));
  const [user, setUser] = useState(() => readStorage('user', null));
  const [profile, setProfile] = useState(() => readStorage('profile', profileSeed));
  const [characters, setCharacters] = useState(() => readStorage('characters', charactersSeed));
  const [posts, setPosts] = useState(() => readStorage('posts', postsSeed));
  const [merchants, setMerchants] = useState(() => readStorage('merchants', merchantsSeed));
  const [messages, setMessages] = useState(() => readStorage('messages', messagesSeed));
  const [highlights] = useState(todayHighlights);
  const [notifications, setNotifications] = useState(() =>
    readStorage('notifications', [
      { id: 1, contentName: '카오스게이트', enabled: true, notifyBeforeMinutes: 30 },
      { id: 2, contentName: '어드벤스', enabled: false, notifyBeforeMinutes: 15 },
    ]),
  );

  useEffect(() => {
    writeStorage('authToken', token);
  }, [token]);

  useEffect(() => {
    writeStorage('user', user);
  }, [user]);

  useEffect(() => {
    writeStorage('profile', profile);
  }, [profile]);

  useEffect(() => {
    writeStorage('characters', characters);
  }, [characters]);

  useEffect(() => {
    writeStorage('posts', posts);
  }, [posts]);

  useEffect(() => {
    writeStorage('merchants', merchants);
  }, [merchants]);

  useEffect(() => {
    writeStorage('messages', messages);
  }, [messages]);

  useEffect(() => {
    writeStorage('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    let cancelled = false;

    const syncCurrentUser = async () => {
      if (!token || user) {
        return;
      }

      try {
        const response = await api.getMe();
        if (cancelled) {
          return;
        }

        const payload = response?.data?.data ?? response?.data ?? {};
        if (payload.user) {
          setUser(payload.user);
        }
        if (payload.profile) {
          setProfile(payload.profile);
        }
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      }
    };

    void syncCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const value = useMemo(
    () => {
      const currentRole = normalizeRole(user?.role);

      return {
        token,
        user,
        profile,
        characters,
        posts,
        merchants,
        messages,
        highlights,
        notifications,
        isAuthenticated: Boolean(token && user),
        isAdmin: currentRole === 'ROLE_ADMIN',
        setToken,
        setUser,
        setProfile,
        setCharacters,
        setPosts,
        setMerchants,
        setMessages,
        setNotifications,
        login: (input) => {
          const next = resolveAuthPayload(input);
          if (next.token) {
            setToken(next.token);
          }
          if (next.user) {
            setUser(next.user);
          }
          if (next.profile) {
            setProfile(next.profile);
          }
        },
        logout: () => {
          setToken(null);
          setUser(null);
          setProfile(profileSeed);
        },
        setMainCharacter: async (character) => {
          setProfile((current) => ({
            ...current,
            mainCharacterName: character.characterName,
            serverName: character.serverName,
            characterClass: character.characterClass,
            itemLevel: character.itemLevel,
            characterImage: character.characterImage,
            updatedAt: new Date().toISOString().slice(0, 10),
          }));

          setCharacters((current) =>
            current.map((item) => ({
              ...item,
              isMain: item.characterName === character.characterName,
            })),
          );

          try {
            const response = await api.setMainCharacter(character.characterName);
            const payload = response?.data?.data ?? response?.data ?? {};

            if (payload.profile) {
              setProfile((current) => ({
                ...current,
                ...payload.profile,
              }));
            }
          } catch (error) {
            console.error('대표 캐릭터 저장에 실패했습니다.', error);
          }
        },
        toggleMerchantFavorite: (merchantId) => {
          setMerchants((current) =>
            current.map((item) =>
              item.id === merchantId ? { ...item, favorite: !item.favorite } : item,
            ),
          );
        },
        toggleNotification: (notificationId) => {
          setNotifications((current) => {
            const exists = current.some((item) => item.id === notificationId);
            if (!exists) {
              return [
                ...current,
                { id: notificationId, contentName: `콘텐츠 ${notificationId}`, enabled: true, notifyBeforeMinutes: 30 },
              ];
            }
            return current.map((item) =>
              item.id === notificationId ? { ...item, enabled: !item.enabled } : item,
            );
          });
        },
        createPost: (payload) => {
          const nextPost = {
            id: Date.now(),
            boardId: payload.boardId ?? 1,
            userId: user?.id ?? currentUserSeed?.id ?? 1,
            title: payload.title,
            content: payload.content,
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            author: user?.nickname ?? currentUserSeed?.nickname ?? 'LoaHub',
            className: payload.className ?? '자유',
            createdAt: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString().slice(0, 10),
            deletedYn: false,
            pinned: false,
            tags: payload.tags ?? [],
          };
          setPosts((current) => [nextPost, ...current]);
          return nextPost;
        },
        updatePost: (postId, payload) => {
          let updatedPost = null;
          setPosts((current) =>
            current.map((item) => {
              if (item.id !== postId) {
                return item;
              }

              updatedPost = {
                ...item,
                title: payload.title ?? item.title,
                content: payload.content ?? item.content,
                className: payload.className ?? item.className,
                updatedAt: new Date().toISOString().slice(0, 10),
              };
              return updatedPost;
            }),
          );
          return updatedPost;
        },
        deletePost: (postId) => {
          setPosts((current) => current.filter((item) => item.id !== postId));
        },
        togglePostLike: (postId) => {
          setPosts((current) =>
            current.map((item) =>
              item.id === postId ? { ...item, likeCount: item.likeCount + 1 } : item,
            ),
          );
        },
        addComment: (postId, content) => {
          setPosts((current) =>
            current.map((item) =>
              item.id === postId ? { ...item, commentCount: item.commentCount + 1 } : item,
            ),
          );
          return {
            id: Date.now(),
            postId,
            userId: user?.id ?? currentUserSeed?.id ?? 1,
            content,
            createdAt: new Date().toISOString().slice(0, 10),
            author: user?.nickname ?? currentUserSeed?.nickname ?? 'LoaHub',
          };
        },
        deleteMessage: (messageId) => {
          setMessages((current) => current.filter((item) => item.id !== messageId));
        },
        markMessageRead: (messageId) => {
          setMessages((current) =>
            current.map((item) => (item.id === messageId ? { ...item, isRead: true } : item)),
          );
        },
        searchCharactersLocal: async (name) => {
          const response = await api.searchCharacters(name);
          return response.data?.data ?? response.data;
        },
      };
    },
    [characters, highlights, messages, merchants, notifications, posts, profile, token, user],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState는 AppStateProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
};
