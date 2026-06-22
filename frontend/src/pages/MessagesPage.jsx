import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MessageList } from '../components/MessageList';
import { PageHeader } from '../components/PageHeader';

export const MessagesPage = () => {
  const { user, messages, deleteMessage } = useAppState();
  const [tab, setTab] = useState('inbox');

  const inbox = useMemo(() => messages.filter((message) => message.receiverId === user?.id), [messages, user?.id]);
  const sent = useMemo(() => messages.filter((message) => message.senderId === user?.id), [messages, user?.id]);

  const list = tab === 'inbox' ? inbox : sent;

  return (
    <div className="page-stack">
      <PageHeader
        title="쪽지함"
        description="받은 쪽지와 보낸 쪽지를 분리해서 관리합니다."
        action={
          <Button as={Link} to="/messages/1">
            새 쪽지 작성
          </Button>
        }
      />

      <Card className="tab-card">
        <div className="tab-row">
          <button type="button" className={`tab-pill ${tab === 'inbox' ? 'active' : ''}`} onClick={() => setTab('inbox')}>
            받은 쪽지
          </button>
          <button type="button" className={`tab-pill ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
            보낸 쪽지
          </button>
        </div>
      </Card>

      <MessageList messages={list} mode={tab} onDelete={deleteMessage} />
    </div>
  );
};
