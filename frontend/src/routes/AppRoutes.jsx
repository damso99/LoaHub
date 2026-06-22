import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { BoardClassPage } from '../pages/BoardClassPage';
import { BoardsPage } from '../pages/BoardsPage';
import { CalendarPage } from '../pages/CalendarPage';
import { CharacterSearchPage } from '../pages/CharacterSearchPage';
import { AdminPage } from '../pages/AdminPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MerchantPage } from '../pages/MerchantPage';
import { MessageDetailPage } from '../pages/MessageDetailPage';
import { MessagesPage } from '../pages/MessagesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProfileEditPage } from '../pages/ProfileEditPage';
import { SignupPage } from '../pages/SignupPage';
import { WritePage } from '../pages/WritePage';
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
        <Route path="/boards/class" element={<BoardsPage />} />
        <Route path="/boards/class/:className" element={<BoardClassPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/merchant" element={<MerchantPage />} />
        <Route path="/boards" element={<Navigate to="/boards/free" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/write" element={<WritePage />} />
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
