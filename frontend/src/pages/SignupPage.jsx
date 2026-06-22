import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkEmail, checkNickname, signup } from '../api/authApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  email: '',
  password: '',
  passwordConfirm: '',
  nickname: '',
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));

    if (field === 'email') {
      setEmailChecked(false);
      setEmailCheckMessage('');
    }

    setError('');
  };

  const validateForm = () => {
    const nextErrors = {};
    const email = form.email.trim();
    const nickname = form.nickname.trim();

    if (!email) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else if (!emailPattern.test(email)) {
      nextErrors.email = '이메일 형식이 올바르지 않습니다.';
    }

    if (!form.password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    } else if (form.password.length < 8) {
      nextErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    }

    if (!form.passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호 확인을 입력해 주세요.';
    } else if (form.password !== form.passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!nickname) {
      nextErrors.nickname = '닉네임을 입력해 주세요.';
    } else if (nickname.length < 2 || nickname.length > 12) {
      nextErrors.nickname = '닉네임은 2~12자 사이로 입력해 주세요.';
    }

    return nextErrors;
  };

  const handleCheckEmail = async () => {
    const email = form.email.trim();

    if (!email) {
      setFieldErrors((current) => ({ ...current, email: '이메일을 입력해 주세요.' }));
      return;
    }

    if (!emailPattern.test(email)) {
      setFieldErrors((current) => ({ ...current, email: '이메일 형식이 올바르지 않습니다.' }));
      return;
    }

    try {
      setEmailCheckLoading(true);
      setError('');

      const response = await checkEmail(email);
      const available = Boolean(response.data?.data?.available);
      const message =
        response.data?.message || (available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.');

      setEmailChecked(available);
      setEmailCheckMessage(message);

      if (!available) {
        setError(message);
      }
    } catch (exception) {
      const responseMessage = exception?.response?.data?.message;
      const message = responseMessage || '이메일 중복 확인에 실패했습니다. 다시 시도해 주세요.';
      setEmailChecked(false);
      setEmailCheckMessage(message);
      setError(message);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!emailChecked) {
      setError('이메일 중복확인을 먼저 진행해 주세요.');
      return;
    }

    const email = form.email.trim();
    const nickname = form.nickname.trim();

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});

      const nicknameCheckResponse = await checkNickname(nickname);
      if (!nicknameCheckResponse.data?.data?.available) {
        setError(nicknameCheckResponse.data?.message || '이미 사용 중인 닉네임입니다.');
        return;
      }

      const response = await signup({
        email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        nickname,
      });

      const successMessage = response.data?.message || '회원가입이 완료되었습니다.';
      window.alert(successMessage);
      navigate('/login', {
        replace: true,
        state: {
          message: successMessage,
          email,
        },
      });
    } catch (exception) {
      const responseMessage = exception?.response?.data?.message;
      setError(responseMessage || '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack auth-page signup-page">
      <Card className="form-card auth-card signup-card">
        <div className="signup-layout">
          <section className="signup-copy" aria-labelledby="signup-intro-title">
            <p className="eyebrow signup-brand">LOAHUB</p>
            <div className="signup-copy__header">
              <h1 id="signup-intro-title">
                로스트아크를
                <span>더 편하게 즐기는 공간</span>
              </h1>
              <h2>LoaHub와 함께 시작해 보세요</h2>
              <p className="signup-copy__description">
                캐릭터 정보, 게시판, 콘텐츠 일정을 한곳에서 확인하고
                필요한 기능만 깔끔하게 이용할 수 있습니다.
              </p>
            </div>

            <ul className="signup-list" aria-label="서비스 안내">
              <li>안전한 이메일 기반 회원가입</li>
              <li>자유게시판과 직업별 게시판 이용</li>
              <li>요일별 주요 콘텐츠 일정 확인</li>
              <li>이메일 중복확인 후 가입 진행</li>
            </ul>

            <p className="signup-copy__note">
              가입 후에는 내 캐릭터를 등록하고 LoaHub의 주요 기능을 사용할 수 있습니다.
            </p>
          </section>

          <section className="signup-form-panel" aria-labelledby="signup-form-title">
            <div className="signup-form-panel__header">
              <p className="eyebrow">회원 정보</p>
              <h2 id="signup-form-title">LoaHub 회원가입</h2>
              <p>
                이메일과 닉네임으로 계정을 만들고
                <br />
                내 캐릭터 커뮤니티 활동을 시작해 보세요.
              </p>
            </div>

            <form className="form-stack auth-form signup-form" onSubmit={handleSubmit}>
              {error ? <div className="auth-message auth-message--error">{error}</div> : null}

              <div className="email-check-row">
                <Input
                  label="이메일"
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  autoComplete="email"
                  placeholder="example@loahub.com"
                  hint={fieldErrors.email || emailCheckMessage}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCheckEmail}
                  disabled={
                    loading ||
                    emailCheckLoading ||
                    !form.email.trim() ||
                    !emailPattern.test(form.email.trim())
                  }
                >
                  {emailCheckLoading ? '확인 중...' : '이메일 중복확인'}
                </Button>
              </div>

              <Input
                label="비밀번호"
                type="password"
                value={form.password}
                onChange={updateField('password')}
                autoComplete="new-password"
                placeholder="최소 8자 이상"
                hint={fieldErrors.password}
              />
              <Input
                label="비밀번호 확인"
                type="password"
                value={form.passwordConfirm}
                onChange={updateField('passwordConfirm')}
                autoComplete="new-password"
                placeholder="비밀번호를 다시 입력해 주세요."
                hint={fieldErrors.passwordConfirm}
              />
              <Input
                label="닉네임"
                value={form.nickname}
                onChange={updateField('nickname')}
                autoComplete="nickname"
                placeholder="2~12자"
                hint={fieldErrors.nickname}
              />

              <div className="auth-form__actions signup-actions">
                <Button type="submit" disabled={loading}>
                  {loading ? '회원가입 처리 중...' : '회원가입'}
                </Button>
              </div>

              <p className="form-footnote auth-form__footer">
                이미 LoaHub 계정이 있으신가요? <Link to="/login">로그인으로 이동</Link>
              </p>
            </form>
          </section>
        </div>
      </Card>
    </div>
  );
};
