import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BrandMark = () => <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-10 w-10 rounded-full object-cover border border-[#C5A059] shadow-md shrink-0" />;

const EyeIcon = ({ visible }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{visible ? <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></> : <><path d="m3 3 18 18" /><path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6.1 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.1 3.8M6.1 6.1A17.4 17.4 0 0 0 2.5 12s3.4 6 9.5 6c1.4 0 2.6-.3 3.7-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}</svg>;

const validate = ({ fullName, email, phone, password, confirmPassword }) => {
  const errors = {};
  if (!/^[\p{L}][\p{L}\s'.-]{1,99}$/u.test((fullName || '').trim())) errors.fullName = 'Nhập họ tên từ 2–100 ký tự, không chứa số hoặc ký tự lạ.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())) errors.email = 'Nhập địa chỉ email hợp lệ.';
  const normalizedPhone = (phone || '').replace(/[\s.-]/g, '');
  if (!normalizedPhone) {
    errors.phone = 'Vui lòng nhập số điện thoại.';
  } else if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
    errors.phone = 'Số điện thoại không hợp lệ (Phải gồm 10 chữ số đầu 03, 05, 07, 08, 09 hoặc +84).';
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(password || '')) errors.password = 'Dùng 8–72 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
  if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.';
  return errors;
};

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    setErrors(validate(nextForm));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    setSubmitting(true);
    setError('');
    try {
      await register(form.email.trim().toLowerCase(), form.password, form.fullName.trim(), form.phone.replace(/[\s.-]/g, ''));
      setSuccess('Tạo tài khoản thành công. Đang chuyển đến trang đăng nhập…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally { setSubmitting(false); }
  };

  const fieldError = (name) => errors[name] && <span className="auth-field-error" id={`${name}-error`}>{errors[name]}</span>;
  const inputProps = (name) => ({ name, value: form[name], onChange: updateField, 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `${name}-error` : undefined });

  return <main className="auth-page auth-page--register">
    <section className="auth-showcase" aria-label="L'ÉCLAT Restaurant"><div className="auth-showcase__top"><BrandMark /><span>L'ÉCLAT</span></div><div className="auth-showcase__content"><p className="eyebrow">Cùng tạo nên khác biệt</p><h1>Bắt đầu hành trình<br /><em>của bạn.</em></h1><p className="showcase-copy">Tạo tài khoản để kết nối với quy trình vận hành nhà hàng được thiết kế gọn gàng và hiệu quả.</p><div className="showcase-line" /><p className="showcase-note">Bảo mật · Dễ sử dụng · Luôn đồng hành</p></div><p className="auth-showcase__footer">© 2026 L'ÉCLAT Restaurant</p></section>
    <section className="auth-panel"><div className="auth-mobile-brand"><BrandMark /><span>L'ÉCLAT</span></div><div className="auth-card auth-card--register"><div className="auth-card__heading"><p className="eyebrow">Tham gia cùng chúng tôi</p><h2>Tạo tài khoản</h2><p>Chỉ vài thông tin để bắt đầu trải nghiệm.</p></div>{error && <div className="auth-alert" role="alert">{error}</div>}{success && <div className="auth-alert auth-alert--success" role="status">{success}</div>}
      <form onSubmit={handleSubmit} className="auth-form" noValidate><div className="auth-form__grid"><label htmlFor="fullName"><span>Họ và tên <b>*</b></span><input id="fullName" autoComplete="name" placeholder="Nguyễn Văn An" maxLength="100" required {...inputProps('fullName')} />{fieldError('fullName')}</label><label htmlFor="phone"><span>Số điện thoại <b>*</b></span><input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="090 123 4567" maxLength="20" required {...inputProps('phone')} />{fieldError('phone')}</label></div><label htmlFor="email"><span>Email <b>*</b></span><input id="email" type="email" autoComplete="email" placeholder="tenban@nhahang.com" maxLength="100" required {...inputProps('email')} />{fieldError('email')}</label><div className="auth-form__grid"><label htmlFor="password"><span>Mật khẩu <b>*</b></span><span className="password-field"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength="8" maxLength="72" placeholder="Tạo mật khẩu an toàn" required {...inputProps('password')} /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}><EyeIcon visible={showPassword} /></button></span>{fieldError('password')}</label><label htmlFor="confirmPassword"><span>Xác nhận mật khẩu <b>*</b></span><input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength="8" maxLength="72" placeholder="Nhập lại mật khẩu" required {...inputProps('confirmPassword')} />{fieldError('confirmPassword')}</label></div><button type="submit" className="auth-submit" disabled={submitting}>{submitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}<span aria-hidden="true">→</span></button></form><p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></div></section>
  </main>;
}
