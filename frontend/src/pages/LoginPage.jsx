import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { login as loginRequest } from '../api/authApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setProfile } = useAppState();
  const [form, setForm] = useState({ email: '', password: '' });
  const [banner] = useState(location.state?.message ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setForm((current) => ({ ...current, email: location.state.email }));
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const { data } = await loginRequest({
        email: form.email.trim(),
        password: form.password,
      });

      login({
        token: data?.data?.token ?? null,
        user: data?.data?.user ?? null,
        profile: data?.data?.profile ?? null,
      });
      if (data?.data?.profile) {
        setProfile(data.data.profile);
      }
      navigate(location.state?.from ?? '/profile', { replace: true });
    } catch (exception) {
      const responseMessage = exception?.response?.data?.message;
      setError(responseMessage || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack narrow auth-page">
      <PageHeader
        title="로그인"
        description="이메일 계정 또는 디스코드 계정으로 LoaHub에 접속할 수 있습니다."
      />
      <Card className="form-card auth-card">
        <div className="auth-card__hero">
          <p className="eyebrow">Welcome back</p>
          <h2>다시 돌아오신 것을 환영합니다</h2>
          <p>회원가입을 완료했다면 아래에서 바로 로그인할 수 있습니다.</p>
        </div>

        <form className="form-stack auth-form" onSubmit={handleSubmit}>
          {banner ? <div className="auth-message auth-message--success">{banner}</div> : null}
          {error ? <div className="auth-message auth-message--error">{error}</div> : null}

          <Input
            label="이메일"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
          />
          <Input
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            autoComplete="current-password"
          />

          <div className="auth-form__actions">
            <Button type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            <Button type="button" variant="secondary" disabled>
              디스코드 로그인 준비중
            </Button>
          </div>

          <p className="form-footnote auth-form__footer">
            계정이 없으신가요? <Link to="/register">회원가입</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};
