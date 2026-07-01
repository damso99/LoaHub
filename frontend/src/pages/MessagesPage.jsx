import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { MessageList } from '../components/MessageList';
import { PageHeader } from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';

const extractData = (response) => response?.data?.data ?? response?.data ?? [];

export const MessagesPage = () => {
  const { user, messageUnreadCount, setMessageUnreadCount, messageRefreshVersion, setActiveMessageThreadId } = useAppState();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadThreads = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await api.getMessageThreads();
      const data = extractData(response);
      setThreads(Array.isArray(data) ? data : []);
    } catch (error) {
      setThreads([]);
      setErrorMessage(error?.response?.data?.message || '쪽지 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadThreads();
    setActiveMessageThreadId(null);
  }, [messageRefreshVersion, setActiveMessageThreadId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const nextReceiverId = Number(receiverId);
    const nextContent = String(content ?? '').trim();

    if (!Number.isFinite(nextReceiverId) || nextReceiverId <= 0) {
      setErrorMessage('받는 사람 ID를 입력해 주세요.');
      return;
    }

    if (!nextContent) {
      setErrorMessage('쪽지 내용을 입력해 주세요.');
      return;
    }

    setSending(true);
    setErrorMessage('');
    try {
      await api.createMessage({ receiverId: nextReceiverId, content: nextContent });
      setReceiverId('');
      setContent('');
      await loadThreads();
      const unreadResponse = await api.getUnreadMessageCount();
      const unreadPayload = unreadResponse?.data?.data ?? unreadResponse?.data ?? {};
      setMessageUnreadCount(Number(unreadPayload.unreadCount ?? 0));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || '쪽지를 전송하지 못했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (threadId) => {
    try {
      await api.deleteMessageThread(threadId);
      await loadThreads();
      const unreadResponse = await api.getUnreadMessageCount();
      const unreadPayload = unreadResponse?.data?.data ?? unreadResponse?.data ?? {};
      setMessageUnreadCount(Number(unreadPayload.unreadCount ?? 0));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || '쪽지를 삭제하지 못했습니다.');
    }
  };

  return (
    <div className="page-stack message-page">
      <PageHeader
        title="쪽지함"
        description="실시간으로 쪽지를 주고받고, 읽음 상태와 알림을 확인할 수 있습니다."
        action={
          <Button as={Link} to="/profile" variant="secondary">
            프로필 보기
          </Button>
        }
      />

      <Card className="message-summary-card">
        <div className="message-summary-card__top">
          <div>
            <p className="eyebrow">Unread</p>
            <strong>읽지 않은 쪽지 {messageUnreadCount}개</strong>
          </div>
          <span className="message-summary-card__hint">실시간 알림은 WebSocket으로 갱신됩니다.</span>
        </div>
      </Card>

      <Card className="message-compose-card">
        <form className="message-compose-form" onSubmit={handleSend}>
          <Input
            label="받는 사람 ID"
            type="number"
            min="1"
            placeholder="예: 2"
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
          />
          <label className="field">
            <span className="field-label">쪽지 내용</span>
            <textarea
              className="input message-compose-form__textarea"
              placeholder="전할 내용을 입력하세요."
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
          <div className="inline-actions">
            <Button type="submit" disabled={sending}>
              {sending ? '전송 중...' : '쪽지 보내기'}
            </Button>
          </div>
        </form>
        {errorMessage ? <p className="form-footnote auth-message auth-message--error">{errorMessage}</p> : null}
      </Card>

      <Card className="message-list-card">
        <div className="message-list-card__header">
          <h2>대화 목록</h2>
          <span>{loading ? '불러오는 중...' : `${threads.length}개 대화`}</span>
        </div>
        <MessageList threads={threads} onDelete={handleDelete} />
      </Card>
    </div>
  );
};
