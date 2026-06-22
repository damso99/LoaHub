import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, user } = useAppState();

  const goToLogin = () => {
    window.alert('로그인이 필요한 기능입니다.');
    navigate('/login', {
      replace: true,
      state: {
        message: '로그인이 필요한 기능입니다.',
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  const requireLogin = () => {
    if (!isAuthenticated) {
      goToLogin();
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!isAuthenticated) {
      goToLogin();
      return false;
    }
    if (!isAdmin) {
      window.alert('관리자 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    requireLogin,
    requireAdmin,
  };
};
