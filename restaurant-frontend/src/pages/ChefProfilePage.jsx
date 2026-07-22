import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChefNavbar from '../components/ChefNavbar';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  CheckCircle2,
  ChefHat,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Camera,
  Upload,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function ChefProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const [email, setEmail] = useState(user?.email || 'chef@restaurant.com');
  const [fullName, setFullName] = useState(user?.fullName || 'Bếp Trưởng Pierre');
  const [phone, setPhone] = useState(user?.phone || '+84 911223344');
  const [gender, setGender] = useState(user?.gender || 'MALE');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80'
  );

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Messages & validation errors
  const [infoMessage, setInfoMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailWarning, setEmailWarning] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Handle avatar upload via file reader
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Dung lượng ảnh đại diện không được vượt quá 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        setInfoMessage('Đã tải ảnh đại diện mới thành công! Vui lòng ấn "Lưu Thông Tin".');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailChangeAttempt = (e) => {
    const newEmailVal = e.target.value;
    setEmail(newEmailVal);
    if (newEmailVal !== (user?.email || 'chef@restaurant.com')) {
      setEmailWarning('Tài khoản nhân viên do Quản trị viên (Admin) khởi tạo. Vui lòng liên hệ Admin để thay đổi Email.');
    } else {
      setEmailWarning(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setInfoMessage(null);
    setErrorMessage(null);

    // Validations
    if (!fullName.trim()) {
      setErrorMessage('Họ và tên không được để trống.');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setErrorMessage('Số điện thoại không hợp lệ.');
      return;
    }

    // Email check for admin-created accounts
    if (email !== (user?.email || 'chef@restaurant.com')) {
      setErrorMessage('Tài khoản nhân viên do Quản trị viên (Admin) khởi tạo. Vui lòng liên hệ Admin để thay đổi Email.');
      setEmail(user?.email || 'chef@restaurant.com');
      setEmailWarning(null);
      return;
    }

    // Save profile updates to local state & Auth context
    const updatedUser = {
      ...user,
      fullName: fullName.trim(),
      phone: phone.trim(),
      gender,
      avatarUrl
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setInfoMessage('Cập nhật thông tin Bếp Trưởng thành công!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!oldPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới.');
      return;
    }

    try {
      const res = await api.post('/api/auth/change-password', {
        oldPassword,
        newPassword
      });
      if (res.data && res.data.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Mật khẩu cũ không chính xác.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">
      <ChefNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Header Badge Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Preview with Upload Trigger */}
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Avatar Bếp Trưởng"
                className="h-20 w-20 rounded-2xl object-cover border-2 border-[#D97706] shadow-lg"
              />
              <label
                htmlFor="avatar-upload-header"
                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Tải ảnh mới"
              >
                <Camera className="w-6 h-6 text-[#D97706]" />
              </label>
              <input
                id="avatar-upload-header"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block mb-0.5">
                Chef Staff Account Profile
              </span>
              <h1 className="text-2xl font-bold font-serif text-[#3A1C14]">{fullName}</h1>
              <span className="text-xs text-gray-500 font-mono">
                ROLE_CHEF (Bếp Trưởng) • {gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : 'Khác'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-2xl bg-[#8C3A27] text-white hover:bg-red-700 transition-all text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4 text-white" /> Đăng Xuất
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Form 1: General Info & Upload */}
          <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-xl space-y-5">
            <h3 className="font-bold font-serif text-lg text-[#3A1C14] flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-[#D97706]" /> Cập Nhật Thông Tin Bếp
            </h3>

            {infoMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {infoMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-800 border border-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {errorMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Feature 2: Email Field with Admin Restriction Warning */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Email Đăng Nhập</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChangeAttempt}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
                  />
                </div>
                {emailWarning && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-start gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{emailWarning}</span>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Họ & Tên Đầu Bếp *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
                  />
                </div>
              </div>

              {/* Feature 3: Gender Field (Nam / Nữ / Khác) */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Giới Tính *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E] cursor-pointer"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Số Điện Thoại *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#7A2E1E] text-white text-xs font-bold hover:bg-[#3A1C14] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#D97706]" /> Lưu Thông Tin Profile
              </button>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-xl space-y-5">
            <h3 className="font-bold font-serif text-lg text-[#3A1C14] flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="w-5 h-5 text-[#D97706]" /> Đổi Mật Khẩu Khai Thác Bếp
            </h3>

            {passwordSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-800 border border-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Mật Khẩu Hiện Tại *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Mật Khẩu Mới (Tối thiểu 6 ký tự) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Xác Nhận Mật Khẩu Mới *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#3A1C14] text-white text-xs font-bold hover:bg-[#7A2E1E] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#D97706]" /> Cập Nhật Mật Khẩu
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
