import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Card } from './Card';
import { EmptyState } from './EmptyState';

const formatTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const MessageList = ({ threads, onDelete }) => {
  if (!threads || threads.length === 0) {
    return (
      <EmptyState
        title="쪽지가 없습니다."
        description="새로운 쪽지가 도착하면 이 화면에서 확인할 수 있습니다."
      />
    );
  }

  return (
    <div className="message-list">
      {threads.map((thread) => (
        <Card key={thread.threadId} className={`message-item ${thread.unreadCount > 0 ? 'unread' : ''}`}>
          <Link to={`/messages/${thread.threadId}`} className="message-item__link">
            <div className="message-item__top">
              <strong>{thread.opponentNickname}</strong>
              {thread.unreadCount > 0 ? <Badge tone="primary">{thread.unreadCount}</Badge> : <Badge tone="neutral">읽음</Badge>}
            </div>
            <p>{thread.lastMessage || '메시지가 없습니다.'}</p>
            <div className="message-item__meta">
              <span>{thread.opponentMainCharacterName || '대표 캐릭터 없음'}</span>
              <span>{formatTime(thread.lastMessageAt)}</span>
            </div>
          </Link>
          {onDelete ? (
            <button type="button" className="text-button" onClick={() => onDelete(thread.threadId)}>
              삭제
            </button>
          ) : null}
        </Card>
      ))}
    </div>
  );
};
