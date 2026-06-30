import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

export const MessageToastStack = () => {
  const { messageToasts, setMessageToasts } = useAppState();

  useEffect(() => {
    if (!messageToasts.length) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setMessageToasts((current) => current.slice(0, Math.max(0, current.length - 1)));
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [messageToasts, setMessageToasts]);

  if (!messageToasts.length) {
    return null;
  }

  return (
    <div className="message-toast-stack">
      {messageToasts.map((toast) => (
        <Link key={toast.id} to={`/messages/${toast.threadId}`} className="message-toast">
          <strong>{toast.senderNickname}에게 새 쪽지가 도착했습니다.</strong>
          <span>{toast.preview}</span>
        </Link>
      ))}
    </div>
  );
};
