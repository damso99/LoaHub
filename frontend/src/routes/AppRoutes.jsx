import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BoardClassPage } from '../pages/BoardClassPage';
import { BoardsPage } from '../pages/BoardsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { CharacterSearchPage } from '../pages/CharacterSearchPage';
import { AdminPage } from '../pages/AdminPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MarketPage } from '../pages/MarketPage';
import { MessageDetailPage } from '../pages/MessageDetailPage';
import { MessagesPage } from '../pages/MessagesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProfileEditPage } from '../pages/ProfileEditPage';
import { SignupPage } from '../pages/SignupPage';
import { BoardListPage } from '../pages/BoardListPage';
import { PostWritePage } from '../pages/PostWritePage';
import { AdminRoute } from '../components/AdminRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/intro" replace />} />
        <Route path="/intro" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/character-search" element={<CharacterSearchPage />} />
        <Route path="/boards/free" element={<BoardsPage />} />
        <Route path="/boards/free/best" element={<BoardsPage />} />
        <Route path="/boards/jobs" element={<BoardListPage boardType="CLASS" />} />
        <Route path="/boards/jobs/:classCode" element={<BoardListPage boardType="CLASS" />} />
        <Route path="/boards/class" element={<Navigate to="/boards/jobs" replace />} />
        <Route path="/boards/class/:classCode" element={<BoardClassPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/boards" element={<Navigate to="/boards/free" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/boards/write" element={<PostWritePage />} />
          <Route path="/write" element={<PostWritePage />} />
          <Route path="/posts/write" element={<PostWritePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:messageId" element={<MessageDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
