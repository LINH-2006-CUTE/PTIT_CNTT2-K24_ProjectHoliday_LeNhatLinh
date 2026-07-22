import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Ticket,
  Pencil,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Play
} from 'lucide-react';

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE'); // 'PERCENTAGE' or 'FIXED_AMOUNT'
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Test Voucher Fields
  const [testCode, setTestCode] = useState('');
  const [testOrderAmount, setTestOrderAmount] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/promotions', {
        params: { search, page, size: 8, sort: 'id,desc' }
      });
      if (res.data && res.data.success) {
        setPromotions(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách khuyến mãi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [search, page]);

  const openAddModal = () => {
    setSelectedPromotion(null);
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinOrderValue('');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setStartDate('');
    setEndDate('');
    setStatus('ACTIVE');
    setFormError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setSelectedPromotion(p);
    setCode(p.code);
    setDescription(p.description || '');
    setDiscountType(p.discountType);
    setDiscountValue(String(p.discountValue));
    setMinOrderValue(p.minOrderValue ? String(p.minOrderValue) : '');
    setMaxDiscountAmount(p.maxDiscountAmount ? String(p.maxDiscountAmount) : '');
    setUsageLimit(p.usageLimit ? String(p.usageLimit) : '');
    setStartDate(p.startDate ? p.startDate.substring(0, 16) : '');
    setEndDate(p.endDate ? p.endDate.substring(0, 16) : '');
    setStatus(p.status);
    setFormError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSavePromotion = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!code || !code.trim()) {
      newErrors.code = 'Vui lòng nhập Mã voucher.';
    }

    if (!discountValue || isNaN(parseFloat(discountValue)) || parseFloat(discountValue) <= 0) {
      newErrors.discountValue = 'Vui lòng nhập Mức giảm hợp lệ (>0).';
    } else if (discountType === 'PERCENTAGE' && parseFloat(discountValue) > 100) {
      newErrors.discountValue = 'Mức giảm phần trăm không vượt quá 100%.';
    }

    if (!startDate) {
      newErrors.startDate = 'Vui lòng chọn Ngày bắt đầu.';
    }

    if (!endDate) {
      newErrors.endDate = 'Vui lòng chọn Ngày kết thúc.';
    } else if (startDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() ? description.trim() : null,
        discountType: discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate.length === 16 ? `${startDate}:00` : startDate,
        endDate: endDate.length === 16 ? `${endDate}:00` : endDate,
        status: status
      };

      if (selectedPromotion) {
        const res = await api.put(`/api/admin/promotions/${selectedPromotion.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật voucher ${code} thành công.`, 'success');
          setShowModal(false);
          fetchPromotions();
        }
      } else {
        const res = await api.post('/api/admin/promotions', payload);
        if (res.data && res.data.success) {
          showToast(`Tạo voucher ${code} thành công.`, 'success');
          setShowModal(false);
          fetchPromotions();
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Lỗi khi lưu thông tin voucher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (p) => {
    const newStatus = p.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await api.put(`/api/admin/promotions/${p.id}/status`, null, {
        params: { status: newStatus }
      });
      if (res.data && res.data.success) {
        showToast(`Đã chuyển trạng thái voucher sang ${newStatus}.`, 'success');
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật trạng thái voucher.', 'error');
    }
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/promotions/${selectedPromotion.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa voucher ${selectedPromotion.code} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedPromotion(null);
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa voucher này.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestVoucher = async (e) => {
    e.preventDefault();
    setFormError('');
    setTestResult(null);

    if (!testCode.trim()) return setFormError('Vui lòng nhập mã voucher.');
    if (!testOrderAmount || parseFloat(testOrderAmount) <= 0) return setFormError('Nhập tổng tiền đơn hàng để thử nghiệm.');

    try {
      const res = await api.post('/api/admin/promotions/validate', null, {
        params: {
          code: testCode.trim(),
          orderAmount: parseFloat(testOrderAmount)
        }
      });
      if (res.data && res.data.success) {
        setTestResult({
          discount: res.data.data,
          finalAmount: parseFloat(testOrderAmount) - res.data.data
        });
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Mã voucher không hợp lệ.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EXPIRED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DISABLED': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Khả dụng';
      case 'EXPIRED': return 'Hết hạn';
      case 'DISABLED': return 'Tạm ngưng';
      default: return status;
    }
  };

  return (
    <div className="relative">
      
      {/* Toast Notification Stack */}
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
          <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý Khuyến mãi & Voucher</h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Tạo và quản lý các mã giảm giá, voucher quà tặng và chương trình khuyến mãi ưu đãi.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setShowTestModal(true); setFormError(''); setTestResult(null); }}
            className="btn-secondary py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
          >
            🧪 Thử mã Voucher
          </button>
          <button
            onClick={openAddModal}
            className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo Voucher mới
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="restaurant-card p-4.5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Tìm theo mã voucher hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input py-2 pl-9.5 text-xs placeholder:text-gray-400"
          />
          <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-[#E8E2D9]/40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải dữ liệu voucher...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((p) => {
            const usagePercent = p.usageLimit ? Math.min(100, Math.round((p.usedCount / p.usageLimit) * 100)) : 0;

            return (
              <div key={p.id} className="restaurant-card p-6 bg-white border border-[#E8E2D9]/50 hover:border-[#C5A059]/50 transition-all duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-[#4A121A] font-bold text-lg">
                      🎟️
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-mono text-[#4A121A] tracking-wider">{p.code}</h4>
                      <p className="text-xs text-gray-500 font-light mt-0.5 line-clamp-1">{p.description || 'Không có mô tả'}</p>
                    </div>
                  </div>

                  <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(p.status)}`}>
                    {getStatusLabel(p.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2]/60 rounded-xl border border-[#E8E2D9]/30 text-xs mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Giá trị ưu đãi</span>
                    <span className="font-bold text-[#C5A059] text-sm font-mono">
                      {p.discountType === 'PERCENTAGE' ? `Giảm ${p.discountValue}%` : `Giảm $${p.discountValue}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block">Đơn tối thiểu</span>
                    <span className="font-semibold text-gray-700 font-mono">
                      {p.minOrderValue ? `$${p.minOrderValue}` : 'Không quy định'}
                    </span>
                  </div>
                </div>

                {/* Usage Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase">
                    <span>Lượt sử dụng</span>
                    <span>{p.usedCount} / {p.usageLimit ? p.usageLimit : '∞'}</span>
                  </div>
                  <div className="h-2 w-full bg-[#E8E2D9]/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C5A059] to-[#4A121A] transition-all duration-500"
                      style={{ width: p.usageLimit ? `${usagePercent}%` : '20%' }}
                    ></div>
                  </div>
                </div>

                {/* Validity footer & actions */}
                <div className="pt-3 border-t border-[#E8E2D9]/30 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <span>Hạn: {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#4A121A] bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
                    >
                      {p.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
                      title="Sửa Voucher"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedPromotion(p); setShowDeleteConfirm(true); }}
                      className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all cursor-pointer shadow-xs"
                      title="Xóa Voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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

      {/* Add / Edit Voucher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-6">
            <div className="h-2.5 bg-[#C5A059]"></div>
            
            <div className="p-7">
              <div className="mb-6 flex justify-between items-center pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedPromotion ? `Sửa Voucher: ${code}` : 'Tạo Voucher Khuyến mãi Mới'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form noValidate onSubmit={handleSavePromotion} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: WELCOME10, GOLDVIP50..."
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, code: null }));
                    }}
                    className={`form-input text-xs py-2.5 uppercase font-mono ${fieldErrors.code ? 'is-invalid' : ''}`}
                  />
                  {fieldErrors.code && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fieldErrors.code}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả chương trình</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Ưu đãi 10% cho khách hàng mới..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Loại giảm giá *</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="form-input text-xs py-2.5"
                    >
                      <option value="PERCENTAGE">Theo Phần Trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số Tiền Cố Định ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mức giảm *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={discountType === 'PERCENTAGE' ? 'Ví dụ: 10' : 'Ví dụ: 50'}
                      value={discountValue}
                      onChange={(e) => {
                        setDiscountValue(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, discountValue: null }));
                      }}
                      className={`form-input text-xs py-2.5 ${fieldErrors.discountValue ? 'is-invalid' : ''}`}
                    />
                    {fieldErrors.discountValue && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{fieldErrors.discountValue}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Giá trị đơn tối thiểu ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Không yêu cầu nếu để trống"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(e.target.value)}
                      className="form-input text-xs py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Giới hạn số lượt dùng</label>
                    <input
                      type="number"
                      placeholder="Không giới hạn nếu để trống"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="form-input text-xs py-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ngày bắt đầu *</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, startDate: null }));
                      }}
                      className={`form-input text-xs py-2.5 ${fieldErrors.startDate ? 'is-invalid' : ''}`}
                    />
                    {fieldErrors.startDate && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{fieldErrors.startDate}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ngày kết thúc *</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, endDate: null }));
                      }}
                      className={`form-input text-xs py-2.5 ${fieldErrors.endDate ? 'is-invalid' : ''}`}
                    />
                    {fieldErrors.endDate && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{fieldErrors.endDate}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3.5 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
                  >
                    Lưu Voucher
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Test Voucher Calculator Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in relative">
            <h3 className="text-lg font-bold text-[#4A121A] font-serif text-center mb-1">Thử nghiệm Mã Voucher</h3>
            <p className="text-xs text-gray-400 text-center mb-4">Nhập mã và giá trị đơn hàng để xem số tiền được giảm thực tế.</p>

            {formError && (
              <div className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs text-center font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleTestVoucher} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Nhập mã voucher (VD: WELCOME10)..."
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="form-input text-xs py-2.5 uppercase font-mono"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="Tổng tiền đơn hàng ($)..."
                  value={testOrderAmount}
                  onChange={(e) => setTestOrderAmount(e.target.value)}
                  className="form-input text-xs py-2.5"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2 text-xs font-bold uppercase tracking-wider"
              >
                Tính toán mức giảm
              </button>
            </form>

            {testResult && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <span className="text-xs text-emerald-800 block font-semibold">Voucher hợp lệ!</span>
                <div className="text-sm font-bold text-emerald-900 mt-1 font-mono">
                  Được giảm: <span className="text-[#C5A059]">${testResult.discount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Thành tiền còn lại: <span className="font-bold text-gray-900">${testResult.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowTestModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in text-center">
            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa Voucher</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Xác nhận xóa vĩnh viễn voucher mã <span className="font-bold text-gray-800">{selectedPromotion?.code}</span>? Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedPromotion(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeletePromotion}
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
