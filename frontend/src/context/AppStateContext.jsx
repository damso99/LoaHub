import { Client } from '@stomp/stompjs';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { api } from '../api/client';
import { currentUserSeed } from '../data/mockData';
import { readStorage, writeStorage } from '../utils/storage';

const AppStateContext = createContext(null);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const normalizeRole = (role) => {
  if (!role) return '';
  return role.startsWith('ROLE_') ? role : `ROLE_${role}`;
};

const emptyProfile = {
  id: null,
  userId: null,
  mainCharacterName: '',
  serverName: '',
  characterClass: '',
  itemLevel: '',
  characterImage: '',
  bio: '',
  createdAt: '',
  updatedAt: '',
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

const readNotifications = () => readStorage('notifications', []);

export const AppStateProvider = ({ children }) => {
  const [token, setToken] = useState(() => readStorage('authToken', null));
  const [user, setUser] = useState(() => readStorage('user', null));
  const [profile, setProfile] = useState(() => readStorage('profile', emptyProfile));
  const [characters, setCharacters] = useState(() => readStorage('characters', []));
  const [posts, setPosts] = useState(() => readStorage('posts', []));
  const [notifications, setNotifications] = useState(() => readNotifications());
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [messageToasts, setMessageToasts] = useState([]);
  const [activeMessageThreadId, setActiveMessageThreadId] = useState(null);
  const [messageRefreshVersion, setMessageRefreshVersion] = useState(0);
  const socketRef = useRef(null);
  const toastKeysRef = useRef(new Set());

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
    writeStorage('notifications', notifications);
  }, [notifications]);

  const resetMessageRealtimeState = () => {
    setMessageUnreadCount(0);
    setMessageToasts([]);
    setActiveMessageThreadId(null);
    setMessageRefreshVersion(0);
    toastKeysRef.current.clear();
  };

  const handleAuthFailure = () => {
    if (socketRef.current) {
      socketRef.current.deactivate();
      socketRef.current = null;
    }
    resetMessageRealtimeState();
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.assign('/login');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      if (!token || !user) {
        setMessageUnreadCount(0);
        return;
      }

      try {
        const response = await api.getUnreadMessageCount();
        if (cancelled) return;

        const payload = response?.data?.data ?? response?.data ?? {};
        setMessageUnreadCount(Number(payload.unreadCount ?? 0));
      } catch (error) {
        if (!cancelled) {
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            handleAuthFailure();
          } else {
            setMessageUnreadCount(0);
          }
        }
      }
    };

    void loadUnreadCount();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.deactivate();
        socketRef.current = null;
      }
      resetMessageRealtimeState();
      return undefined;
    }

    const socketUrl = `${apiBaseUrl.replace(/^http/, 'ws')}/ws`;
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => undefined,
    });

    client.onConnect = () => {
      client.subscribe('/user/queue/messages', (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          if (payload?.threadId) {
            setMessageRefreshVersion((current) => current + 1);
          }
        } catch {
          setMessageRefreshVersion((current) => current + 1);
        }
      });

      client.subscribe('/user/queue/notifications', (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          if (typeof payload.unreadCount === 'number') {
            setMessageUnreadCount(payload.unreadCount);
          }

          if (String(payload.threadId ?? '') === String(activeMessageThreadId ?? '')) {
            setMessageRefreshVersion((current) => current + 1);
            return;
          }

          const toastKey = `${payload.threadId}:${payload.messageId ?? payload.createdAt ?? ''}`;
          if (toastKeysRef.current.has(toastKey)) {
            return;
          }

          toastKeysRef.current.add(toastKey);
          setMessageToasts((current) =>
            [
              {
                id: toastKey,
                threadId: payload.threadId,
                senderNickname: payload.senderNickname,
                preview: payload.preview,
                createdAt: payload.createdAt,
              },
              ...current,
            ].slice(0, 3),
          );
        } catch {
          // ignore malformed payloads
        }
      });

      client.subscribe('/user/queue/unread-count', (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          setMessageUnreadCount(Number(payload?.unreadCount ?? 0));
        } catch {
          // ignore malformed payloads
        }
      });
    };

    client.onStompError = () => {
      handleAuthFailure();
    };

    client.onWebSocketClose = () => {
      if (token && user) {
        handleAuthFailure();
      }
    };

    client.activate();
    socketRef.current = client;

    return () => {
      client.deactivate();
      if (socketRef.current === client) {
        socketRef.current = null;
      }
    };
  }, [activeMessageThreadId, token, user]);

  useEffect(() => {
    let cancelled = false;

    const syncCurrentUser = async () => {
      if (!token || user) return;

      try {
        const response = await api.getMe();
        if (cancelled) return;

        const payload = response?.data?.data ?? response?.data ?? {};
        if (payload.user) setUser(payload.user);
        if (payload.profile) setProfile(payload.profile);
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

  const value = useMemo(() => {
    const currentRole = normalizeRole(user?.role);

    return {
      token,
      user,
      profile,
      characters,
      posts,
      notifications,
      messageUnreadCount,
      messageToasts,
      activeMessageThreadId,
      messageRefreshVersion,
      isAuthenticated: Boolean(token && user),
      isAdmin: currentRole === 'ROLE_ADMIN',
      setToken,
      setUser,
      setProfile,
      setCharacters,
      setPosts,
      setNotifications,
      setMessageUnreadCount,
      setMessageToasts,
      setActiveMessageThreadId,
      login: (input) => {
        const next = resolveAuthPayload(input);
        if (next.token) setToken(next.token);
        if (next.user) setUser(next.user);
        if (next.profile) setProfile(next.profile);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        setProfile(emptyProfile);
        setCharacters([]);
        setPosts([]);
        setMessageUnreadCount(0);
        setMessageToasts([]);
        setActiveMessageThreadId(null);
        setMessageRefreshVersion(0);
        toastKeysRef.current.clear();
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
          console.error('대표 캐릭터 설정 실패', error);
        }
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
          className: payload.className ?? '기타',
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
            if (item.id !== postId) return item;

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
      searchCharactersLocal: async (name) => {
        const response = await api.searchCharacters(name);
        return response.data?.data ?? response.data;
      },
    };
  }, [
    activeMessageThreadId,
    characters,
    messageRefreshVersion,
    messageToasts,
    messageUnreadCount,
    notifications,
    posts,
    profile,
    token,
    user,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState는 AppStateProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
};
