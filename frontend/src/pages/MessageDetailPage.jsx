import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';

export const MessageDetailPage = () => {
  const { messageId } = useParams();
  const { messages, markMessageRead } = useAppState();

  const message = messages.find((item) => String(item.id) === String(messageId)) ?? messages[0];

  useEffect(() => {
    if (message && !message.isRead) {
      markMessageRead(message.id);
    }
  }, [markMessageRead, message]);

  return (
    <div className="page-stack narrow">
      <PageHeader title={message.title} description={`${message.createdAt} · ${message.isRead ? '읽음' : '안읽음'}`} />
      <Card className="message-detail">
        <div className="message-detail__meta">
          <span>보낸 사람: {message.senderNickname}</span>
          <span>받는 사람: {message.receiverNickname}</span>
        </div>
        <p>{message.content}</p>
        <Button variant="secondary">답장하기</Button>
      </Card>
    </div>
  );
};
