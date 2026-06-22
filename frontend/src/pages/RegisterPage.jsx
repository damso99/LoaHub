import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    mainCharacterName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    if (!form.email.trim()) {
      return '이메일을 입력해주세요.';
    }
    if (!emailPattern.test(form.email.trim())) {
      return '이메일 형식이 올바르지 않습니다.';
    }
    if (!form.password) {
      return '비밀번호를 입력해주세요.';
    }
    if (form.password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (form.password !== form.passwordConfirm) {
      return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
    }
    if (!form.nickname.trim()) {
      return '닉네임을 입력해주세요.';
    }
    if (form.nickname.trim().length < 2 || form.nickname.trim().length > 20) {
      return '닉네임은 2자 이상 20자 이하로 입력해주세요.';
    }
    if (!form.mainCharacterName.trim()) {
      return '대표 캐릭터명을 입력해주세요.';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = await register({
        email: form.email.trim(),
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        nickname: form.nickname.trim(),
        mainCharacterName: form.mainCharacterName.trim(),
      });

      navigate('/login', {
        replace: true,
        state: {
          message: data?.message ?? '회원가입이 완료되었습니다.',
          email: form.email.trim(),
        },
      });
    } catch (exception) {
      const responseMessage = exception?.response?.data?.message;
      setError(responseMessage || '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack narrow auth-page">
      <PageHeader
        title="회원가입"
        description="로스트아크 커뮤니티 LoaHub에서 사용할 계정을 만들고 대표 캐릭터를 등록하세요."
      />
      <Card className="form-card auth-card">
        <div className="auth-card__hero">
          <p className="eyebrow">LoaHub Community</p>
          <h2>로스트아크 커뮤니티에 합류하세요</h2>
          <p>이메일과 닉네임으로 간단하게 시작하고, 대표 캐릭터는 이후에도 수정할 수 있습니다.</p>
        </div>

        <form className="form-stack auth-form" onSubmit={handleSubmit}>
          {error ? <div className="auth-message auth-message--error">{error}</div> : null}

          <Input
            label="이메일"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            placeholder="test@example.com"
          />
          <Input
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="new-password"
            placeholder="8자 이상 입력"
          />
          <Input
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            onChange={handleChange('passwordConfirm')}
            autoComplete="new-password"
            placeholder="비밀번호를 다시 입력"
          />
          <Input
            label="닉네임"
            value={form.nickname}
            onChange={handleChange('nickname')}
            autoComplete="nickname"
            placeholder="2~20자"
          />
          <Input
            label="대표 캐릭터명"
            value={form.mainCharacterName}
            onChange={handleChange('mainCharacterName')}
            placeholder="캐릭터명을 입력하세요"
          />

          <div className="auth-form__actions">
            <Button type="submit" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
            <Button type="button" variant="secondary" disabled>
              디스코드 로그인 준비중
            </Button>
          </div>

          <p className="form-footnote auth-form__footer">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};
