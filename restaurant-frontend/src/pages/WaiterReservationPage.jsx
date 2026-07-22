import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WaiterNavbar from '../components/WaiterNavbar';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  LogOut,
  Clock,
  User,
  Phone,
  Users,
  Utensils
} from 'lucide-react';

export default function WaiterReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/public/reservations');
      if (res.data && res.data.success) {
        setReservations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (resId, tableName) => {
    try {
      const res = await api.put(`/api/public/reservations/${resId}/status`, null, {
        params: { status: 'COMPLETED' }
      });
      if (res.data && res.data.success) {
        showToast(`Đã Check-in khách vào bàn ${tableName || 'sảnh'} thành công!`);
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể Check-in.');
    }
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt bàn này?')) return;
    try {
      const res = await api.put(`/api/public/reservations/${resId}/status`, null, {
        params: { status: 'CANCELLED' }
      });
      if (res.data && res.data.success) {
        showToast('Đã hủy đặt bàn thành công.');
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
      showToast('Hủy đặt bàn thất bại.');
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md">
          <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
            L'ÉCLAT Reception & Reception Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
            Tiếp Nhận Đặt Bàn & Check-in Khách
          </h1>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải danh sách đặt bàn...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-6 border border-[#3B4A39]/15 shadow-xl space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono font-bold text-sm text-[#8C3A27]">#RES-{r.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      r.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#222E21] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#708238]" /> {r.customerName}
                  </h4>

                  <div className="space-y-1 text-xs text-gray-500 font-medium mt-2">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#708238]" /> SĐT: {r.customerPhone || 'Chưa cung cấp'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#708238]" /> Giờ hẹn: {new Date(r.reservationTime).toLocaleString('vi-VN')}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#708238]" /> Số lượng: {r.numberOfPeople} khách
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-[#3B4A39]">
                      <Utensils className="w-3.5 h-3.5 text-[#708238]" /> Bàn xếp: {r.tableName || 'Sảnh chờ'}
                    </p>
                  </div>
                </div>

                {/* Check-in & Actions */}
                <div className="pt-3 border-t border-gray-100 flex gap-2">
                  {r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCheckIn(r.id, r.tableName)}
                      className="flex-1 py-2 rounded-xl bg-[#3B4A39] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#222E21] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#708238]" /> Check-in Khách
                    </button>
                  )}

                  {r.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancelReservation(r.id)}
                      className="py-2 px-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
                      title="Hủy đặt bàn"
                    >
                      <XCircle className="w-4 h-4" />
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
