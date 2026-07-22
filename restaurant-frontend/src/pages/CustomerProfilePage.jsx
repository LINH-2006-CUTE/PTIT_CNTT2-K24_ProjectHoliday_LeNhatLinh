import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import { User, Crown, Lock, ShieldCheck, MapPin, Phone, LogOut, Receipt, Sparkles, ChefHat } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'vip', 'points_history', 'orders'

  // Profile Form Fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '12 Tràng Tiền, Hoàn Kiếm, Hà Nội');
  const [avatar, setAvatar] = useState(user?.avatar || user?.avatarUrl || '');
  
  // Password Form Fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Membership & Points State
  const [membershipData, setMembershipData] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(false);

  // Form States & Toasts
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const fetchMembershipInfo = async () => {
    setLoadingMembership(true);
    try {
      const res = await api.get('/api/customer/membership-info', {
        params: { email: user?.email }
      });
      if (res.data && res.data.success) {
        setMembershipData(res.data.data);
        if (res.data.data.avatar) {
          setAvatar(res.data.data.avatar);
          if (updateUser) {
            updateUser({ avatar: res.data.data.avatar, avatarUrl: res.data.data.avatar });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembership(false);
    }
  };

  useEffect(() => {
    fetchMembershipInfo();
  }, [user?.email]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    if (!fullName.trim()) return setProfileMsg({ text: 'Họ và tên không được để trống.', type: 'error' });
    if (!phone.trim()) return setProfileMsg({ text: 'Số điện thoại không được để trống.', type: 'error' });

    setProfileLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() ? address.trim() : null,
        avatar: avatar.trim() ? avatar.trim() : null
      };

      const res = await api.put('/api/customer/profile', payload);
      if (res.data && res.data.success) {
        if (updateUser) {
          updateUser({
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            avatar: avatar.trim() ? avatar.trim() : null,
            avatarUrl: avatar.trim() ? avatar.trim() : null,
          });
        }
        setProfileMsg({ text: 'Cập nhật thông tin cá nhân thành công!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setProfileMsg({ text: err.response?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (!oldPassword) return setPasswordMsg({ text: 'Vui lòng nhập mật khẩu hiện tại.', type: 'error' });
    if (!newPassword || newPassword.length < 6) return setPasswordMsg({ text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.', type: 'error' });
    if (newPassword !== confirmPassword) return setPasswordMsg({ text: 'Xác nhận mật khẩu mới không trùng khớp.', type: 'error' });

    setPasswordLoading(true);
    try {
      const payload = {
        oldPassword,
        newPassword,
        confirmPassword
      };

      const res = await api.put('/api/customer/profile/change-password', payload);
      if (res.data && res.data.success) {
        setPasswordMsg({ text: 'Đổi mật khẩu bảo mật thành công!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setPasswordMsg({ text: err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Rank Styling Helper
  const getRankBadgeStyle = (rank = 'BRONZE') => {
    switch (rank.toUpperCase()) {
      case 'DIAMOND': return 'from-cyan-600 via-blue-700 to-indigo-900 text-white border-cyan-300';
      case 'PLATINUM': return 'from-slate-700 via-slate-800 to-slate-900 text-slate-100 border-slate-400';
      case 'GOLD': return 'from-amber-500 via-yellow-600 to-amber-700 text-amber-100 border-amber-300';
      case 'SILVER': return 'from-gray-400 via-slate-500 to-gray-600 text-gray-100 border-gray-300';
      default: return 'from-[#8C3A27] via-[#63291B] to-[#4A2810] text-[#FAF7F2] border-[#E07A5F]/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans">
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Profile Header */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2810]/10 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt={user?.fullName}
                className="h-20 w-20 rounded-full object-cover border-4 border-[#8C3A27] shadow-md bg-gray-100"
              />
              <span className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white" title="Trực tuyến" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#4A2810]">{user?.fullName || 'Khách Hàng L\'Étoile'}</h2>
              <p className="text-xs text-gray-500 font-mono">{user?.email}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[#FAF7F2] border border-[#8C3A27]/20 text-[#8C3A27] px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#E07A5F]" />
                  Hạng {membershipData ? membershipData.rank : 'BRONZE'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {membershipData ? membershipData.points : 0} điểm
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" /> Đăng Xuất
          </button>
        </div>

        {/* Tab Selection */}
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-2 mb-8">
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#8C3A27] text-white shadow-md' : 'bg-white text-[#4A2810] border border-gray-200'
            }`}
          >
            <User className="w-4 h-4" /> Hồ Sơ Cá Nhân
          </button>

          <button
            onClick={() => setActiveTab('vip')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vip' ? 'bg-[#8C3A27] text-white shadow-md' : 'bg-white text-[#4A2810] border border-gray-200'
            }`}
          >
            <Crown className="w-4 h-4" /> Thẻ VIP & Mốc Hạng
          </button>

          <button
            onClick={() => setActiveTab('points_history')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'points_history' ? 'bg-[#8C3A27] text-white shadow-md' : 'bg-white text-[#4A2810] border border-gray-200'
            }`}
          >
            <Receipt className="w-4 h-4" /> Lịch Sử Tích & Đổi Điểm
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'password' ? 'bg-[#8C3A27] text-white shadow-md' : 'bg-white text-[#4A2810] border border-gray-200'
            }`}
          >
            <Lock className="w-4 h-4" /> Bảo Mật & Mật Khẩu
          </button>

        </div>

        {/* TAB 1: UPDATE PROFILE (With disabled Email & Role) */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-[#4A2810]/10 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold font-serif text-[#4A2810] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-[#8C3A27]" /> Cập Nhật Thông Tin Cá Nhân
            </h3>

            {profileMsg.text && (
              <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold border ${
                profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              {/* STRICTLY DISABLED FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#4A2810]/10">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Email (Không thể sửa) 🔒
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="form-input text-xs py-2 bg-gray-100 text-gray-500 font-mono cursor-not-allowed border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" /> Vai trò Role (Không thể sửa) 🔒
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.roles ? user.roles.join(', ') : 'ROLE_CUSTOMER'}
                    className="form-input text-xs py-2 bg-gray-100 text-gray-500 font-mono cursor-not-allowed border-gray-200 uppercase font-bold"
                  />
                </div>
              </div>

              {/* EDITABLE FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input text-xs py-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Địa chỉ nhận hàng / Liên hệ</label>
                <input
                  type="text"
                  placeholder="Nhập địa chỉ của bạn..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input text-xs py-2.5"
                />
              </div>

              {/* INTERACTIVE AVATAR SECTION */}
              <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#4A2810]/10 space-y-4">
                <label className="block text-xs font-bold text-[#4A2810] uppercase tracking-wider">
                  🖼️ Thay Đổi Ảnh Đại Diện (Avatar)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                      alt="Avatar Preview"
                      className="h-24 w-24 rounded-full object-cover border-4 border-[#8C3A27] shadow-lg bg-white"
                    />
                    <span className="text-[10px] font-bold uppercase bg-[#8C3A27] text-white px-2 py-0.5 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 shadow-xs">
                      Xem Trước
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cách 1: Chọn từ bộ sưu tập Avatar có sẵn</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
                          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
                        ].map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAvatar(imgUrl)}
                            className={`h-10 w-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                              avatar === imgUrl ? 'border-[#8C3A27] ring-2 ring-[#8C3A27]/40 scale-105' : 'border-gray-200'
                            }`}
                          >
                            <img src={imgUrl} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cách 2: Chọn tập tin ảnh từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAvatar(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#8C3A27] file:text-white hover:file:bg-[#A3432D] cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cách 3: Hoặc dán liên kết đường dẫn ảnh (URL)</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="form-input text-xs py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#8C3A27] text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A3432D] transition-all cursor-pointer"
                >
                  {profileLoading ? 'Đang Lưu...' : 'Lưu Thay Đổi Hồ Sơ'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: VIP MEMBERSHIP CARD (5 Tiers: BRONZE -> DIAMOND) */}
        {activeTab === 'vip' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            
            {/* VIP Card Component */}
            <div className={`p-8 rounded-3xl bg-gradient-to-br ${getRankBadgeStyle(membershipData?.rank)} shadow-2xl border-2 relative overflow-hidden text-left space-y-6`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block mb-1">L'ÉCLAT Fine Dining VIP Card</span>
                  <h3 className="text-2xl font-bold font-serif tracking-wide">{user?.fullName || 'KHÁCH HÀNG VIP'}</h3>
                </div>
                <Crown className="w-10 h-10 text-amber-300 animate-pulse" />
              </div>

              <div className="font-mono text-sm tracking-widest text-white/90">
                MÃ THẺ: LETOILE-888-{(user?.email || '000').substring(0, 4).toUpperCase()}
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-white/20">
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/70 block">Tổng Điểm Tích Lũy</span>
                  <span className="text-2xl font-bold font-mono text-amber-300">{membershipData ? membershipData.points : 0} PTS</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">Hạng Thẻ Hiện Tại</span>
                  <span className="text-sm font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-xs">
                    {membershipData ? membershipData.rank : 'BRONZE'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Rank Tier Progression Details */}
            <div className="bg-white rounded-3xl p-7 border border-[#4A2810]/10 shadow-xl space-y-4">
              <h4 className="text-base font-bold font-serif text-[#4A2810]">🌟 5 Hạng Thẻ Thành Viên VIP L'ÉCLAT</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className={`p-3 rounded-2xl border ${membershipData?.rank === 'BRONZE' ? 'bg-amber-900 text-white font-bold border-amber-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="font-bold">BRONZE</div>
                  <div className="text-[10px] mt-1">0 - 99 PTS</div>
                </div>
                <div className={`p-3 rounded-2xl border ${membershipData?.rank === 'SILVER' ? 'bg-slate-700 text-white font-bold border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="font-bold">SILVER</div>
                  <div className="text-[10px] mt-1">100 - 499 PTS</div>
                </div>
                <div className={`p-3 rounded-2xl border ${membershipData?.rank === 'GOLD' ? 'bg-amber-500 text-white font-bold border-amber-400' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="font-bold">GOLD</div>
                  <div className="text-[10px] mt-1">500 - 999 PTS</div>
                </div>
                <div className={`p-3 rounded-2xl border ${membershipData?.rank === 'PLATINUM' ? 'bg-slate-900 text-white font-bold border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="font-bold">PLATINUM</div>
                  <div className="text-[10px] mt-1">1000 - 2499 PTS</div>
                </div>
                <div className={`p-3 rounded-2xl border ${membershipData?.rank === 'DIAMOND' ? 'bg-cyan-700 text-white font-bold border-cyan-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="font-bold">DIAMOND</div>
                  <div className="text-[10px] mt-1">2500+ PTS</div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: POINT TRANSACTION HISTORY */}
        {activeTab === 'points_history' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Earned History */}
              <div className="bg-white rounded-3xl p-6 border border-[#4A2810]/10 shadow-lg space-y-4">
                <h4 className="font-bold font-serif text-sm text-emerald-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span>📈</span> Lịch Sử Tích Điểm (+PTS)
                </h4>

                {membershipData && membershipData.earnedHistory && membershipData.earnedHistory.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {membershipData.earnedHistory.map((item) => (
                      <div key={item.id} className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-emerald-900">{item.description}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                        </div>
                        <span className="font-bold font-mono text-emerald-700 text-sm">+{item.pointsAmount} PTS</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-gray-400 font-semibold">Chưa có lịch sử tích điểm nào.</div>
                )}
              </div>

              {/* Redeemed History */}
              <div className="bg-white rounded-3xl p-6 border border-[#4A2810]/10 shadow-lg space-y-4">
                <h4 className="font-bold font-serif text-sm text-[#8C3A27] flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span>📉</span> Lịch Sử Đổi Điểm (-PTS)
                </h4>

                {membershipData && membershipData.redeemedHistory && membershipData.redeemedHistory.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {membershipData.redeemedHistory.map((item) => (
                      <div key={item.id} className="p-3 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-red-900">{item.description}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{new Date(item.createdAt).toLocaleString('vi-VN')}</div>
                        </div>
                        <span className="font-bold font-mono text-red-700 text-sm">-{item.pointsAmount} PTS</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-gray-400 font-semibold">Chưa có lịch sử đổi điểm nào.</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-[#4A2810]/10 shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold font-serif text-[#4A2810] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="w-5 h-5 text-[#8C3A27]" /> Đổi Mật Khẩu Bảo Mật
            </h3>

            {passwordMsg.text && (
              <div className={`mb-6 p-4 rounded-2xl text-xs font-semibold border ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu hiện tại..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input text-xs py-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mật khẩu mới (Tối thiểu 6 ký tự) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input text-xs py-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input text-xs py-2.5 font-mono"
                />
              </div>

              <div className="pt-3 text-right">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#8C3A27] text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A3432D] transition-all cursor-pointer"
                >
                  {passwordLoading ? 'Đang Đổi Mật Khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      <CustomerFooter />
    </div>
  );
}
