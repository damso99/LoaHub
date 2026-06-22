import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { EmptyState } from './EmptyState';
import { Card } from './Card';

export const MessageList = ({ messages, mode, onDelete }) => {
  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        title="받은 쪽지가 없습니다."
        description="새로운 쪽지가 도착하면 이 화면에서 확인할 수 있습니다."
      />
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <Card key={message.id} className={`message-item ${message.isRead ? 'read' : ''}`}>
          <Link to={`/messages/${message.id}`} className="message-item__link">
            <div className="message-item__top">
              <strong>{message.title}</strong>
              <Badge tone={message.isRead ? 'neutral' : 'primary'}>{message.isRead ? '읽음' : '안읽음'}</Badge>
            </div>
            <p>{message.content}</p>
            <div className="message-item__meta">
              <span>{mode === 'inbox' ? message.senderNickname : message.receiverNickname}</span>
              <span>{message.createdAt}</span>
            </div>
          </Link>
          <button type="button" className="text-button" onClick={() => onDelete(message.id)}>
            삭제
          </button>
        </Card>
      ))}
    </div>
  );
};
