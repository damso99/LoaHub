import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAppState } from '../context/AppStateContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';

export const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, profile, setUser, setProfile } = useAppState();
  const [form, setForm] = useState({ nickname: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setForm({
      nickname: user?.nickname ?? '',
      bio: profile?.bio ?? '',
    });
  }, [profile?.bio, user?.nickname]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextNickname = String(form.nickname ?? '').trim();
    const nextBio = String(form.bio ?? '').trim();

    if (!nextNickname) {
      setErrorMessage('닉네임을 입력해 주세요.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const response = await api.updateMe({
        nickname: nextNickname,
        bio: nextBio,
      });
      const payload = response?.data?.data ?? response?.data ?? {};
      if (payload.user) {
        setUser(payload.user);
      }
      if (payload.profile) {
        setProfile(payload.profile);
      }
      navigate('/profile');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        '프로필 저장에 실패했습니다.';
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack narrow">
      <PageHeader title="프로필 수정" description="닉네임과 소개글을 수정합니다." />
      <Card className="form-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="닉네임"
            value={form.nickname}
            onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
          />
          <label className="field">
            <span className="field-label">소개글</span>
            <textarea
              className="textarea"
              rows="5"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </label>
          {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}
          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
