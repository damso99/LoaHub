import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';

export const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, profile, setUser, setProfile } = useAppState();
  const [form, setForm] = useState({
    nickname: '',
    bio: '',
  });

  useEffect(() => {
    setForm({
      nickname: user?.nickname ?? '',
      bio: profile?.bio ?? '',
    });
  }, [profile?.bio, user?.nickname]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setUser((current) => (current ? { ...current, nickname: form.nickname } : current));
    setProfile((current) => (current ? { ...current, bio: form.bio } : current));
    navigate('/profile');
  };

  return (
    <div className="page-stack narrow">
      <PageHeader title="프로필 수정" description="닉네임과 소개 문구를 수정합니다." />
      <Card className="form-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="닉네임"
            value={form.nickname}
            onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
          />
          <label className="field">
            <span className="field-label">소개</span>
            <textarea
              className="textarea"
              rows="5"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </label>
          <Button type="submit">저장하기</Button>
        </form>
      </Card>
    </div>
  );
};
