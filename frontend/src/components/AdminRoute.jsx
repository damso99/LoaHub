import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

export const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAppState();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ message: '로그인이 필요한 기능입니다.', from: `${location.pathname}${location.search}` }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/intro" replace state={{ message: '관리자 권한이 필요합니다.' }} />;
  }

  return <Outlet />;
};
