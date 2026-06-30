import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const AppLayout = () => {
  const location = useLocation();
  const isLightCanvas = false;

  return (
    <div className="app-shell">
      <Header />
      <div className="app-shell__body">
        <Sidebar />
        <main className={`content-area ${isLightCanvas ? 'content-area--light' : ''}`.trim()}>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
