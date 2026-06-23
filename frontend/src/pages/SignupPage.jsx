import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkEmail, checkNickname, signup } from '../api/authApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = {
  brand: 'LOAHUB',
  introTitle: 'Build your',
  introSubtitle: 'Lost Ark character hub',
  introDescription:
    'Manage character info, boards, and content schedules in one place with only the features you need.',
  introList: [
    'Safe sign-up with email verification',
    'Access to free and class boards',
    'Lost Ark content schedule checks',
    'Continue after email duplicate check',
  ],
  introNote: 'After sign-up, you can register a character and start using the main LoaHub features.',
  formEyebrow: 'Account info',
  formTitle: 'LoaHub Sign Up',
  formDescription: 'Create an account with your email and nickname, then continue with character setup.',
  emailLabel: 'Email',
  emailPlaceholder: 'example@loahub.com',
  emailCheckButton: 'Check email',
  emailCheckLoading: 'Checking...',
  passwordLabel: 'Password',
  passwordPlaceholder: 'At least 8 characters',
  passwordConfirmLabel: 'Confirm password',
  passwordConfirmPlaceholder: 'Re-enter your password',
  nicknameLabel: 'Nickname',
  nicknamePlaceholder: '2-12 characters',
  signupButton: 'Sign up',
  signupButtonLoading: 'Signing up...',
  loginLinkPrefix: 'Already have a LoaHub account?',
  loginLink: 'Go to login',
  validation: {
    emailRequired: 'Please enter your email.',
    emailInvalid: 'Please enter a valid email address.',
    passwordRequired: 'Please enter your password.',
    passwordLength: 'Password must be at least 8 characters.',
    passwordConfirmRequired: 'Please confirm your password.',
    passwordMismatch: 'Passwords do not match.',
    nicknameRequired: 'Please enter a nickname.',
    nicknameLength: 'Nickname must be 2-12 characters.',
    emailCheckRequired: 'Please check your email duplicate status first.',
    emailCheckFailed: 'Email duplicate check failed. Please try again.',
    nicknameDuplicate: 'This nickname is already in use.',
    signupFailed: 'Sign up failed. Please try again later.',
  },
};

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
      nextErrors.email = text.validation.emailRequired;
    } else if (!emailPattern.test(email)) {
      nextErrors.email = text.validation.emailInvalid;
    }

    if (!form.password) {
      nextErrors.password = text.validation.passwordRequired;
    } else if (form.password.length < 8) {
      nextErrors.password = text.validation.passwordLength;
    }

    if (!form.passwordConfirm) {
      nextErrors.passwordConfirm = text.validation.passwordConfirmRequired;
    } else if (form.password !== form.passwordConfirm) {
      nextErrors.passwordConfirm = text.validation.passwordMismatch;
    }

    if (!nickname) {
      nextErrors.nickname = text.validation.nicknameRequired;
    } else if (nickname.length < 2 || nickname.length > 12) {
      nextErrors.nickname = text.validation.nicknameLength;
    }

    return nextErrors;
  };

  const handleCheckEmail = async () => {
    const email = form.email.trim();

    if (!email) {
      setFieldErrors((current) => ({ ...current, email: text.validation.emailRequired }));
      return;
    }

    if (!emailPattern.test(email)) {
      setFieldErrors((current) => ({ ...current, email: text.validation.emailInvalid }));
      return;
    }

    try {
      setEmailCheckLoading(true);
      setError('');

      const response = await checkEmail(email);
      const available = Boolean(response.data?.data?.available);
      const message =
        response.data?.message ||
        (available ? 'This email is available.' : 'This email is already in use.');

      setEmailChecked(available);
      setEmailCheckMessage(message);

      if (!available) {
        setError(message);
      }
    } catch (exception) {
      const responseMessage = exception?.response?.data?.message;
      const message = responseMessage || text.validation.emailCheckFailed;
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
      setError(text.validation.emailCheckRequired);
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
        setError(nicknameCheckResponse.data?.message || text.validation.nicknameDuplicate);
        return;
      }

      const response = await signup({
        email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        nickname,
      });

      const successMessage = response.data?.message || 'Sign up completed.';
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
      setError(responseMessage || text.validation.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack auth-page signup-page">
      <Card className="form-card auth-card signup-card">
        <div className="signup-layout">
          <section className="signup-copy" aria-labelledby="signup-intro-title">
            <p className="eyebrow signup-brand">{text.brand}</p>
            <div className="signup-copy__header">
              <h1 id="signup-intro-title">
                {text.introTitle}
                <span>{text.introSubtitle}</span>
              </h1>
              <h2>{text.formTitle}</h2>
              <p className="signup-copy__description">{text.introDescription}</p>
            </div>

            <ul className="signup-list" aria-label="Service highlights">
              {text.introList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="signup-copy__note">{text.introNote}</p>
          </section>

          <section className="signup-form-panel" aria-labelledby="signup-form-title">
            <div className="signup-form-panel__header">
              <p className="eyebrow">{text.formEyebrow}</p>
              <h2 id="signup-form-title">{text.formTitle}</h2>
              <p>{text.formDescription}</p>
            </div>

            <form className="form-stack auth-form signup-form" onSubmit={handleSubmit}>
              <div className="signup-form__alert-area">
                {error ? <div className="auth-message auth-message--error">{error}</div> : null}
              </div>

              <div className="email-check-row">
                <Input
                  label={text.emailLabel}
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  autoComplete="email"
                  placeholder={text.emailPlaceholder}
                  hint={fieldErrors.email || emailCheckMessage || '\u00A0'}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="email-check-button"
                  onClick={handleCheckEmail}
                  disabled={
                    loading ||
                    emailCheckLoading ||
                    !form.email.trim() ||
                    !emailPattern.test(form.email.trim())
                  }
                >
                  {emailCheckLoading ? text.emailCheckLoading : text.emailCheckButton}
                </Button>
              </div>

              <Input
                label={text.passwordLabel}
                type="password"
                value={form.password}
                onChange={updateField('password')}
                autoComplete="new-password"
                placeholder={text.passwordPlaceholder}
                hint={fieldErrors.password || '\u00A0'}
              />
              <Input
                label={text.passwordConfirmLabel}
                type="password"
                value={form.passwordConfirm}
                onChange={updateField('passwordConfirm')}
                autoComplete="new-password"
                placeholder={text.passwordConfirmPlaceholder}
                hint={fieldErrors.passwordConfirm || '\u00A0'}
              />
              <Input
                label={text.nicknameLabel}
                value={form.nickname}
                onChange={updateField('nickname')}
                autoComplete="nickname"
                placeholder={text.nicknamePlaceholder}
                hint={fieldErrors.nickname || '\u00A0'}
              />

              <div className="auth-form__actions signup-actions">
                <Button type="submit" disabled={loading}>
                  {loading ? text.signupButtonLoading : text.signupButton}
                </Button>
              </div>

              <p className="form-footnote auth-form__footer">
                {text.loginLinkPrefix} <Link to="/login">{text.loginLink}</Link>
              </p>
            </form>
          </section>
        </div>
      </Card>
    </div>
  );
};
