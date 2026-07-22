import React, { useState } from 'react';
import api from '../services/api';
import WaiterNavbar from '../components/WaiterNavbar';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function WaiterProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || 'Lê Nhật Linh');
  const [phone, setPhone] = useState(user?.phone || '0988776655');

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/customer/profile', {
        email: user?.email,
        fullName,
        phone
      });
      if (res.data && res.data.success) {
        showToast('Cập nhật thông tin thành công!');
      }
    } catch (err) {
      console.error(err);
      showToast('Cập nhật thất bại.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu mới không khớp!');
      return;
    }
    try {
      const res = await api.post('/api/auth/change-password', {
        oldPassword,
        newPassword
      });
      if (res.data && res.data.success) {
        showToast('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222E21] font-sans">
      <WaiterNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#3B4A39] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#708238]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <span>✨ {toastMessage}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md">
          <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
            Staff Security & Account Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
            Hồ Sơ Nhân Viên Phục Vụ
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Update Profile Form */}
          <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/15 shadow-xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#222E21] border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-[#708238]" /> Thông Tin Cá Nhân
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Họ & Tên *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1">Email Hệ Thống (Không được sửa)</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'waiter@restaurant.com'}
                    className="form-input py-2.5 w-full bg-gray-100 text-gray-500 cursor-not-allowed pr-8"
                  />
                  <ShieldCheck className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#3B4A39] text-white font-bold uppercase tracking-wider hover:bg-[#222E21] transition-all cursor-pointer shadow-md"
              >
                Cập Nhật Hồ Sơ
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/15 shadow-xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#222E21] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#708238]" /> Đổi Mật Khẩu
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Mật Khẩu Hiện Tại *</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Mật Khẩu Mới *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Xác Nhận Mật Khẩu Mới *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input py-2.5 w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#708238] text-white font-bold uppercase tracking-wider hover:bg-[#5a6a2d] transition-all cursor-pointer shadow-md"
              >
                Cập Nhật Mật Khẩu
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
