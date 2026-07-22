import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  Crown,
  Pencil,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Award
} from 'lucide-react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Modals & Form
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Customer Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [membership, setMembership] = useState(false);
  const [points, setPoints] = useState(0);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Points Add Form Field
  const [pointsDelta, setPointsDelta] = useState('');

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/customers', {
        params: { search, page, size, sort: 'id,desc' }
      });
      if (res.data && res.data.success) {
        setCustomers(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách khách hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page, size]);

  const openAddCustomer = () => {
    setSelectedCustomer(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setMembership(false);
    setPoints(0);
    setFormError('');
    setFieldErrors({});
    setShowCustomerModal(true);
  };

  const openEditCustomer = (c) => {
    setSelectedCustomer(c);
    setFullName(c.fullName);
    setPhone(c.phone);
    setEmail(c.email || '');
    setMembership(c.membership);
    setPoints(c.points);
    setFormError('');
    setFieldErrors({});
    setShowCustomerModal(true);
  };

  const openPointsModal = (c) => {
    setSelectedCustomer(c);
    setPointsDelta('');
    setFormError('');
    setFieldErrors({});
    setShowPointsModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!fullName || !fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập Họ và tên khách hàng.';
    }

    if (!phone || !phone.trim()) {
      newErrors.phone = 'Vui lòng nhập Số điện thoại.';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567).';
    }

    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email không hợp lệ (VD: customer@gmail.com).';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : null,
        membership: membership,
        points: Number(points)
      };

      if (selectedCustomer) {
        const res = await api.put(`/api/admin/customers/${selectedCustomer.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật thông tin khách hàng ${fullName} thành công.`, 'success');
          setShowCustomerModal(false);
          fetchCustomers();
        }
      } else {
        const res = await api.post('/api/admin/customers', payload);
        if (res.data && res.data.success) {
          showToast(`Tạo tài khoản khách hàng ${fullName} thành công.`, 'success');
          setShowCustomerModal(false);
          fetchCustomers();
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!pointsDelta || isNaN(pointsDelta)) return setFormError('Vui lòng nhập số điểm hợp lệ.');

    setActionLoading(true);
    try {
      const res = await api.post(`/api/admin/customers/${selectedCustomer.id}/points`, null, {
        params: { points: Number(pointsDelta) }
      });
      if (res.data && res.data.success) {
        showToast(`Đã tích lũy ${Number(pointsDelta) > 0 ? '+' : ''}${pointsDelta} điểm cho ${selectedCustomer.fullName}.`, 'success');
        setShowPointsModal(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Không thể tích điểm cho khách hàng.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/customers/${selectedCustomer.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa khách hàng ${selectedCustomer.fullName} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
      showToast('Xóa khách hàng thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getRankBadgeClass = (rank) => {
    switch (rank) {
      case 'DIAMOND': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'GOLD': return 'bg-amber-50 text-[#C5A059] border-amber-200';
      case 'SILVER': return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-stone-50 text-[#4A121A] border-stone-200';
    }
  };

  const getRankLabel = (rank) => {
    switch (rank) {
      case 'DIAMOND': return 'Kim Cương (Diamond)';
      case 'GOLD': return 'Vàng (Gold)';
      case 'SILVER': return 'Bạc (Silver)';
      default: return 'Thành Viên (Member)';
    }
  };

  return (
    <div className="relative">
      
      {/* Toast Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl shadow-xl border text-sm max-w-sm transition-all duration-300 transform translate-x-0 ${
              t.type === 'success' ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]/30' : 'bg-red-800 text-white border-red-900'
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
          <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý Thành viên & Khách hàng</h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Theo dõi hạng thành viên, số điện thoại, email và tích lũy điểm thưởng loyalty cards.
          </p>
        </div>

        <button
          onClick={openAddCustomer}
          className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm khách hàng mới
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="restaurant-card p-4.5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#C5A059] shadow-xs placeholder:text-gray-400"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hiển thị:</span>
          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A] cursor-pointer"
          >
            <option value={5}>5 khách hàng</option>
            <option value={10}>10 khách hàng</option>
            <option value={20}>20 khách hàng</option>
            <option value={50}>50 khách hàng</option>
          </select>
        </div>
      </div>

      {/* Main Grid/List View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-[#E8E2D9]/40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="restaurant-card overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8E2D9]/30 text-left text-xs font-medium">
            <thead className="bg-[#FAF7F2] text-[#4A121A] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Hạng thành viên</th>
                <th className="px-6 py-4">Điểm tích lũy</th>
                <th className="px-6 py-4">Thẻ thành viên</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9]/20 bg-white">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/30 transition-all">
                  <td className="px-6 py-4.5">
                    <div className="font-bold text-gray-800">{c.fullName}</div>
                    <div className="text-[10px] text-gray-400 font-light mt-0.5">{c.email || 'Không có email'}</div>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-gray-700">{c.phone}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${getRankBadgeClass(c.rank)}`}>
                      {getRankLabel(c.rank)}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono font-bold text-[#C5A059] text-sm">
                    {c.points}
                  </td>
                  <td className="px-6 py-4.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        c.membership ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {c.membership ? 'Đã kích hoạt' : 'Chưa đăng ký'}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right flex justify-end gap-3.5">
                    <button
                      onClick={() => openPointsModal(c)}
                      className="text-xs font-bold text-[#C5A059] hover:text-[#B38E46] cursor-pointer"
                    >
                      Tích/Tiêu điểm
                    </button>
                    <button
                      onClick={() => openEditCustomer(c)}
                      className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
                      title="Sửa Thông Tin Khách Hàng"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedCustomer(c); setShowDeleteConfirm(true); }}
                      className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all cursor-pointer shadow-xs"
                      title="Xóa Khách Hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E8E2D9] bg-white text-gray-600 disabled:opacity-40"
          >
            Trước
          </button>
          <span className="text-xs font-mono text-gray-500">Trang {page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E8E2D9] bg-white text-gray-600 disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="h-2.5 bg-[#C5A059]"></div>
            
            <div className="p-7">
              <div className="mb-6 flex justify-between items-center pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedCustomer ? `Sửa khách hàng: ${fullName}` : 'Thêm khách hàng mới'}
                </h3>
                <button onClick={() => setShowCustomerModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form noValidate onSubmit={handleSaveCustomer} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Alex Mercer, Bruce Wayne..."
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, fullName: null }));
                    }}
                    className={`form-input text-xs py-2.5 ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fieldErrors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0987654321..."
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    className={`form-input text-xs py-2.5 ${fieldErrors.phone ? 'is-invalid' : ''}`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="Ví dụ: alex@mercer.com..."
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: null }));
                    }}
                    className={`form-input text-xs py-2.5 ${fieldErrors.email ? 'is-invalid' : ''}`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Điểm ban đầu</label>
                    <input
                      type="number"
                      placeholder="0"
                      disabled={!!selectedCustomer} // disabled on edit to prevent raw manipulation
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      className="form-input text-xs py-2.5 disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="membership"
                      checked={membership}
                      onChange={(e) => setMembership(e.target.checked)}
                      className="h-4.5 w-4.5 text-[#C5A059] border-[#E8E2D9] rounded-md focus:ring-[#C5A059]"
                    />
                    <label htmlFor="membership" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Thẻ thành viên
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3.5 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(false)}
                    className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
                  >
                    Lưu thông tin
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Points Add/Subtract Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in text-center">
            <div className="h-2.5 bg-[#C5A059]"></div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#4A121A] font-serif">Tích / Tiêu điểm khách hàng</h3>
              <p className="mt-1 text-xs text-gray-500 font-bold block">{selectedCustomer?.fullName}</p>
              
              <span className="block text-[10px] text-gray-400 mt-1 font-mono">
                Số điểm hiện tại: <span className="font-bold text-[#C5A059]">{selectedCustomer?.points}</span> ({getRankLabel(selectedCustomer?.rank)})
              </span>

              {formError && (
                <div className="my-3.5 rounded-xl bg-red-50 border border-red-100 p-2.5 text-[11px] text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddPoints} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-left">
                    Điểm số thay đổi *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Nhập 100 để cộng điểm, hoặc -50 để đổi quà"
                    value={pointsDelta}
                    onChange={(e) => setPointsDelta(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                  <span className="text-[10px] text-gray-400 text-left block mt-1.5 leading-relaxed font-light">
                    Hạng sẽ tự động điều chỉnh theo tổng điểm mới: Member (&lt;100), Silver (&gt;=100), Gold (&gt;=500), Diamond (&gt;=2000).
                  </span>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPointsModal(false)}
                    className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in text-center">
            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa tài khoản khách hàng</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Xác nhận xóa vĩnh viễn tài khoản của <span className="font-bold text-gray-800">{selectedCustomer?.fullName}</span>? Thao tác này sẽ xóa sạch thẻ thành viên và lịch sử điểm tích lũy.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedCustomer(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={actionLoading}
                className="btn-primary bg-gradient-to-r from-red-700 to-red-800 border-red-800 text-white py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
