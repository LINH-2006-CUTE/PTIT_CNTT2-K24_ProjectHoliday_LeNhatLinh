import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user || !user.email) return;
    setLoading(true);
    try {
      const res = await api.get('/api/customer/notifications', {
        params: { email: user.email }
      });
      if (res.data && res.data.success) {
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
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/customer/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !user.email) return;
    try {
      await api.put('/api/customer/notifications/read-all', null, {
        params: { email: user.email }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/customer/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-[#4A2810] border border-[#E07A5F]/30 text-white hover:border-[#E07A5F] transition-all cursor-pointer flex items-center justify-center"
        title="Thông báo"
      >
        <Bell className="w-4 h-4 text-[#FAF7F2]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl border border-[#E07A5F]/30 shadow-2xl z-[999] overflow-hidden animate-fade-in text-[#2B2625]">
          
          {/* Header */}
          <div className="p-4 bg-[#4A2810] text-[#FAF7F2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <h4 className="font-bold text-xs uppercase tracking-wider font-serif">Thông Báo Của Bạn</h4>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-[#E07A5F] font-bold hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 font-semibold">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 font-semibold space-y-1">
                <span className="text-2xl block">🔕</span>
                <p>Không có thông báo mới nào.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex gap-3 items-start transition-colors relative ${
                    !n.isRead ? 'bg-[#FAF7F2]' : 'bg-white'
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">
                    {n.type === 'RESERVATION' ? '📅' :
                     n.type === 'ORDER_CONFIRMED' ? '✅' :
                     n.type === 'ORDER_COOKING' ? '👨‍🍳' :
                     n.type === 'ORDER_COMPLETED' ? '🎉' : '🎟️'}
                  </span>

                  <div className="flex-1 text-xs space-y-0.5">
                    <div className="flex justify-between items-start">
                      <h5 className={`font-bold font-serif ${!n.isRead ? 'text-[#8C3A27]' : 'text-[#4A2810]'}`}>
                        {n.title}
                      </h5>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">{n.message}</p>

                    <div className="flex gap-3 pt-1 text-[10px]">
                      {!n.isRead && (
                        <button onClick={() => handleMarkAsRead(n.id)} className="text-emerald-700 font-bold hover:underline">
                          Đã đọc
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="text-red-600 font-bold hover:underline">
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
            <button onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Đóng
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
