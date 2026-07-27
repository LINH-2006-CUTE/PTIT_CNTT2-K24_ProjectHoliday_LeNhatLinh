import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  // Modals & Form
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('2');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [diningTableId, setDiningTableId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Check In Modal Fields
  const [checkInTableId, setCheckInTableId] = useState('');

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      let params = {
        search,
        status: statusFilter
      };

      if (selectedDateFilter) {
        const startOfDay = `${selectedDateFilter}T00:00:00`;
        const endOfDay = `${selectedDateFilter}T23:59:59`;
        params.startTime = startOfDay;
        params.endTime = endOfDay;
      }

      const res = await api.get('/api/admin/reservations', { params });
      if (res.data && res.data.success) {
        const sortedReservations = (res.data.data || []).sort((a, b) => b.id - a.id);
        setReservations(sortedReservations);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách đặt bàn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const res = await api.get('/api/admin/tables');
      if (res.data && res.data.success) {
        setTables(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [search, statusFilter, selectedDateFilter]);

  useEffect(() => {
    fetchAvailableTables();
  }, []);

  const openAddModal = () => {
    setSelectedReservation(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNumberOfPeople('2');

    // Default to today
    const today = new Date().toISOString().substring(0, 10);
    setReservationDate(today);
    setReservationTime('19:00');
    setDiningTableId('');
    setNotes('');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const openEditModal = (r) => {
    setSelectedReservation(r);
    setCustomerName(r.customerName);
    setCustomerPhone(r.customerPhone);
    setCustomerEmail(r.customerEmail || '');
    setNumberOfPeople(String(r.numberOfPeople));
    
    if (r.reservationTime) {
      const parts = r.reservationTime.split('T');
      setReservationDate(parts[0]);
      setReservationTime(parts[1].substring(0, 5));
    }
    setDiningTableId(r.diningTableId || '');
    setNotes(r.notes || '');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const handleSaveReservation = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!customerName || !customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập Tên khách hàng đặt bàn.';
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = 'Tên khách hàng phải từ 2 ký tự trở lên.';
    }

    if (!customerPhone || !customerPhone.trim()) {
      newErrors.customerPhone = 'Vui lòng nhập Số điện thoại liên hệ.';
    } else if (!/^[0-9+--\s]{9,15}$/.test(customerPhone.trim())) {
      newErrors.customerPhone = 'Số điện thoại không hợp lệ (9-15 chữ số).';
    }

    if (!numberOfPeople || isNaN(parseInt(numberOfPeople)) || parseInt(numberOfPeople) <= 0) {
      newErrors.numberOfPeople = 'Số lượng khách phải lớn hơn 0.';
    }

    if (!reservationDate) {
      newErrors.reservationDate = 'Vui lòng chọn ngày đặt bàn.';
    }

    if (!reservationTime) {
      newErrors.reservationTime = 'Vui lòng chọn giờ đặt bàn.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setFormError('Vui lòng kiểm tra và sửa thông tin các ô màu đỏ.');
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        numberOfPeople: parseInt(numberOfPeople),
        reservationTime: `${reservationDate}T${reservationTime}:00`,
        diningTableId: diningTableId ? Number(diningTableId) : null,
        notes: notes.trim() || null
      };

      if (selectedReservation) {
        const res = await api.put(`/api/admin/reservations/${selectedReservation.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật đặt chỗ cho ${customerName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchReservations();
          fetchAvailableTables();
        }
      } else {
        const res = await api.post('/api/admin/reservations', payload);
        if (res.data && res.data.success) {
          showToast(`Tạo phiếu đặt bàn cho ${customerName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchReservations();
          fetchAvailableTables();
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin đặt bàn.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, action, name) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/api/admin/reservations/${id}/${action}`);
      if (res.data && res.data.success) {
        showToast(`Đã ${name} đơn đặt bàn.`, 'success');
        fetchReservations();
        fetchAvailableTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi cập nhật trạng thái.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openCheckInModal = (r) => {
    setSelectedReservation(r);
    setCheckInTableId(r.diningTableId || '');
    setShowCheckInModal(true);
  };

  const handleCheckIn = async () => {
    if (!checkInTableId) {
      showToast('Vui lòng chỉ định bàn ăn trước khi Check-in.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.put(`/api/admin/reservations/${selectedReservation.id}/check-in`, null, {
        params: { tableId: Number(checkInTableId) }
      });
      if (res.data && res.data.success) {
        showToast(`Khách ${selectedReservation.customerName} đã Check-in nhận bàn thành công.`, 'success');
        setShowCheckInModal(false);
        setSelectedReservation(null);
        fetchReservations();
        fetchAvailableTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Check-in thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge Mapper
  const getStatusDetails = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'APPROVED':
        return { label: 'Đã duyệt', color: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' };
      case 'CHECKED_IN':
        return { label: 'Đang phục vụ', color: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-600' };
      case 'CHECKED_OUT':
        return { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'bg-gray-100 text-gray-500 border-gray-300', dot: 'bg-gray-400' };
      case 'REJECTED':
        return { label: 'Từ chối', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
      default:
        return { label: status, color: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const formatDateStr = (day) => {
    if (!day) return '';
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const getBookingCountForDate = (dateStr) => {
    return reservations.filter((r) => r.reservationTime && r.reservationTime.startsWith(dateStr)).length;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);

    const monthNames = [
      'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
      'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
    ];

    return (
      <div className="restaurant-card p-6 animate-fade-in border border-[#E8E2D9]">
        {/* Calendar Nav */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E8E2D9]">
          <h3 className="text-lg font-bold font-serif text-[#4A121A]">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 border border-[#E8E2D9] rounded-xl hover:bg-white text-gray-600 hover:text-[#4A121A] cursor-pointer shadow-2xs"
              title="Tháng trước"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                const today = new Date();
                setCurrentYear(today.getFullYear());
                setCurrentMonth(today.getMonth());
                setSelectedDateFilter('');
              }}
              className="px-3 py-1.5 border border-[#E8E2D9] rounded-xl hover:bg-white text-xs font-bold text-gray-700 cursor-pointer shadow-2xs"
            >
              Hôm nay
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 border border-[#E8E2D9] rounded-xl hover:bg-white text-gray-600 hover:text-[#4A121A] cursor-pointer shadow-2xs"
              title="Tháng sau"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          <div>CN</div>
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            const dateStr = formatDateStr(day);
            const count = getBookingCountForDate(dateStr);
            const isSelected = selectedDateFilter === dateStr;
            const isToday = dateStr === new Date().toISOString().substring(0, 10);

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDateFilter(isSelected ? '' : dateStr)}
                className={`min-h-[64px] p-2 border rounded-xl flex flex-col justify-between transition-all cursor-pointer select-none ${
                  day
                    ? isSelected
                      ? 'bg-[#4A121A] text-white border-[#4A121A] shadow-md'
                      : isToday
                      ? 'bg-[#C5A059]/15 border-[#C5A059] text-[#4A121A] font-bold'
                      : 'bg-white border-[#E8E2D9]/60 hover:bg-[#FAF7F2]'
                    : 'bg-gray-50/40 border-transparent cursor-default'
                }`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-gray-700'}`}>{day}</span>
                    {count > 0 && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full self-end ${
                          isSelected ? 'bg-white text-[#4A121A]' : 'bg-[#4A121A] text-white'
                        }`}
                      >
                        {count} lượt
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selectedDateFilter && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex justify-between items-center animate-fade-in">
            <span>
              Đang lọc danh sách ngày: <strong className="font-bold underline">{selectedDateFilter}</strong>
            </span>
            <button onClick={() => setSelectedDateFilter('')} className="font-bold text-amber-950 underline hover:text-amber-700 cursor-pointer">
              Xóa lọc ngày
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      
      {/* Toast Alert Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl shadow-xl border text-sm max-w-sm transition-all duration-300 transform translate-x-0 ${
              t.type === 'success'
                ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]/30'
                : 'bg-red-800 text-white border-red-900'
            }`}
          >
            {t.type === 'success' ? (
              <svg className="h-5 w-5 shrink-0 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-semibold tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý đặt bàn trước</h2>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#C5A059]/15 text-[#4A121A] border border-[#C5A059]/30">
              {reservations.length} Đơn đặt chỗ
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Tiếp nhận phiếu đặt bàn trước, theo dõi lịch hẹn và xếp bàn Check-in/Check-out thực tế.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Toggle View Mode */}
          <div className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-white text-[#4A121A] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'calendar' ? 'bg-white text-[#4A121A] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lịch biểu
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-4.5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo phiếu đặt bàn
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="restaurant-card p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center border border-[#E8E2D9]">
        
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo tên khách, SĐT, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
            className="form-input py-2 pr-3 text-xs placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
          >
            <option value="All">Tất cả đặt chỗ</option>
            <option value="PENDING">Chờ duyệt (Pending)</option>
            <option value="APPROVED">Đã duyệt (Approved)</option>
            <option value="CHECKED_IN">Đang phục vụ (Checked-in)</option>
            <option value="CHECKED_OUT">Hoàn thành (Checked-out)</option>
            <option value="CANCELLED">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Main View Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Calendar Sidebar */}
        {viewMode === 'calendar' && (
          <div className="xl:col-span-1">
            {renderCalendar()}
          </div>
        )}

        {/* Reservations Cards List */}
        <div className={viewMode === 'calendar' ? 'xl:col-span-2 space-y-4' : 'xl:col-span-3 space-y-4'}>
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-[#E8E2D9]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải danh sách đặt bàn...</span>
            </div>
          ) : reservations.length === 0 ? (
            <div className="restaurant-card p-12 text-center text-gray-400 bg-white border border-[#E8E2D9]">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Chưa có thông tin đặt bàn nào phù hợp với bộ lọc.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              {reservations.map((r) => {
                const dateObj = new Date(r.reservationTime);
                const displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const displayDate = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
                const stat = getStatusDetails(r.status);

                return (
                  <div
                    key={r.id}
                    className="restaurant-card p-5 hover:border-[#C5A059]/60 transition-all duration-300 flex flex-col justify-between h-full bg-white border border-[#E8E2D9] relative group"
                  >
                    <div>
                      {/* Badge and Time */}
                      <div className="flex justify-between items-start mb-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${stat.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`}></span>
                          {stat.label}
                        </span>
                        
                        <div className="text-right flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#E8E2D9]/60">
                          <svg className="h-3.5 w-3.5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="text-xs font-bold text-[#4A121A] font-serif">{displayTime}</span>
                            <span className="block text-[9px] text-gray-400 font-semibold">{displayDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info Box */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-[#FAF7F2] border border-[#C5A059]/40 text-[#4A121A] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                            {r.customerName ? r.customerName.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div className="truncate">
                            <h4 className="text-base font-bold font-serif text-gray-800 truncate">{r.customerName}</h4>
                            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h32a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                              </svg>
                              {r.customerPhone}
                            </span>
                          </div>
                        </div>

                        {r.customerEmail && (
                          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 pl-1">
                            <svg className="h-3 w-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{r.customerEmail}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100 text-xs">
                          <div className="bg-[#FAF7F2]/60 p-2 rounded-xl border border-[#E8E2D9]/40">
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Số lượng:</span>
                            <span className="font-bold text-[#4A121A]">{r.numberOfPeople} Khách</span>
                          </div>

                          <div className="bg-[#FAF7F2]/60 p-2 rounded-xl border border-[#E8E2D9]/40">
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Bàn phục vụ:</span>
                            {r.diningTableNumber ? (
                              <span className="font-bold text-[#C5A059]">Bàn {r.diningTableNumber}</span>
                            ) : (
                              <span className="text-gray-400 italic">Chưa xếp bàn</span>
                            )}
                          </div>
                        </div>

                        {r.notes && (
                          <div className="mt-2.5 p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 font-medium">
                            <strong className="font-bold text-amber-950 block mb-0.5">Yêu cầu đặc biệt:</strong>
                            {r.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-[#E8E2D9]/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-[#4A121A] cursor-pointer shadow-2xs"
                        title="Chỉnh sửa đặt bàn"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      <div className="flex gap-2">
                        {r.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(r.id, 'reject', 'Từ chối')}
                              className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded-lg hover:bg-red-100 cursor-pointer"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleStatusChange(r.id, 'approve', 'Xác nhận')}
                              className="px-3 py-1 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 cursor-pointer shadow-xs"
                            >
                              Duyệt đặt bàn
                            </button>
                          </>
                        )}

                        {r.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(r.id, 'cancel', 'Hủy đặt bàn')}
                              className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold rounded-lg hover:bg-gray-200 cursor-pointer"
                            >
                              Hủy đặt
                            </button>
                            <button
                              onClick={() => openCheckInModal(r)}
                              className="px-3.5 py-1 bg-emerald-700 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-800 cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Check-in
                            </button>
                          </>
                        )}

                        {r.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'check-out', 'Check-out giải phóng bàn')}
                            className="px-3.5 py-1 bg-[#4A121A] text-white text-[10px] font-bold rounded-lg hover:bg-[#380d14] cursor-pointer shadow-xs"
                          >
                            Check-out (Trả bàn)
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Reservation Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#4A121A]"></div>
            
            <div className="p-6">
              <div className="mb-5 flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedReservation ? `Sửa phiếu đặt bàn: ${customerName}` : 'Tạo phiếu đặt bàn trước'}
                </h3>
                <button onClick={() => setShowAddEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form noValidate onSubmit={handleSaveReservation} className="space-y-3.5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tên khách hàng *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A..."
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, customerName: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.customerName ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.customerName && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 0901234567..."
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, customerPhone: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.customerPhone ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.customerPhone && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Số lượng khách *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="VD: 2..."
                      value={numberOfPeople}
                      onChange={(e) => {
                        setNumberOfPeople(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, numberOfPeople: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.numberOfPeople ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.numberOfPeople && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.numberOfPeople}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Ngày đặt bàn *</label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => {
                        setReservationDate(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, reservationDate: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.reservationDate ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.reservationDate && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.reservationDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Giờ đặt bàn *</label>
                    <input
                      type="time"
                      value={reservationTime}
                      onChange={(e) => {
                        setReservationTime(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, reservationTime: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.reservationTime ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.reservationTime && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.reservationTime}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Email khách hàng</label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="form-input text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Chỉ định bàn (Tùy chọn)</label>
                    <select
                      value={diningTableId}
                      onChange={(e) => setDiningTableId(e.target.value)}
                      className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50 border-[#E8E2D9] rounded-xl"
                    >
                      <option value="">-- Không chỉ định trước --</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id} disabled={t.status !== 'AVAILABLE'}>
                          {t.tableNumber} ({t.area} - {t.capacity} chỗ) {t.status !== 'AVAILABLE' ? `[${t.status}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Yêu cầu đặc biệt</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Không ăn được cay, kỷ niệm ngày cưới, chọn góc yên tĩnh..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="btn-secondary py-2 px-4 text-xs uppercase tracking-wider font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
                  >
                    {actionLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Table Assignment Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="h-2.5 bg-emerald-700"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">Xếp bàn Check-in cho khách</h3>
                <button onClick={() => { setShowCheckInModal(false); setSelectedReservation(null); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                Khách hàng: <strong className="font-bold text-[#4A121A]">{selectedReservation?.customerName}</strong> ({selectedReservation?.numberOfPeople} khách)
              </div>

              <div className="mb-5 text-xs">
                <label className="block font-bold text-gray-700 mb-1">Chọn bàn ăn nhận khách *</label>
                <select
                  value={checkInTableId}
                  onChange={(e) => setCheckInTableId(e.target.value)}
                  className="form-input text-xs py-2.5 font-medium bg-[#FAF7F2]"
                >
                  <option value="" disabled>-- Chọn bàn ăn đang trống --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id} disabled={t.status !== 'AVAILABLE' && t.id !== selectedReservation?.diningTableId}>
                      {t.tableNumber} ({t.area} - {t.capacity} chỗ) {t.status !== 'AVAILABLE' && t.id !== selectedReservation?.diningTableId ? `[Đang bận: ${t.status}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => { setShowCheckInModal(false); setSelectedReservation(null); }}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={actionLoading || !checkInTableId}
                  className="btn-primary py-2 px-5 bg-emerald-700 hover:bg-emerald-800 border-emerald-700 text-white font-bold"
                >
                  {actionLoading ? 'Check-in...' : 'Xác nhận Check-in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
