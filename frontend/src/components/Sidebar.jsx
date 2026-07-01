import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Card } from './Card';

const navItems = [
  { to: '/intro', label: '홈', icon: 'home' },
  { to: '/character-search', label: '캐릭터 검색', icon: 'swords' },
  { to: '/boards/free', label: '게시판', icon: 'dashboard' },
  { to: '/calendar', label: '캘린더', icon: 'calendar_today' },
  { to: '/messages', label: '쪽지', icon: 'mail' },
];

export const Sidebar = () => {
  const { profile, isAdmin, isAuthenticated, messageUnreadCount } = useAppState();
  const profileImage = profile?.characterImage || 'https://placehold.co/120x120/162033/7cb8ff?text=LoaHub';
  const mainCharacterName = profile?.mainCharacterName || '대표 캐릭터 미설정';
  const characterClass = profile?.characterClass || '직업 미설정';
  const itemLevel = profile?.itemLevel || '-';

  return (
    <aside className="sidebar">
      <Card className="profile-card">
        {isAuthenticated ? (
          <>
            <div className="profile-card__avatar">
              <img src={profileImage} alt={mainCharacterName} />
              <span className="profile-card__status" />
            </div>
            <div className="profile-card__content">
              <strong>{mainCharacterName}</strong>
              <p>{characterClass}</p>
              <p>아이템레벨 {itemLevel}</p>
            </div>
          </>
        ) : (
          <div className="profile-card__content">
            <strong>로그인이 필요합니다</strong>
            <p>로그인 후 캐릭터와 쪽지 기능을 사용할 수 있습니다.</p>
          </div>
        )}
      </Card>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/intro'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-link__icon material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
            {item.to === '/messages' && messageUnreadCount > 0 ? (
              <span className="nav-link__badge">{messageUnreadCount > 99 ? '99+' : messageUnreadCount}</span>
            ) : null}
          </NavLink>
        ))}
        {isAdmin ? (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-link__icon material-symbols-outlined">admin_panel_settings</span>
            <span>관리자</span>
          </NavLink>
        ) : null}
      </nav>
    </aside>
  );
};
