import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from './Button';

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAppState();
  const [keyword, setKeyword] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? `/character-search?q=${encodeURIComponent(trimmed)}` : '/character-search');
  };

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <Link to="/intro" className="brand-link">
          <span className="brand-link__logo">LoaHub</span>
        </Link>
      </div>

      <form className="topbar-search" onSubmit={handleSearch}>
        <span className="material-symbols-outlined topbar-search__icon">search</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="캐릭터 검색"
          aria-label="캐릭터 검색"
        />
      </form>

      <div className="topbar__actions">
        {user ? (
          <>
            <Button as={Link} to="/messages" variant="ghost" className="icon-button" aria-label="쪽지함">
              <span className="material-symbols-outlined">mail</span>
            </Button>
            <Button as={Link} to="/profile" variant="ghost" className="icon-button" aria-label="프로필">
              <span className="material-symbols-outlined">person</span>
            </Button>
            <Link to="/profile" className="user-chip">
              {user.nickname}
            </Link>
          </>
        ) : (
          <Button as={Link} to="/login">
            로그인
          </Button>
        )}
      </div>
    </header>
  );
};
