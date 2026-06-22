import { NavLink } from 'react-router-dom';

const items = [
  { to: '/intro', label: '인트로' },
  { to: '/boards/free', label: '게시판' },
  { to: '/character-search', label: '검색' },
  { to: '/calendar', label: '캘린더' },
  { to: '/profile', label: '프로필' },
];

export const BottomNav = () => {
  return (
    <nav className="bottom-nav" aria-label="모바일 탐색">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/intro'}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
