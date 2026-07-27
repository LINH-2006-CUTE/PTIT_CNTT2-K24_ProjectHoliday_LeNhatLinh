import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BrandMark = () => <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-10 w-10 rounded-full object-cover border border-[#C5A059] shadow-md shrink-0" />;
const EyeIcon = ({ visible }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{visible ? <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></> : <><path d="m3 3 18 18" /><path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.8M6.1 6.1A17.4 17.4 0 0 0 2.5 12s3.4 6 9.5 6c1.4 0 2.6-.3 3.7-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}</svg>;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (nextEmail = email, nextPassword = password) => {
    const errors = {};
    if (!nextEmail.trim()) errors.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail.trim())) errors.email = 'Email chưa đúng định dạng.';
    if (!nextPassword) errors.password = 'Vui lòng nhập mật khẩu.';
    return errors;
  };

  const updateEmail = (event) => { const value = event.target.value; setEmail(value); setFieldErrors(validate(value, password)); setError(''); };
  const updatePassword = (event) => { const value = event.target.value; setPassword(value); setFieldErrors(validate(email, value)); setError(''); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setError(''); setSubmitting(true);
    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      const userRoles = loggedUser?.roles || [];
      if (
        userRoles.includes('ROLE_ADMIN') ||
        userRoles.includes('ROLE_CASHIER') ||
        userRoles.includes('ROLE_CHEF') ||
        userRoles.includes('ROLE_WAITER') ||
        userRoles.includes('ROLE_STAFF')
      ) {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) { setError(err.response?.data?.message || err.message || 'Email hoặc mật khẩu chưa chính xác. Vui lòng thử lại.'); }
    finally { setSubmitting(false); }
  };

  return <main className="auth-page">
    <section className="auth-showcase" aria-label="L'ÉCLAT Restaurant"><div className="auth-showcase__top"><BrandMark /><span>L'ÉCLAT</span></div><div className="auth-showcase__content"><p className="eyebrow">Restaurant management</p><h1>Vận hành tinh tế,<br /><em>phục vụ trọn vẹn.</em></h1><p className="showcase-copy">Một không gian làm việc đơn giản để đội ngũ của bạn tập trung vào những trải nghiệm đáng nhớ.</p><div className="showcase-line" /><p className="showcase-note">Bảo mật · Đồng bộ tức thì · Hỗ trợ tận tâm</p></div><p className="auth-showcase__footer">© 2026 L'ÉCLAT Restaurant</p></section>
    <section className="auth-panel"><div className="auth-mobile-brand"><BrandMark /><span>L'ÉCLAT</span></div><div className="auth-card"><div className="auth-card__heading"><p className="eyebrow">Chào mừng trở lại</p><h2>Đăng nhập</h2><p>Nhập thông tin của bạn để tiếp tục.</p></div>{error && <div className="auth-alert" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form" noValidate><label htmlFor="email">Email<input id="email" type="email" autoComplete="email" placeholder="username@gmail.com" maxLength="100" value={email} onChange={updateEmail} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} required />{fieldErrors.email && <span className="auth-field-error" id="email-error">{fieldErrors.email}</span>}</label><label htmlFor="password">Mật khẩu<span className="password-field"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="your password" maxLength="72" value={password} onChange={updatePassword} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : undefined} required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}><EyeIcon visible={showPassword} /></button></span>{fieldErrors.password && <span className="auth-field-error" id="password-error">{fieldErrors.password}</span>}</label><div className="auth-form__utility"><span /><Link to="/forgot-password">Quên mật khẩu?</Link></div><button type="submit" className="auth-submit" disabled={submitting}>{submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}<span aria-hidden="true">→</span></button></form><p className="auth-switch">Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link></p></div></section>
  </main>;
}
