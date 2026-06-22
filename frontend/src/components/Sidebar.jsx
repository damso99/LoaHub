import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Card } from './Card';

const navItems = [
  { to: '/intro', label: '홈', icon: 'home' },
  { to: '/character-search', label: '캐릭터 검색', icon: 'swords' },
  { to: '/boards/free', label: '게시판', icon: 'dashboard' },
  { to: '/calendar', label: '캘린더', icon: 'calendar_today' },
  { to: '/merchant', label: '떠돌이상인', icon: 'storefront' },
];

export const Sidebar = () => {
  const { profile, isAdmin, isAuthenticated } = useAppState();

  return (
    <aside className="sidebar">
      <Card className="profile-card">
        {isAuthenticated ? (
          <>
            <div className="profile-card__avatar">
              <img src={profile.characterImage} alt={profile.mainCharacterName} />
              <span className="profile-card__status" />
            </div>
            <div className="profile-card__content">
              <strong>{profile.mainCharacterName}</strong>
              <p>{profile.characterClass}</p>
              <p>아이템레벨 {profile.itemLevel}</p>
            </div>
          </>
        ) : (
          <div className="profile-card__content">
            <strong>로그인이 필요합니다</strong>
            <p>로그인 후 캐릭터와 쪽지 기능을 이용할 수 있습니다.</p>
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
