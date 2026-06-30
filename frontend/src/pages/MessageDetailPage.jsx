import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';

const extractData = (response) => response?.data?.data ?? response?.data ?? [];

const formatTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const MessageDetailPage = () => {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { setMessageUnreadCount } = useAppState();
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const thread = useMemo(() => threads.find((item) => String(item.threadId) === String(threadId)), [threads, threadId]);

  const loadThread = async () => {
    if (!threadId) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const [threadResponse, messageResponse, unreadResponse] = await Promise.all([
        api.getMessageThreads(),
        api.getMessageThread(threadId),
        api.getUnreadMessageCount(),
      ]);

      const threadData = extractData(threadResponse);
      const messageData = extractData(messageResponse);
      const unreadData = extractData(unreadResponse);

      setThreads(Array.isArray(threadData) ? threadData : []);
      setMessages(Array.isArray(messageData) ? messageData : []);
      setMessageUnreadCount(Number(unreadData.unreadCount ?? 0));

      try {
        await api.markMessageThreadRead(threadId);
        const refreshedUnread = await api.getUnreadMessageCount();
        const refreshedData = extractData(refreshedUnread);
        setMessageUnreadCount(Number(refreshedData.unreadCount ?? 0));
      } catch {
        // 읽음 처리 실패는 화면을 막지 않는다.
      }
    } catch (error) {
      setMessages([]);
      setErrorMessage(error?.response?.data?.message || '대화를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadThread();
  }, [threadId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const nextReply = String(reply ?? '').trim();
    if (!nextReply) {
      setErrorMessage('쪽지 내용을 입력해 주세요.');
      return;
    }

    if (!thread) {
      setErrorMessage('대화 상대를 찾을 수 없습니다.');
      return;
    }

    setSending(true);
    setErrorMessage('');
    try {
      await api.createMessage({
        receiverId: thread.opponentId,
        content: nextReply,
      });
      setReply('');
      await loadThread();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || '쪽지를 전송하지 못했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!thread) {
      return;
    }

    try {
      await api.deleteMessageThread(thread.threadId);
      navigate('/messages');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || '쪽지를 삭제하지 못했습니다.');
    }
  };

  if (!loading && (!thread || messages.length === 0) && errorMessage) {
    return (
      <div className="page-stack narrow">
        <PageHeader title="쪽지 상세" description="선택한 대화의 내용을 확인합니다." />
        <EmptyState title="대화를 찾을 수 없습니다." description={errorMessage} />
        <Button as={Link} to="/messages" variant="secondary">
          쪽지함으로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="page-stack message-detail-page">
      <PageHeader
        title={thread ? thread.opponentNickname : '쪽지 상세'}
        description={thread ? `${thread.opponentMainCharacterName || '대표 캐릭터 없음'} · ${formatTime(thread.lastMessageAt)}` : '대화 내용을 불러오는 중입니다.'}
        action={
          <div className="inline-actions">
            <Button as={Link} to="/messages" variant="secondary">
              목록
            </Button>
            <Button variant="outline" onClick={handleDelete} disabled={!thread}>
              삭제
            </Button>
          </div>
        }
      />

      <Card className="message-detail-card">
        <div className="message-conversation">
          {messages.length > 0 ? (
            messages.map((message) => (
              <article key={message.id} className={`message-bubble ${message.mine ? 'mine' : ''}`}>
                <div className="message-bubble__meta">
                  <strong>{message.mine ? '나' : message.senderNickname}</strong>
                  <span>{formatTime(message.createdAt)}</span>
                </div>
                <p>{message.content}</p>
              </article>
            ))
          ) : (
            <EmptyState title="대화 내용이 없습니다." description="새 쪽지를 보내 대화를 시작해 보세요." />
          )}
        </div>
      </Card>

      <Card className="message-reply-card">
        <form className="message-reply-form" onSubmit={handleSend}>
          <Input label="쪽지 답장" placeholder="답장을 입력하세요." value={reply} onChange={(event) => setReply(event.target.value)} />
          <div className="inline-actions">
            <Button type="submit" disabled={sending}>
              {sending ? '전송 중...' : '보내기'}
            </Button>
          </div>
        </form>
        {errorMessage ? <p className="form-footnote auth-message auth-message--error">{errorMessage}</p> : null}
      </Card>
    </div>
  );
};
