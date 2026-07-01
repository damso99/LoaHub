import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

const items = [
  { to: '/intro', label: '홈' },
  { to: '/boards/free', label: '게시판' },
  { to: '/character-search', label: '검색' },
  { to: '/calendar', label: '캘린더' },
  { to: '/messages', label: '쪽지' },
  { to: '/profile', label: '프로필' },
];

export const BottomNav = () => {
  const { messageUnreadCount } = useAppState();

  return (
    <nav className="bottom-nav" aria-label="모바일 탐색">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/intro'}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
        >
          <span>{item.label}</span>
          {item.to === '/messages' && messageUnreadCount > 0 ? (
            <span className="bottom-nav__badge">{messageUnreadCount > 99 ? '99+' : messageUnreadCount}</span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
};
