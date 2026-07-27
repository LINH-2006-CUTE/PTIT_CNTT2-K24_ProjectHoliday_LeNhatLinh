import React, { useState, useEffect } from 'react';
import WaiterNavbar from '../components/WaiterNavbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Bell,
  CheckCircle2,
  UserCheck,
  Megaphone
} from 'lucide-react';

export default function WaiterNotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/staff-notifications', { params: { role: 'ROLE_WAITER' } });
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmNotification = async (id) => {
    try {
      const res = await api.put(`/api/staff-notifications/${id}/confirm`, {
        email: user?.email || 'waiter@restaurant.com',
        fullName: user?.fullName || 'Lê Nhật Linh (Phục Vụ)'
      });

      if (res.data && res.data.success) {
        showToast('Nhân viên phục vụ đã xác nhận đã đọc và hiểu chỉ đạo!');
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222E21] font-sans">
      <WaiterNavbar />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#222E21] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#708238]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#708238]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
              Floor Service Alert Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
              Thông Báo Chỉ Đạo Dành Cho Nhân Viên Phục Vụ
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F2] px-4 py-2 rounded-2xl border border-gray-200 text-xs font-bold text-[#222E21]">
            <Bell className="w-4 h-4 text-[#708238]" />
            <span>{notifications.filter(n => !n.isConfirmed).length} Thông báo chưa đọc</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-bold text-sm">Đang tải thông báo phục vụ...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 shadow-sm text-gray-500 text-sm font-bold">
            Không có thông báo chỉ đạo nào từ Quản lý.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white p-6 rounded-3xl border shadow-xl space-y-4 transition-all ${
                  !n.isConfirmed ? 'border-[#708238] ring-2 ring-[#708238]/20' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#222E21] text-[#708238]">
                      <Megaphone className="w-4 h-4 text-[#708238]" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#222E21] block">{n.senderName}</span>
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
                  <h3 className="font-bold font-serif text-base text-[#222E21]">{n.title}</h3>
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
                    <span className="text-xs text-amber-700 font-bold">Vui lòng bấm xác nhận sau khi đọc nội dung chỉ đạo.</span>
                  )}

                  {!n.isConfirmed && (
                    <button
                      onClick={() => handleConfirmNotification(n.id)}
                      className="px-5 py-2.5 rounded-2xl bg-[#222E21] hover:bg-[#3B4A39] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-[#708238]/40"
                    >
                      <UserCheck className="w-4 h-4 text-[#708238]" /> Xác Nhận ĐÃ ĐỌC & ĐÃ HIỂU
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
