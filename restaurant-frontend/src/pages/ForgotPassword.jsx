import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & mật khẩu mới
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess('Mã OTP xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Không thể gửi mã OTP. Vui lòng kiểm tra lại địa chỉ email và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(newPassword)) {
      setError('Mật khẩu cần 8–72 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', {
        email,
        otpCode,
        newPassword,
      });
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã OTP và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">

      {/* Bảng thương hiệu bên trái */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#4A121A] text-white flex-col justify-between p-12 overflow-hidden">

        {/* Hiệu ứng nền */}
        <div className="absolute inset-0 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#C5A059]/40 to-transparent blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C5A059] text-white shadow-md">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-wider text-[#FAF7F2] font-sans">L'ÉCLAT Restaurant</span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <span className="text-[#C5A059] text-sm font-semibold tracking-widest uppercase block mb-4">Bảo mật tài khoản</span>
          <h1 className="text-5xl font-bold tracking-tight text-[#FAF7F2] font-serif leading-tight mb-6">
            Khôi phục<br/>Quyền truy cập
          </h1>
          <p className="text-lg text-[#FAF7F2]/80 font-light leading-relaxed">
            "Quên mật khẩu? Quá trình khôi phục hoàn toàn tự động. Yêu cầu mã OTP 6 chữ số bảo mật, xác minh từ hộp thư của bạn và đặt mật khẩu mới."
          </p>

          <div className="mt-8 border-l-2 border-[#C5A059] pl-6 text-[#FAF7F2]/70 text-xs italic space-y-2">
            <p>Lưu ý: Mã OTP có hiệu lực trong 5 phút.</p>
            <p>Nếu không nhận được email, vui lòng kiểm tra thư mục Spam hoặc liên hệ quản trị viên.</p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#FAF7F2]/40">
          <span>© 2026 L'ÉCLAT Restaurant. Mọi quyền được bảo lưu.</span>
        </div>
      </div>

      {/* Bảng form bên phải */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 auth-bg-pattern">

        <div className="w-full max-w-md rounded-2xl bg-white p-8 md:p-10 shadow-xl border border-[#E8E2D9] transition-all hover:shadow-2xl premium-glow">

          <div className="lg:hidden text-center mb-6">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C5A059] text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#4A121A] font-serif">L'ÉCLAT Restaurant</h2>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-[#4A121A] font-serif">Quên mật khẩu</h2>
            <p className="mt-2 text-sm text-gray-500">
              {step === 1
                ? 'Nhập địa chỉ email đã đăng ký để nhận mã OTP'
                : 'Nhập mã OTP và mật khẩu mới của bạn'}
            </p>
          </div>

          {/* Chỉ báo bước */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-[#C5A059]' : 'bg-gray-200'}`}></div>
            <div className={`h-2 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[#C5A059]' : 'bg-gray-200'}`}></div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex items-start gap-2.5">
              <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-100 flex items-start gap-2.5">
              <svg className="h-5 w-5 shrink-0 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1" htmlFor="email">
                  Địa chỉ Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="vd: nguoidung@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 mt-2 flex justify-center text-sm font-semibold tracking-wider uppercase"
              >
                {loading ? 'Đang gửi mã OTP...' : 'Gửi mã xác minh OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-xl bg-[#FAF7F2] p-3.5 text-xs text-[#6E6564] border border-[#E8E2D9] mb-2 flex justify-between items-center">
                <span>Khôi phục tài khoản:</span>
                <strong className="text-gray-800">{email}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1" htmlFor="otp">
                  Mã OTP xác minh (6 chữ số) *
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000 000"
                  value={otpCode}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input text-center font-mono tracking-widest text-lg font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1" htmlFor="newPassword">
                  Mật khẩu mới *
                </label>
                <input
                  id="newPassword"
                  type="password"
                  minLength="8"
                  maxLength="72"
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}"
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">Gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1" htmlFor="confirmPassword">
                  Xác nhận mật khẩu mới *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-accent py-3.5 mt-2 flex justify-center text-sm font-semibold tracking-wider uppercase text-white"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors mt-2 uppercase tracking-wider"
              >
                ← Quay lại nhập email
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm">
            <Link
              to="/login"
              className="font-bold text-[#4A121A] hover:text-[#C5A059] transition-colors decoration-wavy underline-offset-4 hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
