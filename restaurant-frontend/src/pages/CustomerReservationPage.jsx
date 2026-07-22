import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function CustomerReservationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('book'); // 'book', 'history'

  // Form Fields
  const [branch, setBranch] = useState("L'ÉCLAT Tràng Tiền - Hà Nội");
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('18:30');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // History & Reschedule States
  const [historySearch, setHistorySearch] = useState(user?.phone || user?.email || '');
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedReschedule, setSelectedReschedule] = useState(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('19:00');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const branches = [
    "L'ÉCLAT Tràng Tiền - Hà Nội",
    "L'ÉCLAT Đồng Khởi - TP. Hồ Chí Minh",
    "L'ÉCLAT Bãi Cháy - Quảng Ninh"
  ];

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/api/public/reservations/history', {
        params: { search: historySearch.trim() }
      });
      if (res.data && res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.phone || user.email)) {
      fetchHistory();
    }
  }, [user]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || !customerPhone.trim() || !date || !time) {
      return setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
    }

    setLoading(true);
    try {
      const payload = {
        branch,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() ? customerEmail.trim() : null,
        numberOfPeople: Number(numberOfPeople),
        reservationTime: `${date}T${time}:00`,
        notes: notes.trim() ? notes.trim() : null
      };

      const res = await api.post('/api/public/reservations', payload);
      if (res.data && res.data.success) {
        setSuccessBooking(res.data.data);
        setNotes('');
        showToast('Đặt bàn thành công! Quản lý sẽ sớm liên hệ xác nhận.');
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt bàn.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (resId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt bàn này?')) return;
    try {
      const res = await api.put(`/api/public/reservations/${resId}/cancel`);
      if (res.data && res.data.success) {
        showToast('Đã hủy đơn đặt bàn thành công.');
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi hủy đặt bàn.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReschedule || !newRescheduleDate || !newRescheduleTime) return;

    try {
      const payload = {
        newReservationTime: `${newRescheduleDate}T${newRescheduleTime}:00`,
        newNumberOfPeople: selectedReschedule.numberOfPeople
      };

      const res = await api.put(`/api/public/reservations/${selectedReschedule.id}/reschedule`, payload);
      if (res.data && res.data.success) {
        showToast('Đổi lịch đặt bàn thành công!');
        setSelectedReschedule(null);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi đổi lịch đặt bàn.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2B2625] relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            L'ÉCLAT Table Reservation
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#4A2810]">
            Đặt Bàn Trải Nghiệm Ẩm Thực
          </h1>
          <p className="text-xs sm:text-sm text-[#4A2810]/70 font-light mt-2">
            Đảm bảo không gian tiệc sang trọng và dịch vụ chu đáo cho những khoảnh khắc đặc biệt.
          </p>
          <div className="h-1 w-16 bg-[#8C3A27] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'book'
                ? 'bg-[#8C3A27] text-white shadow-md'
                : 'bg-white text-[#4A2810] border border-[#4A2810]/10 hover:border-[#8C3A27]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#E07A5F]" />
            <span>Đặt Bàn Mới</span>
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchHistory(); }}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#8C3A27] text-white shadow-md'
                : 'bg-white text-[#4A2810] border border-[#4A2810]/10 hover:border-[#8C3A27]'
            }`}
          >
            <Clock className="w-4 h-4 text-[#E07A5F]" />
            <span>Lịch Sử & Đổi Lịch Đặt Bàn</span>
          </button>
        </div>

        {/* TAB 1: NEW BOOKING FORM */}
        {activeTab === 'book' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-[#4A2810]/10 shadow-xl animate-fade-in">
            
            {formError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-6">
              
              {/* Branch Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  1. Chọn Chi Nhánh Nhà Hàng *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {branches.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBranch(b)}
                      className={`p-3.5 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer flex items-center gap-2 ${
                        branch === b
                          ? 'bg-[#8C3A27] text-white border-[#8C3A27] shadow-md'
                          : 'bg-[#FAF7F2] text-[#4A2810] border-[#4A2810]/10 hover:border-[#8C3A27]'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-[#E07A5F] shrink-0" />
                      <span>{b}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date, Time & People */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Ngày dùng bữa *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Giờ dùng bữa *
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-input text-xs py-2.5 font-mono font-bold"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Số lượng khách *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    className="form-input text-xs py-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0901234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-input text-xs py-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email xác nhận</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Yêu cầu đặc biệt (Ghi chú)</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Bàn cạnh cửa sổ, tiệc kỷ niệm ngày cưới, ghế trẻ em..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input text-xs py-2.5"
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8C3A27] text-white py-3.5 px-10 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-[#A3432D] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 mx-auto"
                >
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Xác Nhận Đặt Bàn Ngay</span>
                </button>
              </div>

            </form>

          </div>
        )}

        {/* TAB 2: RESERVATION HISTORY & RESCHEDULE */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            
            <div className="bg-white p-6 rounded-3xl border border-[#4A2810]/10 shadow-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Nhập Số điện thoại hoặc Email để tra cứu..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="form-input text-xs py-2.5 pl-10 w-full"
                />
              </div>
              <button
                onClick={fetchHistory}
                className="bg-[#4A2810] text-white px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0 hover:bg-[#3B1F0B] transition-all cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-[#E07A5F]" />
                <span>Tra Cứu Lịch Sử</span>
              </button>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                Đang tìm kiếm lịch sử đặt bàn...
              </div>
            ) : historyList.length > 0 ? (
              <div className="space-y-4">
                {historyList.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-6 rounded-3xl border border-[#4A2810]/10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-sm text-[#8C3A27]">#RES-{res.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          res.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          res.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {res.status === 'APPROVED' ? 'Đã xác nhận' : res.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xác nhận'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#4A2810] font-serif">{res.branch}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(res.reservationTime).toLocaleString('vi-VN')}</span>
                        </span>
                        <span>|</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#E07A5F]" />
                          <span>{res.numberOfPeople} người</span>
                        </span>
                      </p>
                      {res.notes && <p className="text-[11px] text-gray-400 italic mt-1">"Ghi chú: {res.notes}"</p>}
                    </div>

                    {res.status !== 'CANCELLED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedReschedule(res);
                            setNewRescheduleDate(res.reservationTime.substring(0, 10));
                          }}
                          className="bg-[#FAF7F2] border border-[#8C3A27]/30 text-[#8C3A27] px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase hover:bg-[#8C3A27] hover:text-white transition-all cursor-pointer"
                        >
                          Đổi Lịch
                        </button>
                        <button
                          onClick={() => handleCancelBooking(res.id)}
                          className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Hủy Đặt Bàn
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 bg-white rounded-3xl border border-[#4A2810]/10 text-center text-xs text-gray-400 font-semibold">
                Chưa tìm thấy thông tin đặt bàn nào. Thử tra cứu theo số điện thoại hoặc email.
              </div>
            )}

          </div>
        )}

      </main>

      {/* Success Booking Modal */}
      {successBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl p-7 text-center animate-fade-in relative">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
            
            <h3 className="text-2xl font-bold font-serif text-[#4A2810]">Đặt Bàn Thành Công!</h3>
            <p className="text-xs text-gray-500 mt-1">Cảm ơn bạn đã tin tưởng lựa chọn L'ÉCLAT Fine Dining.</p>

            <div className="my-5 p-4 bg-[#FAF7F2] rounded-2xl text-xs text-left space-y-1.5 border border-[#4A2810]/10 font-mono">
              <div><b>Mã đặt bàn:</b> #RES-{successBooking.id}</div>
              <div><b>Chi nhánh:</b> {successBooking.branch}</div>
              <div><b>Thời gian:</b> {new Date(successBooking.reservationTime).toLocaleString('vi-VN')}</div>
              <div><b>Số lượng:</b> {successBooking.numberOfPeople} khách</div>
            </div>

            <button
              onClick={() => setSuccessBooking(null)}
              className="bg-[#8C3A27] text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A3432D] transition-all cursor-pointer"
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl p-7 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#4A2810]/10 mb-4">
              <h3 className="text-lg font-bold font-serif text-[#4A2810]">Đổi Lịch Đặt Bàn #{selectedReschedule.id}</h3>
              <button onClick={() => setSelectedReschedule(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày mới *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="form-input text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Giờ mới *</label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="form-input text-xs py-2.5 font-mono font-bold"
                >
                  {timeSlots.map((ts) => (
                    <option key={ts} value={ts}>{ts}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReschedule(null)}
                  className="btn-secondary py-2 px-4 text-xs font-semibold uppercase cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#8C3A27] text-white py-2 px-5 rounded-xl text-xs font-bold uppercase hover:bg-[#A3432D] transition-all cursor-pointer"
                >
                  Xác Nhận Đổi Lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <CustomerFooter />

    </div>
  );
}
