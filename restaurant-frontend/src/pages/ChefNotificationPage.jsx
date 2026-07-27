import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  Eye,
  Check,
  ShieldCheck,
  XCircle,
  User
} from 'lucide-react';

export default function ChefNotificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/staff-notifications', { params: { role: 'ROLE_CHEF' } });
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/staff-notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // ── CASE 1: Admin/Manager notification → "Xác Nhận" (confirm receipt to admin)
  const handleConfirmAdminNotif = async (notif) => {
    try {
      await api.put(`/api/staff-notifications/${notif.id}/confirm`, {
        email: user?.email || 'chef@restaurant.com',
        fullName: user?.fullName || 'Bếp Trưởng'
      });
      showToast(`✅ Đã xác nhận thông báo từ ${notif.senderName}. Admin đã được thông báo!`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xác nhận thông báo.');
    }
  };

  // ── CASE 2: Customer NEW order → "Tiếp Nhận Đơn" (accept & PREPARING)
  const handleAcceptOrderNotification = async (notif) => {
    try {
      await api.put(`/api/staff-notifications/${notif.id}/read`);

      const match = (notif.title + ' ' + notif.message).match(/#ORD-(\d+)/i) || (notif.title + ' ' + notif.message).match(/#(\d+)/);
      if (match && match[1]) {
        const orderId = match[1];
        await api.put(`/api/chef/orders/${orderId}/status`, { status: 'PREPARING' });
        showToast(`🎉 Đã tiếp nhận đơn #ORD-${orderId} & chuyển sang PREPARING!`);
      } else {
        showToast('Đã tiếp nhận thông báo Bếp.');
      }

      fetchNotifications();
      setTimeout(() => navigate('/chef/orders'), 900);
    } catch (err) {
      console.error(err);
      fetchNotifications();
      navigate('/chef/orders');
    }
  };

  // ── CASE 3: Customer CANCEL order → "Đã Biết - Dừng Chế Biến" (mark read only)
  const handleAcknowledgeCancel = async (notif) => {
    try {
      await api.put(`/api/staff-notifications/${notif.id}/read`);
      showToast('⛔ Đã ghi nhận hủy đơn. Dừng chế biến ngay!');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Determine notification type ──
  const getNotifType = (n) => {
    const isAdmin = n.senderRole === 'ROLE_ADMIN' || n.senderRole === 'ROLE_MANAGER';
    if (isAdmin) return 'ADMIN';
    const titleUpper = (n.title || '').toUpperCase();
    if (titleUpper.includes('HỦY') || titleUpper.includes('HUY')) return 'CANCEL';
    return 'NEW_ORDER';
  };

  const getNotifStyle = (n) => {
    if (n.isRead || n.isConfirmed) return 'bg-[#FAF7F2] border-gray-200 opacity-70';
    const type = getNotifType(n);
    if (type === 'ADMIN') return 'bg-blue-50/80 border-blue-200 ring-1 ring-blue-300/30';
    if (type === 'CANCEL') return 'bg-red-50/80 border-red-200 ring-1 ring-red-300/30';
    return 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-400/20';
  };

  const getNotifIcon = (n) => {
    const type = getNotifType(n);
    if (type === 'ADMIN') return <ShieldCheck className="w-5 h-5 text-blue-700" />;
    if (type === 'CANCEL') return <XCircle className="w-5 h-5 text-red-700" />;
    return <Flame className="w-5 h-5 text-amber-700" />;
  };

  const getNotifIconBg = (n) => {
    const type = getNotifType(n);
    if (type === 'ADMIN') return 'bg-blue-100 text-blue-800';
    if (type === 'CANCEL') return 'bg-red-100 text-red-800';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[99999] bg-[#3A1C14] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#D97706]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <ChefNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#3A1C14]/10 shadow-md flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block mb-1">
              Kitchen Directives & Alerts
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#3A1C14]">
              Thông Báo Bếp Trưởng
            </h1>
          </div>
          <Bell className="w-8 h-8 text-[#D97706]" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-800">
            <Flame className="w-3.5 h-3.5" /> Đơn mới từ Khách → Tiếp Nhận Đơn
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Khách hủy đơn → Đã Biết / Dừng Chế Biến
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Từ Admin/Manager → Xác Nhận
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl p-6 border border-[#3A1C14]/10 shadow-xl space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              Đang tải thông báo Bếp...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold bg-[#FAF7F2] rounded-2xl border border-gray-200">
              Không có thông báo mới nào dành cho Bếp.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const type = getNotifType(n);
                const isActionDone = type === 'ADMIN' ? n.isConfirmed : n.isRead;

                return (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${getNotifStyle(n)}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${getNotifIconBg(n)}`}>
                        {getNotifIcon(n)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-xs text-[#3A1C14]">{n.title || 'Thông báo Bếp'}</h5>
                          {/* Sender badge */}
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            type === 'ADMIN'
                              ? 'bg-blue-100 text-blue-700'
                              : type === 'CANCEL'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <User className="w-2.5 h-2.5 inline mr-0.5" />
                            {n.senderName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-light leading-relaxed">{n.message}</p>
                        {/* Admin confirm info */}
                        {type === 'ADMIN' && n.isConfirmed && n.confirmedByName && (
                          <p className="text-[10px] text-emerald-700 font-bold">
                            ✅ Đã xác nhận bởi: {n.confirmedByName} lúc {new Date(n.confirmedAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono block">
                          {new Date(n.createdAt || Date.now()).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* "Xem Chi Tiết Nhập Kho" for Stock In notifications */}
                      {(n.title || '').includes('CỘNG VÀO KHO') || (n.title || '').includes('NHẬP KHO') ? (
                        <button
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n.id);
                            navigate('/chef/inventory');
                          }}
                          className="px-3.5 py-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase rounded-xl hover:bg-emerald-100 cursor-pointer flex items-center gap-1 border border-emerald-300 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Xem Chi Tiết Nhập Kho</span>
                        </button>
                      ) : type !== 'ADMIN' && (
                        <button
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n.id);
                            navigate('/chef/orders');
                          }}
                          className="px-3.5 py-2 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase rounded-xl hover:bg-gray-200 cursor-pointer flex items-center gap-1 border border-gray-300"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#3A1C14]" />
                          <span>Xem Chi Tiết</span>
                        </button>
                      )}

                      {/* ── ACTION BUTTON based on type & done state ── */}
                      {isActionDone ? (
                        <span className={`px-3.5 py-1.5 text-[10px] font-bold uppercase rounded-xl flex items-center gap-1 border ${
                          type === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : type === 'CANCEL'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {type === 'ADMIN' ? 'Đã Xác Nhận' : type === 'CANCEL' ? 'Đã Ghi Nhận' : 'Đã Tiếp Nhận'}
                          </span>
                        </span>
                      ) : (
                        <>
                          {/* ADMIN/MANAGER → Xác Nhận */}
                          {type === 'ADMIN' && (
                            <button
                              onClick={() => handleConfirmAdminNotif(n)}
                              className="px-4 py-2 bg-blue-700 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-blue-800 cursor-pointer flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Xác Nhận</span>
                            </button>
                          )}

                          {/* CUSTOMER NEW ORDER → Tiếp Nhận Đơn */}
                          {type === 'NEW_ORDER' && (
                            <button
                              onClick={() => handleAcceptOrderNotification(n)}
                              className="px-4 py-2 bg-[#D97706] text-white text-[11px] font-bold uppercase rounded-xl hover:bg-[#b45d03] cursor-pointer flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Tiếp Nhận Đơn</span>
                            </button>
                          )}

                          {/* CUSTOMER CANCEL ORDER → Đã Biết */}
                          {type === 'CANCEL' && (
                            <button
                              onClick={() => handleAcknowledgeCancel(n)}
                              className="px-4 py-2 bg-red-600 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-red-700 cursor-pointer flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              <span>⛔ Đã Biết - Dừng Chế Biến</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
