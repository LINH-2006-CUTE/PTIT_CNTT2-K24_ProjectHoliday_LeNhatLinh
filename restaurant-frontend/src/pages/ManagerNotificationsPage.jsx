import React, { useState, useEffect } from 'react';
import ManagerNavbar from '../components/ManagerNavbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Send,
  Bell,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  UserCheck,
  ShieldCheck,
  ListChecks,
  Clock,
  RotateCw
} from 'lucide-react';

export default function ManagerNotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ADMIN_ALERTS'); // ADMIN_ALERTS, SEND_BROADCAST, TRACK_RECEIPTS

  const [adminNotifications, setAdminNotifications] = useState([]);
  const [loadingAdminNotifs, setLoadingAdminNotifs] = useState(true);

  // Manager Sent History Tracking
  const [sentHistory, setSentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form states for sending staff notifications
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const fetchAdminNotifications = async () => {
    setLoadingAdminNotifs(true);
    try {
      const res = await api.get('/api/staff-notifications', { params: { role: 'ROLE_MANAGER' } });
      if (res.data && res.data.data) {
        setAdminNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdminNotifs(false);
    }
  };

  const fetchSentHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/api/staff-notifications/manager/history');
      if (res.data && res.data.data) {
        setSentHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
    fetchSentHistory();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmAdminNotification = async (id) => {
    try {
      const res = await api.put(`/api/staff-notifications/${id}/confirm`, {
        email: user?.email || 'manager@restaurant.com',
        fullName: user?.fullName || 'Trần Hoàng Nam (Quản Lý)'
      });
      if (res.data && res.data.success) {
        showToast('Quản lý đã xác nhận đã đọc và hiểu chỉ đạo!');
        fetchAdminNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Vui lòng nhập Tiêu Đề Thông Báo (ví dụ: Khẩn cấp - Chuẩn bị họp giao ca).';
    } else if (title.trim().length < 5) {
      errors.title = 'Tiêu đề thông báo phải từ 5 ký tự trở lên.';
    }

    if (!message.trim()) {
      errors.message = 'Vui lòng nhập Nội Dung Chỉ Đạo Chi Tiết.';
    } else if (message.trim().length < 10) {
      errors.message = 'Nội dung thông báo chỉ đạo phải có ít nhất 10 ký tự.';
    }

    return errors;
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setToastMessage(null);

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const res = await api.post('/api/staff-notifications/send', {
        title: title.trim(),
        message: message.trim(),
        targetRole,
        senderName: user?.fullName || 'Trần Hoàng Nam (Quản Lý)',
        senderRole: 'ROLE_MANAGER'
      });

      if (res.data && res.data.success) {
        showToast(`Phát thông báo tới bộ phận [${targetRole}] thành công!`);
        setTitle('');
        setMessage('');
        setFieldErrors({});
        fetchSentHistory();
        setActiveTab('TRACK_RECEIPTS');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'ALL': return 'Tất Cả Nhân Viên (All Staff)';
      case 'ROLE_MANAGER': return 'Bộ Phận Quản Lý (Managers)';
      case 'ROLE_CHEF': return 'Bộ Phận Bếp (Chefs)';
      case 'ROLE_WAITER': return 'Bộ Phận Phục Vụ (Waiters)';
      case 'ROLE_CASHIER': return 'Bộ Phận Thu Ngân (Cashiers)';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      {/* Toast Success */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#1E2A38] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
              Management Communication Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
              Trung Tâm Thông Báo & Theo Dõi Giao Ca
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('ADMIN_ALERTS');
                fetchAdminNotifications();
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ADMIN_ALERTS'
                  ? 'bg-[#1E2A38] text-white border border-[#C5A059]/50 shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4 text-[#C5A059]" />
              <span>Chỉ Đạo Admin ({adminNotifications.filter(n => !n.isConfirmed).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('SEND_BROADCAST')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'SEND_BROADCAST'
                  ? 'bg-[#1E2A38] text-white border border-[#C5A059]/50 shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Send className="w-4 h-4 text-[#C5A059]" />
              <span>Gửi Thông Báo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('TRACK_RECEIPTS');
                fetchSentHistory();
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'TRACK_RECEIPTS'
                  ? 'bg-[#1E2A38] text-white border border-[#C5A059]/50 shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <ListChecks className="w-4 h-4 text-[#C5A059]" />
              <span>Danh Sách Đã Tiếp Nhận ({sentHistory.filter(n => n.isConfirmed).length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ADMIN ALERTS RECEIVED */}
        {activeTab === 'ADMIN_ALERTS' && (
          <div className="space-y-4">
            {loadingAdminNotifs ? (
              <div className="text-center py-12 text-gray-500 font-bold text-sm">Đang tải chỉ đạo từ Admin...</div>
            ) : adminNotifications.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 shadow-sm text-gray-500 text-sm font-bold">
                Chưa có thông báo chỉ đạo nào từ Admin.
              </div>
            ) : (
              adminNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white p-6 rounded-3xl border shadow-xl space-y-4 transition-all ${
                    !n.isConfirmed ? 'border-[#C5A059] ring-2 ring-[#C5A059]/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#1E2A38] text-[#C5A059]">
                        <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#0F172A] block">{n.senderName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {n.senderRole} • {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                        </span>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      n.isConfirmed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    }`}>
                      {n.isConfirmed ? '✓ ĐÃ XÁC NHẬN ĐÃ ĐỌC' : '⚠️ CHƯA XÁC NHẬN'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold font-serif text-base text-[#0F172A]">{n.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-gray-200">
                      {n.message}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    {n.isConfirmed ? (
                      <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Đã tiếp nhận bởi: <strong className="text-emerald-950">{n.confirmedByName}</strong> ({n.confirmedAt ? new Date(n.confirmedAt).toLocaleTimeString('vi-VN') : ''})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 font-bold">Vui lòng bấm xác nhận sau khi đọc nội dung chỉ đạo từ Admin.</span>
                    )}

                    {!n.isConfirmed && (
                      <button
                        onClick={() => handleConfirmAdminNotification(n.id)}
                        className="px-5 py-2.5 rounded-2xl bg-[#1E2A38] hover:bg-[#0F172A] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-[#C5A059]/40"
                      >
                        <UserCheck className="w-4 h-4 text-[#C5A059]" /> Xác Nhận Đã Đọc & Đã Hiểu
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: SEND STAFF BROADCAST */}
        {activeTab === 'SEND_BROADCAST' && (
          <div className="bg-white p-8 rounded-3xl border border-[#1E2A38]/15 shadow-2xl space-y-6">
            <h3 className="font-bold font-serif text-lg text-[#0F172A] border-b pb-3 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#C5A059]" /> Soạn Thông Báo Chỉ Đạo Nhân Viên
            </h3>

            <form onSubmit={handleSendNotification} noValidate className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Bộ Phận Nhận Thông Báo *</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-gray-200 text-xs font-bold cursor-pointer"
                >
                  <option value="ALL">Tất Cả Nhân Viên Nhà Hàng (All Staff)</option>
                  <option value="ROLE_CHEF">Bộ Phận Bếp (Chefs / Kitchen)</option>
                  <option value="ROLE_WAITER">Bộ Phận Phục Vụ (Waiters / Floor)</option>
                  <option value="ROLE_CASHIER">Bộ Phận Thu Ngân (Cashiers / POS)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Tiêu Đề Thông Báo *</label>
                <input
                  type="text"
                  placeholder="VD: Khẩn cấp - Chuẩn bị họp giao ca 14h00"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.title
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]'
                  }`}
                />
                {fieldErrors.title && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.title}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Nội Dung Chỉ Đạo Chi Tiết *</label>
                <textarea
                  rows="4"
                  placeholder="Nhập chi tiết yêu cầu, nhắc nhở vệ sinh hoặc điều chỉnh ca..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.message
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]'
                  }`}
                />
                {fieldErrors.message && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#1E2A38] text-white text-xs font-bold hover:bg-[#0F172A] transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 border border-[#C5A059]/40"
              >
                <Send className="w-4 h-4 text-[#C5A059]" /> Phát Thông Báo Tức Thì
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: TRACK CONFIRMED STAFF RECEIPTS */}
        {activeTab === 'TRACK_RECEIPTS' && (
          <div className="bg-white p-8 rounded-3xl border border-[#1E2A38]/15 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
              <div>
                <h3 className="font-bold font-serif text-lg text-[#0F172A] flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-[#C5A059]" /> Danh Sách Nhân Viên Đã Tiếp Nhận Thông Báo
                </h3>
                <p className="text-xs text-gray-500 mt-1">Theo dõi thời gian thực nhân viên các bộ phận đã bấm xác nhận tiếp nhận thông báo</p>
              </div>

              <button
                onClick={fetchSentHistory}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-gray-200 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5 text-gray-700"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Tải Lại</span>
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-12 text-gray-500 font-bold text-sm">Đang tải danh sách xác nhận...</div>
            ) : sentHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm font-bold">Chưa phát thông báo nào cho nhân viên.</div>
            ) : (
              <div className="space-y-4">
                {sentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#1E2A38] text-[#C5A059] text-[10px] font-bold uppercase tracking-wider">
                          {formatRoleLabel(item.targetRole)}
                        </span>
                        <h4 className="font-bold text-sm text-[#0F172A]">{item.title}</h4>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      }`}>
                        {item.isConfirmed ? '✓ ĐÃ CÓ NHÂN VIÊN TIẾP NHẬN' : '⚠️ CHỜ XÁC NHẬN'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                      {item.message}
                    </p>

                    <div className="pt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Gửi bởi: <strong className="text-gray-700">{item.senderName}</strong> • {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                      </span>

                      {item.isConfirmed ? (
                        <div className="bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Đã tiếp nhận bởi: <strong className="text-emerald-950">{item.confirmedByName}</strong> ({item.confirmedByEmail}) • {item.confirmedAt ? new Date(item.confirmedAt).toLocaleTimeString('vi-VN') : ''}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700">Chưa có nhân viên nào bấm xác nhận đã đọc.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
