import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Truck,
  Pencil,
  Trash2,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Clock,
  PackageCheck
} from 'lucide-react';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]); // for PO creation
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'orders'
  
  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Supplier Modals & Form
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Purchase Order Modal & Form
  const [showPOModal, setShowPOModal] = useState(false);
  const [poSupplierId, setPOSupplierId] = useState('');
  const [poItems, setPOItems] = useState([{ ingredientId: '', quantity: '', price: '' }]);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/suppliers', {
        params: { search, page, size: 8, sort: 'id,desc' }
      });
      if (res.data && res.data.success) {
        setSuppliers(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách nhà cung cấp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/suppliers/orders', {
        params: { search, page, size: 8 }
      });
      if (res.data && res.data.success) {
        setPurchaseOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách đơn đặt hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/api/admin/inventory/ingredients');
      if (res.data && res.data.success) {
        setIngredients(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    } else {
      fetchPurchaseOrders();
      fetchIngredients();
    }
  }, [activeTab, search, page]);

  // Handle Open Modals
  const handleOpenAddSupplier = () => {
    setSelectedSupplier(null);
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
    setFormError('');
    setFieldErrors({});
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (s) => {
    setSelectedSupplier(s);
    setCompany(s.company);
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setFormError('');
    setFieldErrors({});
    setShowSupplierModal(true);
  };

  const handleOpenPOModal = () => {
    fetchIngredients();
    setPOSupplierId('');
    setPOItems([{ ingredientId: '', quantity: '', price: '' }]);
    setFormError('');
    setFieldErrors({});
    setShowPOModal(true);
  };

  // Save Supplier with Validation
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!company.trim()) {
      newErrors.company = 'Tên nhà cung cấp / Công ty không được để trống.';
    } else if (company.trim().length < 3) {
      newErrors.company = 'Tên nhà cung cấp phải từ 3 ký tự trở lên.';
    }

    if (phone && phone.trim() && !/^[0-9]{9,11}$/.test(phone.trim())) {
      newErrors.phone = 'Số điện thoại phải bao gồm từ 9-11 chữ số.';
    }

    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Địa chỉ Email không đúng định dạng (VD: ncc@supplier.com).';
    }

    if (address && address.trim() && address.trim().length < 5) {
      newErrors.address = 'Địa chỉ giao dịch phải từ 5 ký tự trở lên.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        company: company.trim(),
        phone: phone.trim() ? phone.trim() : null,
        email: email.trim() ? email.trim() : null,
        address: address.trim() ? address.trim() : null
      };

      if (selectedSupplier) {
        const res = await api.put(`/api/admin/suppliers/${selectedSupplier.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật nhà cung cấp ${company} thành công.`, 'success');
          setShowSupplierModal(false);
          fetchSuppliers();
        }
      } else {
        const res = await api.post('/api/admin/suppliers', payload);
        if (res.data && res.data.success) {
          showToast(`Thêm nhà cung cấp ${company} thành công.`, 'success');
          setShowSupplierModal(false);
          fetchSuppliers();
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Lỗi lưu nhà cung cấp.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/suppliers/${selectedSupplier.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa nhà cung cấp ${selectedSupplier.company} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedSupplier(null);
        fetchSuppliers();
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa nhà cung cấp này do đang có đơn hàng thu mua liên quan.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Purchase Order Operations with Validations
  const addPOItemRow = () => {
    setPOItems([...poItems, { ingredientId: '', quantity: '', price: '' }]);
  };

  const updatePOItemRow = (idx, field, value) => {
    const next = [...poItems];
    next[idx][field] = value;
    setPOItems(next);

    // Clear specific field errors
    if (fieldErrors[`item_${idx}_${field}`]) {
      const newErr = { ...fieldErrors };
      delete newErr[`item_${idx}_${field}`];
      setFieldErrors(newErr);
    }
  };

  const removePOItemRow = (idx) => {
    setPOItems(poItems.filter((_, i) => i !== idx));
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!poSupplierId) {
      newErrors.poSupplierId = 'Vui lòng chọn Nhà Cung Cấp nhận đơn mua hàng.';
    }

    if (poItems.length === 0) {
      newErrors.poItems = 'Vui lòng thêm ít nhất một nguyên liệu mua.';
    } else {
      poItems.forEach((item, idx) => {
        if (!item.ingredientId) {
          newErrors[`item_${idx}_ingredientId`] = 'Bắt buộc chọn nguyên liệu.';
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0 || isNaN(parseFloat(item.quantity))) {
          newErrors[`item_${idx}_quantity`] = 'Số lượng mua phải lớn hơn 0.';
        }
        if (!item.price || parseFloat(item.price) <= 0 || isNaN(parseFloat(item.price))) {
          newErrors[`item_${idx}_price`] = 'Đơn giá mua phải lớn hơn 0.';
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        supplierId: Number(poSupplierId),
        items: poItems.map(item => ({
          ingredientId: Number(item.ingredientId),
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price)
        }))
      };

      const res = await api.post('/api/admin/suppliers/orders', payload);
      if (res.data && res.data.success) {
        showToast('Tạo đơn mua hàng (PO) mới thành công.', 'success');
        setShowPOModal(false);
        setPOSupplierId('');
        setPOItems([{ ingredientId: '', quantity: '', price: '' }]);
        setActiveTab('orders'); // Switch directly to orders tab!
        setPage(0);
        fetchPurchaseOrders();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Tạo đơn đặt hàng thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (poId, newStatus) => {
    try {
      const res = await api.put(`/api/admin/suppliers/orders/${poId}/status`, null, {
        params: { status: newStatus }
      });
      if (res.data && res.data.success) {
        let msg = `Đã cập nhật trạng thái đơn hàng PO-${poId} sang ${newStatus}`;
        if (newStatus === 'COMPLETED' || newStatus === 'DELIVERED') {
          msg = `Xác nhận nhận hàng thành công! Số lượng nguyên liệu đã được tự động cộng vào kho hàng.`;
        }
        showToast(msg, 'success');
        fetchPurchaseOrders();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật trạng thái đơn đặt hàng.', 'error');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 whitespace-nowrap shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Chờ giao hàng (Pending)</span>
          </span>
        );
      case 'COMPLETED':
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 whitespace-nowrap shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đã nhận hàng & Nhập kho (Completed)</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-red-50 text-red-900 border border-red-300 whitespace-nowrap shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Đã hủy đơn (Cancelled)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="relative space-y-6">
      
      {/* Toast Alert Stack */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold uppercase tracking-wider max-w-md animate-fade-in ${
              t.type === 'success' ? 'bg-[#4A121A] text-white border-[#C5A059]/40' : 'bg-red-800 text-white border-red-900'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Supplier & Procurement Control
          </span>
          <h2 className="text-2xl font-bold font-serif text-[#4A121A]">
            Quản Lý Nhà Cung Cấp & Đơn Thu Mua Nguyên Liệu
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveTab('suppliers'); setPage(0); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-[#4A121A] text-white border border-[#C5A059]/50 shadow-md'
                : 'bg-[#FAF7F2] text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Truck className="w-4 h-4 text-[#C5A059]" />
            <span>Danh Sách Nhà Cung Cấp</span>
          </button>

          <button
            onClick={() => { setActiveTab('orders'); setPage(0); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#4A121A] text-white border border-[#C5A059]/50 shadow-md'
                : 'bg-[#FAF7F2] text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 text-[#C5A059]" />
            <span>Đơn Mua Hàng (PO) ({purchaseOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={activeTab === 'suppliers' ? "Tìm theo tên nhà cung cấp, SĐT..." : "Tìm mã đơn PO, tên nhà cung cấp..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]"
          />
        </div>

        {activeTab === 'suppliers' ? (
          <button
            onClick={handleOpenAddSupplier}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#4A121A] text-white text-xs font-bold hover:bg-[#340b12] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#C5A059]/40"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" /> Thêm Nhà Cung Cấp Mới
          </button>
        ) : (
          <button
            onClick={handleOpenPOModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#4A121A] text-white text-xs font-bold hover:bg-[#340b12] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#C5A059]/40"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" /> Tạo Đơn Mua Hàng (PO) Mới
          </button>
        )}
      </div>

      {/* TAB 1: SUPPLIERS LIST */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500 font-bold text-sm">Đang tải danh sách nhà cung cấp...</div>
          ) : suppliers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm font-bold">Chưa có nhà cung cấp nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#4A121A] text-[#C5A059] uppercase tracking-wider text-[11px]">
                    <th className="p-4 font-serif">Mã NCC</th>
                    <th className="p-4 font-serif">Tên Công Ty / NCC</th>
                    <th className="p-4 font-serif">Số Điện Thoại</th>
                    <th className="p-4 font-serif">Email Liên Hệ</th>
                    <th className="p-4 font-serif">Địa Chỉ Giao Dịch</th>
                    <th className="p-4 text-center font-serif">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF7F2]/60 transition-all">
                      <td className="p-4 font-mono font-bold text-[#4A121A]">NCC-{s.id}</td>
                      <td className="p-4 font-bold text-[#0F172A]">{s.company}</td>
                      <td className="p-4 font-mono text-gray-600">{s.phone || '---'}</td>
                      <td className="p-4 font-mono text-gray-600">{s.email || '---'}</td>
                      <td className="p-4 text-gray-600">{s.address || '---'}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditSupplier(s)}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setSelectedSupplier(s); setShowDeleteConfirm(true); }}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer"
                            title="Xóa nhà cung cấp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS LIST & AUTO STOCK UPDATE */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D9] shadow-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500 font-bold text-sm">Đang tải danh sách đơn đặt hàng...</div>
          ) : purchaseOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm font-bold">Chưa có đơn đặt mua hàng nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#4A121A] text-[#C5A059] uppercase tracking-wider text-[11px]">
                    <th className="p-4 font-serif">Mã Đơn PO</th>
                    <th className="p-4 font-serif">Nhà Cung Cấp</th>
                    <th className="p-4 font-serif">Chi Tiết Nguyên Liệu Mua</th>
                    <th className="p-4 font-serif">Tổng Giá Trị</th>
                    <th className="p-4 font-serif">Trạng Thái Đơn Hàng</th>
                    <th className="p-4 text-center font-serif">Hành Động Xác Nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-[#FAF7F2]/60 transition-all">
                      <td className="p-4 font-mono font-bold text-[#4A121A]">PO-{po.id}</td>
                      <td className="p-4 font-bold text-[#0F172A]">{po.supplier?.company || '---'}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {po.items?.map((item, idx) => (
                            <div key={idx} className="text-[11px] text-gray-700 font-mono">
                              • <strong>{item.ingredient?.name}</strong>: {item.quantity} {item.ingredient?.unit} x {formatVND(item.price)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm text-[#4A121A]">{formatVND(po.totalAmount)}</td>
                      <td className="p-4 whitespace-nowrap">
                        {renderStatusBadge(po.status)}
                      </td>
                      <td className="p-4 text-center">
                        {po.status === 'PENDING' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateOrderStatus(po.id, 'COMPLETED')}
                              className="px-3.5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-emerald-600"
                              title="Xác nhận nhận hàng và tự động cộng vào tồn kho"
                            >
                              <PackageCheck className="w-4 h-4 text-white" />
                              <span>Xác Nhận Đã Nhận Hàng & Nhập Kho</span>
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(po.id, 'CANCELLED')}
                              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all cursor-pointer"
                              title="Hủy đơn đặt hàng"
                            >
                              <XCircle className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        )}
                        {(po.status === 'COMPLETED' || po.status === 'DELIVERED') && (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tồn kho đã được cộng tự động
                          </span>
                        )}
                        {po.status === 'CANCELLED' && (
                          <span className="text-gray-400 text-[11px] font-bold">Đã hủy</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SUPPLIER FORM WITH VALIDATIONS */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E8E2D9] shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#4A121A] font-serif">
                {selectedSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveSupplier} noValidate className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên Công Ty / Nhà Cung Cấp *</label>
                <input
                  type="text"
                  placeholder="VD: Paris Food Co. LTD"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (fieldErrors.company) setFieldErrors({ ...fieldErrors, company: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.company
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                  }`}
                />
                {fieldErrors.company && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.company}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Số Điện Thoại Hotline</label>
                <input
                  type="text"
                  placeholder="VD: 0988123456"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.phone
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                  }`}
                />
                {fieldErrors.phone && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Liên Hệ</label>
                <input
                  type="email"
                  placeholder="VD: contact@parisfood.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.email
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                  }`}
                />
                {fieldErrors.email && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Địa Chỉ Văn Phòng / Kho Hàng</label>
                <input
                  type="text"
                  placeholder="VD: 123 Đường Lê Duẩn, Quận 1, TP.HCM"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.address
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                  }`}
                />
                {fieldErrors.address && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.address}
                  </span>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#4A121A] text-white text-xs font-bold hover:bg-[#340b12] transition-all shadow-md cursor-pointer border border-[#C5A059]/40"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE PURCHASE ORDER (PO) WITH FULL VALIDATIONS */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-[#E8E2D9] shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#4A121A] font-serif flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C5A059]" /> Tạo Đơn Mua Hàng (PO) Mới
              </h3>
              <button onClick={() => setShowPOModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}

            <form onSubmit={handleCreatePO} noValidate className="space-y-5">
              
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Chọn Nhà Cung Cấp *</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => {
                    setPOSupplierId(e.target.value);
                    if (fieldErrors.poSupplierId) setFieldErrors({ ...fieldErrors, poSupplierId: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    fieldErrors.poSupplierId
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                  }`}
                >
                  <option value="">-- Chọn Nhà Cung Cấp Đảm Nhận --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.company} ({s.phone || 'Không SĐT'})</option>
                  ))}
                </select>
                {fieldErrors.poSupplierId && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.poSupplierId}
                  </span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-700">Nguyên Liệu Đặt Mua *</label>
                  <button
                    type="button"
                    onClick={addPOItemRow}
                    className="px-3 py-1 rounded-xl bg-[#4A121A] text-white text-[11px] font-bold hover:bg-[#340b12] cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> Thêm Nguyên Liệu
                  </button>
                </div>

                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-2">
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex-1 w-full">
                          <select
                            value={item.ingredientId}
                            onChange={(e) => updatePOItemRow(idx, 'ingredientId', e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                              fieldErrors[`item_${idx}_ingredientId`] ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300 bg-white'
                            }`}
                          >
                            <option value="">-- Chọn nguyên liệu kho --</option>
                            {ingredients.map(ing => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (Tồn: {ing.stockQuantity} {ing.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-32">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Số lượng"
                            value={item.quantity}
                            onChange={(e) => updatePOItemRow(idx, 'quantity', e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold ${
                              fieldErrors[`item_${idx}_quantity`] ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300 bg-white'
                            }`}
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <input
                            type="number"
                            step="1000"
                            placeholder="Đơn giá (VNĐ)"
                            value={item.price}
                            onChange={(e) => updatePOItemRow(idx, 'price', e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-xs font-bold ${
                              fieldErrors[`item_${idx}_price`] ? 'border-2 border-red-500 bg-red-50' : 'border border-gray-300 bg-white'
                            }`}
                          />
                        </div>

                        {poItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePOItemRow(idx)}
                            className="p-2 text-red-600 hover:text-red-800 cursor-pointer"
                            title="Xóa dòng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {(fieldErrors[`item_${idx}_ingredientId`] || fieldErrors[`item_${idx}_quantity`] || fieldErrors[`item_${idx}_price`]) && (
                        <div className="text-[10px] text-red-600 font-bold flex flex-wrap gap-2 pt-1 border-t border-red-100">
                          {fieldErrors[`item_${idx}_ingredientId`] && <span>• {fieldErrors[`item_${idx}_ingredientId`]}</span>}
                          {fieldErrors[`item_${idx}_quantity`] && <span>• {fieldErrors[`item_${idx}_quantity`]}</span>}
                          {fieldErrors[`item_${idx}_price`] && <span>• {fieldErrors[`item_${idx}_price`]}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#4A121A] text-white text-xs font-bold hover:bg-[#340b12] transition-all shadow-md cursor-pointer border border-[#C5A059]/40"
                >
                  Xác Nhận Tạo Đơn PO
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#E8E2D9] shadow-2xl p-6 space-y-4 text-center">
            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa Nhà Cung Cấp</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa nhà cung cấp <strong className="text-gray-800">{selectedSupplier?.company}</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedSupplier(null); }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteSupplier}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
