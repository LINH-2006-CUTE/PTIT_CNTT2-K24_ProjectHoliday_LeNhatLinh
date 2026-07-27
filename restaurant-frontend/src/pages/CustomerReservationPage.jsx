import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  AlertCircle,
  Utensils,
  ArrowRight
} from 'lucide-react';

export default function CustomerReservationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSelectedTable: setCartSelectedTable } = useCart();
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

  // Field Errors State
  const [fieldErrors, setFieldErrors] = useState({});
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
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  // Visual Table Layout States
  const [publicTables, setPublicTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedArea, setSelectedArea] = useState('ALL');

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchPublicTables = async () => {
    try {
      const res = await api.get('/api/public/reservations/tables');
      if (res.data && res.data.success) {
        setPublicTables(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicTables();
    const interval = setInterval(fetchPublicTables, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async (overrideSearch) => {
    const activeSearch = (overrideSearch !== undefined 
      ? overrideSearch 
      : (historySearch || user?.phone || user?.email || localStorage.getItem('letoile_last_phone') || '')).trim();

    setHistoryLoading(true);
    try {
      const res = await api.get('/api/public/reservations/history', {
        params: { search: activeSearch }
      });
      if (res.data && res.data.success) {
        setHistoryList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Auto-fill and sync user account profile data & fetch history
  useEffect(() => {
    const syncUserProfile = async () => {
      let phoneToSearch = user?.phone || localStorage.getItem('letoile_last_phone') || '';
      let emailToSearch = user?.email || '';

      if (user) {
        if (user.fullName) setCustomerName(user.fullName);
        if (user.email) setCustomerEmail(user.email);
        if (user.phone) {
          setCustomerPhone(user.phone);
          setHistorySearch(user.phone);
          localStorage.setItem('letoile_last_phone', user.phone);
        } else {
          try {
            const res = await api.get('/api/customer/profile');
            if (res.data && res.data.success && res.data.data) {
              const p = res.data.data;
              if (p.phone) {
                phoneToSearch = p.phone;
                setCustomerPhone(p.phone);
                setHistorySearch(p.phone);
                localStorage.setItem('letoile_last_phone', p.phone);
              }
              if (p.fullName && !user.fullName) setCustomerName(p.fullName);
            }
          } catch (e) {
            console.error('Failed to auto-fetch customer profile phone:', e);
          }
        }
      }

      fetchHistory(phoneToSearch || emailToSearch);
    };

    syncUserProfile();
  }, [user]);

  const branches = [
    "L'ÉCLAT Tràng Tiền - Hà Nội",
    "L'ÉCLAT Đồng Khởi - TP. Hồ Chí Minh",
    "L'ÉCLAT Bãi Cháy - Quảng Ninh"
  ];

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const validateReservationForm = () => {
    const errors = {};

    // Validate Customer Name
    if (!customerName.trim()) {
      errors.customerName = 'Vui lòng điền Họ và tên.';
    } else if (customerName.trim().length < 2) {
      errors.customerName = 'Họ và tên phải gồm ít nhất 2 ký tự.';
    }

    // Validate Customer Phone
    const normalizedPhone = customerPhone.replace(/[\s.-]/g, '');
    if (!customerPhone.trim()) {
      errors.customerPhone = 'Vui lòng điền Số điện thoại liên hệ.';
    } else if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
      errors.customerPhone = 'Số điện thoại không hợp lệ (Phải gồm 10 chữ số đầu 03, 05, 07, 08, 09 hoặc +84).';
    }

    // Validate Date (Must be today or future date)
    if (!date) {
      errors.date = 'Vui lòng chọn Ngày dùng bữa.';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Ngày dùng bữa không được ở trong quá khứ.';
      }
    }

    // Validate Time
    if (!time) {
      errors.time = 'Vui lòng chọn Giờ dùng bữa.';
    }

    // Validate Number of People
    if (!numberOfPeople || Number(numberOfPeople) < 1) {
      errors.numberOfPeople = 'Số lượng khách phải từ 1 người trở lên.';
    } else if (Number(numberOfPeople) > 50) {
      errors.numberOfPeople = 'Số lượng khách tối đa là 50 người/đơn.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateReservationForm()) {
      return setFormError('Vui lòng kiểm tra các ô thông tin bị báo đỏ bên dưới.');
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
        notes: notes.trim() ? notes.trim() : null,
        tableId: selectedTable ? selectedTable.id : null,
        tableNumber: selectedTable ? selectedTable.tableNumber : null
      };

      const res = await api.post('/api/public/reservations', payload);
      if (res.data && res.data.success) {
        const createdRes = res.data.data;
        setSuccessBooking(createdRes);

        // Auto-bind reserved table to CartContext so ordering menu bypasses service mode modal
        if (createdRes.diningTable) {
          setCartSelectedTable({
            id: createdRes.diningTable.id,
            tableName: `${createdRes.diningTable.tableNumber || `Bàn ${createdRes.diningTable.id}`} (${createdRes.diningTable.area || 'Sảnh Main'})`
          });
        } else if (selectedTable) {
          setCartSelectedTable({
            id: selectedTable.id,
            tableName: `${selectedTable.tableNumber || `Bàn ${selectedTable.id}`} (${selectedTable.area || selectedTable.location || 'Sảnh Main'})`
          });
        } else {
          setCartSelectedTable({
            id: createdRes.id,
            tableName: `Đã Đặt Bàn #${createdRes.reservationCode || createdRes.id}`
          });
        }

        setNotes('');
        setSelectedTable(null);
        setFieldErrors({});
        fetchPublicTables();
        showToast('Đặt bàn thành công! Sơ đồ bàn đã được cập nhật.');
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt bàn.');
    } finally {
      setLoading(false);
    }
  };

  const executeCancelBooking = async (resId) => {
    try {
      const res = await api.put(`/api/public/reservations/${resId}/cancel`);
      if (res.data && res.data.success) {
        showToast('Đã hủy đơn đặt bàn thành công.');
        setCancelConfirmId(null);
        fetchHistory();
        fetchPublicTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Không thể hủy đơn đặt bàn.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReschedule || !newRescheduleDate || !newRescheduleTime) return;

    try {
      const payload = {
        newReservationTime: `${newRescheduleDate}T${newRescheduleTime}:00`
      };
      const res = await api.put(`/api/public/reservations/${selectedReschedule.id}/reschedule`, payload);
      if (res.data && res.data.success) {
        showToast('Đã đổi lịch dùng bữa thành công!');
        setSelectedReschedule(null);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Không thể đổi lịch đặt bàn.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#4A2810] via-[#8C3A27] to-[#4A2810] text-[#FAF7F2] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E07A5F] block">
            L'ÉCLAT Fine Dining Experience
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif">
            Đặt Bàn & Trải Nghiệm Ẩm Thực Thượng Hạng
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            Thưởng thức bữa tối ẩm thực Pháp đỉnh cao với không gian sang trọng, ánh nến lãng mạn và sự phục vụ chu đáo tận tâm.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'book' ? 'bg-[#8C3A27] text-white shadow-md' : 'bg-white text-[#4A2810] border border-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#E07A5F]" /> Đặt Bàn Mới
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history' ? 'bg-[#8C3A27] text-white shadow-md' : 'bg-white text-[#4A2810] border border-gray-200'
            }`}
          >
            <Clock className="w-4 h-4 text-[#E07A5F]" /> Lịch Sử & Đổi Lịch Đặt Bàn
          </button>
        </div>

        {/* TAB 1: FORM BOOKING */}
        {activeTab === 'book' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#4A2810]/10 shadow-xl animate-fade-in space-y-6">
            
            {formError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {successBooking ? (
              <div className="text-center py-10 space-y-6 bg-emerald-50/60 rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl animate-scale-up">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#4A2810]">
                    Đặt Bàn Thành Công!
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                    Cảm ơn quý khách đã lựa chọn <strong>L'ÉCLAT Fine Dining</strong>. Đơn đặt bàn của bạn đã được tiếp nhận và nhà hàng sẽ hỗ trợ chu đáo nhất.
                  </p>
                </div>

                {/* Reservation Summary Details */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200 inline-block text-left text-xs space-y-2.5 font-mono shadow-xs max-w-md w-full">
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-sans">Mã đặt bàn:</span>
                    <strong className="text-[#8C3A27] font-bold">#{successBooking.reservationCode || successBooking.id}</strong>
                  </div>
                  {successBooking.diningTable && (
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-500 font-sans">Vị trí bàn ăn:</span>
                      <strong className="text-[#4A2810] font-bold">{successBooking.diningTable.tableNumber} ({successBooking.diningTable.area})</strong>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-sans">Chi nhánh:</span>
                    <span className="text-gray-800 font-semibold">{successBooking.branch || branch}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-sans">Khách hàng:</span>
                    <span className="text-gray-800 font-semibold">{successBooking.customerName} ({successBooking.customerPhone})</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500 font-sans">Thời gian:</span>
                    <span className="text-gray-800 font-semibold">{new Date(successBooking.reservationTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-sans">Số lượng khách:</span>
                    <span className="text-gray-800 font-semibold">{successBooking.numberOfPeople} người</span>
                  </div>
                </div>

                {/* DIRECT PROMPT TO ORDER DISHES NOW */}
                <div className="bg-gradient-to-r from-[#4A2810] via-[#8C3A27] to-[#4A2810] text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-3.5 max-w-lg mx-auto border border-[#C5A059]/30">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold font-serif text-[#E6C687]">
                    <Sparkles className="w-4 h-4 text-[#E6C687]" />
                    <span>Muốn Bữa Ăn Trọn Vẹn? Hãy Chọn Món Trước Ngay!</span>
                  </div>
                  <p className="text-[11px] text-gray-200 font-light leading-relaxed">
                    Chọn trước các món ăn Fine Dining đặc sắc để nhà hàng chuẩn bị sẵn sàng, giúp quý khách dùng bữa ngay khi tới bàn.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (successBooking?.diningTable) {
                        setCartSelectedTable({
                          id: successBooking.diningTable.id,
                          tableName: `${successBooking.diningTable.tableNumber || `Bàn ${successBooking.diningTable.id}`} (${successBooking.diningTable.area || 'Sảnh Main'})`
                        });
                      }
                      navigate('/menu', { state: { reservationId: successBooking.id, tableId: successBooking.diningTable?.id } });
                    }}
                    className="w-full bg-gradient-to-r from-[#C5A059] to-[#E6C687] text-[#2C0C11] py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider hover:from-[#d4b06a] hover:to-[#f0d497] shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Chuyển Sang Chọn Món Ăn Ngay (Thực Đơn)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setSuccessBooking(null)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Tiếp Tục Đặt Bàn Mới
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccessBooking(null);
                      setActiveTab('history');
                    }}
                    className="flex-1 bg-[#FAF7F2] border border-[#8C3A27]/20 text-[#8C3A27] py-3 rounded-2xl text-xs font-bold hover:bg-[#8C3A27]/10 transition-all cursor-pointer"
                  >
                    Xem Lịch Sử Đặt Bàn
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} noValidate className="space-y-6">
                
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
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (fieldErrors.date) setFieldErrors(prev => ({ ...prev, date: null }));
                      }}
                      className={`form-input text-xs py-2.5 transition-all ${
                        fieldErrors.date ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {fieldErrors.date && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.date}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Giờ dùng bữa *
                    </label>
                    <select
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        if (fieldErrors.time) setFieldErrors(prev => ({ ...prev, time: null }));
                      }}
                      className={`form-input text-xs py-2.5 font-mono font-bold transition-all ${
                        fieldErrors.time ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                    {fieldErrors.time && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.time}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Số lượng khách *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={numberOfPeople}
                      onChange={(e) => {
                        setNumberOfPeople(e.target.value);
                        if (fieldErrors.numberOfPeople) setFieldErrors(prev => ({ ...prev, numberOfPeople: null }));
                      }}
                      className={`form-input text-xs py-2.5 font-mono font-bold transition-all ${
                        fieldErrors.numberOfPeople ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {fieldErrors.numberOfPeople && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.numberOfPeople}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. SƠ ĐỒ BÀN ĂN TRỰC QUAN (VISUAL FLOOR MAP) */}
                <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-3xl border border-[#4A2810]/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2810]/10 pb-3">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-[#4A2810] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8C3A27]" />
                        2. Chọn Bàn Theo Sơ Đồ Trực Quan (Tuỳ Chọn)
                      </h4>
                      <p className="text-[11px] text-gray-500 font-light">
                        Xem vị trí thực tế &amp; bấm chọn trực tiếp vị trí bàn bạn ưa thích bên dưới.
                      </p>
                    </div>

                    {/* Filter Areas */}
                    <div className="flex flex-wrap gap-1.5">
                      {['ALL', ...new Set(publicTables.map(t => t.area || t.location).filter(Boolean))].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setSelectedArea(loc)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            selectedArea === loc
                              ? 'bg-[#8C3A27] text-white shadow-xs'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-[#8C3A27]'
                          }`}
                        >
                          {loc === 'ALL' ? 'Tất Cả Khu Vực' : loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-gray-600 bg-white p-2.5 rounded-2xl border border-gray-100">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 inline-block" />
                      <span>Bàn Trống (Có thể chọn)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-800 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200 inline-block" />
                      <span>Đã Đặt Trước</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200 inline-block" />
                      <span>Đang Phục Vụ</span>
                    </span>
                  </div>

                  {/* Selected Table Indicator Banner */}
                  {selectedTable && (
                    <div className="bg-[#8C3A27]/10 border border-[#8C3A27]/30 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs animate-fade-in">
                      <div className="flex items-center gap-2 font-bold text-[#8C3A27]">
                        <CheckCircle2 className="w-4 h-4 text-[#8C3A27]" />
                        <span>Đã chọn: <strong>{selectedTable.tableNumber || `Bàn ${selectedTable.id}`}</strong> ({selectedTable.area || selectedTable.location || 'Sảnh Main'} - Sức chứa: {selectedTable.capacity} khách)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTable(null)}
                        className="text-[10px] text-red-600 font-bold underline hover:text-red-800 cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  )}

                  {/* Tables Grid */}
                  {tablesLoading ? (
                    <div className="py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Đang tải sơ đồ bàn ăn nhà hàng...
                    </div>
                  ) : publicTables.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 font-semibold bg-white rounded-2xl border border-gray-200">
                      Đang cập nhật danh sách bàn ăn. Bạn có thể gửi thông tin để quản lý xếp bàn tự động.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {publicTables
                        .filter(t => selectedArea === 'ALL' || (t.area || t.location) === selectedArea)
                        .map((t) => {
                          const isAvailable = t.status === 'AVAILABLE' || !t.status;
                          const isSelected = selectedTable?.id === t.id;

                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => {
                                if (isSelected) setSelectedTable(null);
                                else setSelectedTable(t);
                              }}
                              className={`p-3.5 rounded-2xl text-left border transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#8C3A27] text-white border-[#8C3A27] ring-4 ring-[#8C3A27]/20 shadow-lg scale-102 z-10'
                                  : isAvailable
                                  ? 'bg-white hover:bg-emerald-50/50 text-[#2B2625] border-emerald-200 hover:border-emerald-500 shadow-xs'
                                  : 'bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className={`text-xs font-bold font-serif ${isSelected ? 'text-white' : 'text-[#4A2810]'}`}>
                                  {t.tableNumber || `Bàn ${t.id}`}
                                </span>
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  t.status === 'RESERVED' ? 'bg-purple-500' :
                                  t.status === 'OCCUPIED' ? 'bg-amber-500' :
                                  isAvailable ? 'bg-emerald-500' : 'bg-gray-400'
                                }`} />
                              </div>

                              <div className="space-y-0.5 text-[10px]">
                                <div className={`flex items-center gap-1 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                                  <Users className="w-3 h-3 shrink-0" />
                                  <span>{t.capacity || 4} Khách</span>
                                </div>
                                <div className={`flex items-center gap-1 truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{t.area || t.location || 'Sảnh'}</span>
                                </div>
                              </div>

                              <div className="text-[10px] font-bold uppercase tracking-wider pt-1 border-t border-current/10 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  {isSelected ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                      <span>ĐÃ CHỌN</span>
                                    </>
                                  ) : isAvailable ? (
                                    'BÀN TRỐNG'
                                  ) : t.status === 'RESERVED' ? (
                                    'ĐÃ ĐẶT'
                                  ) : (
                                    'ĐANG DÙNG'
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A..."
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.customerName) setFieldErrors(prev => ({ ...prev, customerName: null }));
                      }}
                      className={`form-input text-xs py-2.5 transition-all ${
                        fieldErrors.customerName ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.customerName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (fieldErrors.customerPhone) setFieldErrors(prev => ({ ...prev, customerPhone: null }));
                      }}
                      className={`form-input text-xs py-2.5 font-mono transition-all ${
                        fieldErrors.customerPhone ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {fieldErrors.customerPhone && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.customerPhone}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email xác nhận</label>
                    <input
                      type="email"
                      placeholder="email@domain.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="form-input text-xs py-2.5 font-mono"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Yêu cầu đặc biệt (Ghi chú)</label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Bàn gần cửa sổ, tiệc sinh nhật, dị ứng hải sản..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#8C3A27] text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-[#A3432D] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#E07A5F]" />
                    <span>{loading ? 'Đang Xử Lý Đặt Bàn...' : 'Xác Nhận Đặt Bàn Ngay'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

        {/* TAB 2: HISTORY & RESCHEDULE */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#4A2810]/10 shadow-xl animate-fade-in space-y-6">
            
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#4A2810]">Lịch Sử Đặt Bàn</h3>
                <p className="text-xs text-gray-500">Tra cứu và điều chỉnh thời gian đặt bàn của bạn.</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Nhập SĐT / Email tra cứu..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#8C3A27]"
                  />
                </div>
                <button
                  onClick={fetchHistory}
                  className="bg-[#8C3A27] text-white px-4 py-2 rounded-2xl text-xs font-bold uppercase hover:bg-[#A3432D]"
                >
                  Tìm
                </button>
              </div>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                Đang tìm kiếm lịch sử đặt bàn...
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold bg-[#FAF7F2] rounded-2xl border border-gray-200">
                Chưa tìm thấy đơn đặt bàn nào khớp với SĐT / Email này.
              </div>
            ) : (
              <div className="space-y-4">
                {historyList.map((item) => (
                  <div key={item.id} className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#4A2810]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#8C3A27] font-mono">#{item.reservationCode || item.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="font-bold text-[#4A2810] text-sm">{item.branch}</div>
                      <div className="text-gray-500 text-xs flex flex-wrap items-center gap-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#8C3A27]" />
                          <span>{new Date(item.reservationTime).toLocaleString('vi-VN')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#8C3A27]" />
                          <span>{item.numberOfPeople} khách</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {item.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReschedule(item);
                              setNewRescheduleDate(item.reservationTime.split('T')[0]);
                            }}
                            className="bg-white border border-[#8C3A27] text-[#8C3A27] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#8C3A27] hover:text-white transition-all cursor-pointer"
                          >
                            Đổi Lịch Giờ
                          </button>

                          <button
                            onClick={() => setCancelConfirmId(item.id)}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
                          >
                            Hủy Bàn
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* MODAL RESCHEDULE */}
      {selectedReschedule && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#4A2810]/10 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold font-serif text-[#4A2810]">
                Đổi Lịch Dùng Bữa #{selectedReschedule.reservationCode || selectedReschedule.id}
              </h4>
              <button onClick={() => setSelectedReschedule(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày Dùng Bữa Mới</label>
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Giờ Dùng Bữa Mới</label>
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReschedule(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8C3A27] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D]"
                >
                  Xác Nhận Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LUXURY CONFIRMATION MODAL FOR CANCELING RESERVATION */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#8C3A27]/20 shadow-2xl space-y-6 text-center relative">
            <button
              onClick={() => setCancelConfirmId(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-50 text-[#8C3A27] flex items-center justify-center mx-auto shadow-inner border border-red-200">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-[#2B2625]">
                Xác Nhận Hủy Đặt Bàn?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bạn có chắc chắn muốn hủy yêu cầu đặt bàn này? Thao tác này không thể hoàn tác sau khi xác nhận.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Quay Lại
              </button>

              <button
                type="button"
                onClick={() => executeCancelBooking(cancelConfirmId)}
                className="flex-1 py-3 rounded-xl bg-[#8C3A27] text-white text-xs font-bold hover:bg-[#6D2B1C] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                Xác Nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerFooter />
    </div>
  );
}
