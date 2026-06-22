import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppState();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: '로그인이 필요한 기능입니다.', from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
};
