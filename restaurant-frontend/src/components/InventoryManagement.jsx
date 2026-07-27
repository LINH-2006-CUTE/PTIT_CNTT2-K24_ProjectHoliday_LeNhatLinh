import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function InventoryManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'history', 'dashboard'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [detailDishes, setDetailDishes] = useState([]);
  const [detailHistory, setDetailHistory] = useState([]);

  // Form Fields (Add/Edit Ingredient)
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Thịt & Hải sản');
  const [unit, setUnit] = useState('kg');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [importPrice, setImportPrice] = useState('100000');
  const [supplierName, setSupplierName] = useState('Paris Food Co.');
  const [storageLocation, setStorageLocation] = useState('Kho đông Tầng 1');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Ticket Form Fields (Import / Export / Adjust)
  const [ticketCode, setTicketCode] = useState('');
  const [ticketQty, setTicketQty] = useState('');
  const [ticketUnitPrice, setTicketUnitPrice] = useState('');
  const [ticketSupplier, setTicketSupplier] = useState('');
  const [ticketPerformer, setTicketPerformer] = useState('Admin');
  const [ticketDate, setTicketDate] = useState('');
  const [ticketNote, setTicketNote] = useState('');

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/inventory/ingredients', {
        params: { search }
      });
      if (res.data && res.data.success) {
        const sortedIngredients = (res.data.data || []).sort((a, b) => b.id - a.id);
        setIngredients(sortedIngredients);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách nguyên liệu kho', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/inventory/history');
      if (res.data && res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải nhật ký lịch sử kho', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchHistory();
  }, [search]);

  // Open Add Ingredient Modal
  const openAddModal = () => {
    setSelectedIngredient(null);
    setCode(`ING-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setCategory('Thịt & Hải sản');
    setUnit('kg');
    setStockQuantity('0');
    setMinStockThreshold('5');
    setImportPrice('100000');
    setSupplierName('Paris Food Co.');
    setStorageLocation('Kho đông Tầng 1');
    setExpiryDate(new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10));
    setNotes('');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  // Open Edit Ingredient Modal
  const openEditModal = (ing) => {
    setSelectedIngredient(ing);
    setCode(ing.code || `ING-${String(ing.id).padStart(3, '0')}`);
    setName(ing.name || '');
    setCategory(ing.category || 'Thịt & Hải sản');
    setUnit(ing.unit || 'kg');
    setStockQuantity(String(ing.stockQuantity || 0));
    setMinStockThreshold(String(ing.minStockThreshold || 0));
    setImportPrice(ing.importPrice ? String(ing.importPrice) : '0');
    setSupplierName(ing.supplierName || 'Paris Food Co.');
    setStorageLocation(ing.storageLocation || 'Kho khô Tầng 1');
    setExpiryDate(ing.expiryDate || '');
    setNotes(ing.notes || '');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  // Open Ingredient Detail Modal (with Dishes & History)
  const openDetailModal = async (ing) => {
    setSelectedIngredient(ing);
    setDetailDishes([]);
    setDetailHistory([]);
    setShowDetailModal(true);

    try {
      const dishesRes = await api.get(`/api/admin/inventory/ingredients/${ing.id}/dishes`);
      if (dishesRes.data && dishesRes.data.success) {
        setDetailDishes(dishesRes.data.data || []);
      }
      const historyRes = await api.get(`/api/admin/inventory/history/${ing.id}`);
      if (historyRes.data && historyRes.data.success) {
        setDetailHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Stock Import Modal
  const openImportModal = (ing = null) => {
    const target = ing || ingredients[0];
    setSelectedIngredient(target);
    setTicketCode(`NK-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`);
    setTicketQty('10');
    setTicketUnitPrice(target?.importPrice ? String(target.importPrice) : '100000');
    setTicketSupplier(target?.supplierName || 'Paris Food Co.');
    setTicketPerformer('Admin Quản Trị');
    setTicketDate(new Date().toISOString().substring(0, 10));
    setTicketNote('Nhập kho nguyên liệu định kỳ');
    setFormError('');
    setFieldErrors({});
    setShowImportModal(true);
  };

  // Open Stock Export Modal
  const openExportModal = (ing = null) => {
    const target = ing || ingredients[0];
    setSelectedIngredient(target);
    setTicketCode(`XK-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`);
    setTicketQty('2');
    setTicketPerformer('Chef Trưởng Bếp');
    setTicketNote('Xuất kho chế biến thực đơn hôm nay');
    setFormError('');
    setFieldErrors({});
    setShowExportModal(true);
  };

  // Open Stock Adjust Modal
  const openAdjustModal = (ing = null) => {
    const target = ing || ingredients[0];
    setSelectedIngredient(target);
    setTicketCode(`DC-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`);
    setTicketQty(String(target ? target.stockQuantity : 0));
    setTicketPerformer('Manager Kiểm Kê');
    setTicketNote('Điều chỉnh sau kiểm kê kho thực tế');
    setFormError('');
    setFieldErrors({});
    setShowAdjustModal(true);
  };

  // Save Ingredient (Add / Edit) with Strict Field Validation
  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!name || !name.trim()) {
      newErrors.name = 'Vui lòng nhập Tên nguyên liệu (VD: Thịt Thăn Bò Wagyu A5).';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Tên nguyên liệu phải từ 2 ký tự trở lên.';
    }

    if (!unit || !unit.trim()) {
      newErrors.unit = 'Vui lòng nhập Đơn vị tính (Kg, g, Lít, Chai...).';
    }

    if (minStockThreshold === '' || isNaN(parseFloat(minStockThreshold)) || parseFloat(minStockThreshold) < 0) {
      newErrors.minStockThreshold = 'Nhập Ngưỡng tồn kho tối thiểu (>=0).';
    }

    if (!selectedIngredient && (stockQuantity === '' || isNaN(parseFloat(stockQuantity)) || parseFloat(stockQuantity) < 0)) {
      newErrors.stockQuantity = 'Vui lòng nhập Số lượng tồn kho ban đầu (>=0).';
    }

    if (importPrice === '' || isNaN(parseFloat(importPrice)) || parseFloat(importPrice) < 0) {
      newErrors.importPrice = 'Giá nhập phải là số không âm (>=0 VNĐ).';
    }

    if (!supplierName || !supplierName.trim()) {
      newErrors.supplierName = 'Vui lòng nhập Tên nhà cung cấp.';
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
        code: code.trim() || `ING-${Math.floor(100 + Math.random() * 900)}`,
        name: name.trim(),
        category,
        unit: unit.trim(),
        minStockThreshold: parseFloat(minStockThreshold),
        importPrice: parseFloat(importPrice),
        supplierName: supplierName.trim(),
        storageLocation: storageLocation.trim(),
        expiryDate: expiryDate ? expiryDate : null,
        notes: notes.trim() || null
      };

      if (selectedIngredient) {
        const res = await api.put(`/api/admin/inventory/ingredients/${selectedIngredient.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật nguyên liệu ${name} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchIngredients();
        }
      } else {
        payload.stockQuantity = parseFloat(stockQuantity || 0);
        const res = await api.post('/api/admin/inventory/ingredients', payload);
        if (res.data && res.data.success) {
          showToast(`Thêm mới nguyên liệu ${name} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchIngredients();
          fetchHistory();
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nguyên liệu.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Stock Import
  const handleStockImport = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    const qty = parseFloat(ticketQty);
    if (!ticketQty || isNaN(qty) || qty <= 0) {
      newErrors.ticketQty = 'Số lượng nhập phải lớn hơn 0.';
    }

    const price = parseFloat(ticketUnitPrice);
    if (ticketUnitPrice === '' || isNaN(price) || price < 0) {
      newErrors.ticketUnitPrice = 'Đơn giá nhập không hợp lệ.';
    }

    if (!ticketSupplier.trim()) {
      newErrors.ticketSupplier = 'Vui lòng nhập Nhà cung cấp.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setFormError('Vui lòng kiểm tra và sửa thông tin ô màu đỏ.');
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        ticketCode: ticketCode.trim(),
        quantity: qty,
        unitPrice: price,
        supplierName: ticketSupplier.trim(),
        performedBy: ticketPerformer.trim() || 'Admin',
        expiryDate: expiryDate ? expiryDate : null,
        note: ticketNote.trim() || 'Tạo phiếu nhập kho nguyên liệu'
      };

      const res = await api.post(`/api/admin/inventory/ingredients/${selectedIngredient.id}/stock-in`, payload);
      if (res.data && res.data.success) {
        showToast(`Nhập kho thành công +${qty} ${selectedIngredient.unit} cho ${selectedIngredient.name}.`, 'success');
        setShowImportModal(false);
        fetchIngredients();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Lỗi tạo phiếu nhập kho.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Stock Export
  const handleStockExport = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    const qty = parseFloat(ticketQty);
    if (!ticketQty || isNaN(qty) || qty <= 0) {
      newErrors.ticketQty = 'Số lượng xuất phải lớn hơn 0.';
    } else if (selectedIngredient && qty > selectedIngredient.stockQuantity) {
      newErrors.ticketQty = `Lỗi xuất kho: Số lượng xuất (${qty} ${selectedIngredient.unit}) lớn hơn tồn kho thực tế (${selectedIngredient.stockQuantity} ${selectedIngredient.unit}).`;
    }

    if (!ticketNote.trim()) {
      newErrors.ticketNote = 'Vui lòng nhập lý do xuất kho (VD: Chế biến món ăn, hủy hàng).';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setFormError('Vui lòng kiểm tra và sửa thông tin ô màu đỏ.');
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        ticketCode: ticketCode.trim(),
        quantity: qty,
        performedBy: ticketPerformer.trim() || 'Chef',
        note: ticketNote.trim()
      };

      const res = await api.post(`/api/admin/inventory/ingredients/${selectedIngredient.id}/stock-out`, payload);
      if (res.data && res.data.success) {
        const remaining = selectedIngredient.stockQuantity - qty;
        showToast(`Xuất kho thành công -${qty} ${selectedIngredient.unit} cho ${selectedIngredient.name}.`, 'success');
        
        if (remaining <= selectedIngredient.minStockThreshold) {
          setTimeout(() => {
            showToast(`⚠️ Cảnh báo: ${selectedIngredient.name} hiện chỉ còn ${remaining} ${selectedIngredient.unit} (Dưới định mức tối thiểu ${selectedIngredient.minStockThreshold} ${selectedIngredient.unit}).`, 'error');
          }, 400);
        }

        setShowExportModal(false);
        fetchIngredients();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Lỗi tạo phiếu xuất kho.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Stock Adjustment
  const handleStockAdjust = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    const qty = parseFloat(ticketQty);
    if (ticketQty === '' || isNaN(qty) || qty < 0) {
      newErrors.ticketQty = 'Số lượng kiểm kê thực tế không hợp lệ (>=0).';
    }

    if (!ticketNote.trim()) {
      newErrors.ticketNote = 'Vui lòng nhập lý do điều chỉnh tồn kho.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setFormError('Vui lòng kiểm tra và sửa thông tin ô màu đỏ.');
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        ticketCode: ticketCode.trim(),
        quantity: qty,
        performedBy: ticketPerformer.trim() || 'Manager',
        note: ticketNote.trim()
      };

      const res = await api.post(`/api/admin/inventory/ingredients/${selectedIngredient.id}/stock-adjustment`, payload);
      if (res.data && res.data.success) {
        showToast(`Điều chỉnh tồn kho ${selectedIngredient.name} thành ${qty} ${selectedIngredient.unit} thành công.`, 'success');
        setShowAdjustModal(false);
        fetchIngredients();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Lỗi điều chỉnh tồn kho.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Ingredient
  const handleDeleteIngredient = async () => {
    if (!selectedIngredient) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/inventory/ingredients/${selectedIngredient.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa nguyên liệu ${selectedIngredient.name} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedIngredient(null);
        fetchIngredients();
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa nguyên liệu này.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filters & Pagination Logic
  const filteredIngredients = ingredients.filter((ing) => {
    const matchCat = categoryFilter === 'All' || ing.category === categoryFilter;
    let matchStat = true;
    if (statusFilter === 'LOW_STOCK') {
      matchStat = ing.stockQuantity <= ing.minStockThreshold;
    } else if (statusFilter === 'EXPIRED') {
      matchStat = ing.expiryDate && new Date(ing.expiryDate) < new Date();
    } else if (statusFilter === 'NORMAL') {
      matchStat = ing.stockQuantity > ing.minStockThreshold && (!ing.expiryDate || new Date(ing.expiryDate) >= new Date());
    }
    return matchCat && matchStat;
  });

  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage) || 1;
  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dashboard Analytics Calculation
  const totalItemsCount = ingredients.length;
  const totalInventoryValue = ingredients.reduce((sum, ing) => {
    const price = ing.importPrice ? Number(ing.importPrice) : 0;
    return sum + ing.stockQuantity * price;
  }, 0);

  const lowStockCount = ingredients.filter((ing) => ing.stockQuantity <= ing.minStockThreshold).length;
  const expiredCount = ingredients.filter((ing) => ing.expiryDate && new Date(ing.expiryDate) < new Date()).length;

  const currentMonthHistory = history.filter((h) => {
    if (!h.transactionDate) return false;
    const d = new Date(h.transactionDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlyImportValue = currentMonthHistory
    .filter((h) => h.type === 'STOCK_IN')
    .reduce((sum, h) => sum + (h.quantity || 0) * (h.unitPrice ? Number(h.unitPrice) : 0), 0);

  const monthlyExportValue = currentMonthHistory
    .filter((h) => h.type === 'STOCK_OUT')
    .reduce((sum, h) => sum + (h.quantity || 0) * (h.unitPrice ? Number(h.unitPrice) : 0), 0);

  // Supplier ranking
  const supplierCounts = {};
  history.forEach((h) => {
    if (h.supplierName) {
      supplierCounts[h.supplierName] = (supplierCounts[h.supplierName] || 0) + 1;
    }
  });
  const topSupplier = Object.keys(supplierCounts).sort((a, b) => supplierCounts[b] - supplierCounts[a])[0] || 'Paris Food Co.';

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

      {/* Header & Main Actions */}
      <div className="mb-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-4">
        {/* Top Row: Title & Tab Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-4 border-b border-[#E8E2D9]/60">
          {/* Title */}
          <div className="pl-4 border-l-4 border-[#C5A059]">
            <h2 className="text-3xl font-extrabold font-serif bg-gradient-to-r from-[#4A121A] via-[#6b1d28] to-[#C5A059] bg-clip-text text-transparent">
              Quản lý Kho & Tồn kho
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 font-medium tracking-wide uppercase">
              Quản lý nguyên liệu Fine Dining, kiểm kê tự động & nhật ký thao tác Audit Log.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#F8F5F0] p-1.5 rounded-xl border border-[#E2D9CC] shadow-inner">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#C5A059] shadow-md'
                  : 'text-gray-600 hover:text-[#4A121A] hover:bg-white/60'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Danh sách kho
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#C5A059] shadow-md'
                  : 'text-gray-600 hover:text-[#4A121A] hover:bg-white/60'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Thống kê & Báo cáo
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#C5A059] shadow-md'
                  : 'text-gray-600 hover:text-[#4A121A] hover:bg-white/60'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nhật ký Audit Log
            </button>
          </div>
        </div>

        {/* Bottom Row: Action Buttons (Xuống dòng) */}
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <button
            onClick={() => openImportModal()}
            className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 border border-emerald-500/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nhập kho
          </button>

          <button
            onClick={() => openExportModal()}
            className="py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-800 hover:from-sky-700 hover:to-blue-900 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 border border-sky-500/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
            Xuất kho
          </button>

          <button
            onClick={openAddModal}
            className="py-2.5 px-4.5 bg-gradient-to-r from-[#4A121A] via-[#5c1620] to-[#7a1c2a] text-[#F5E6D3] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg border border-[#C5A059]/50 transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            <svg className="h-4.5 w-4.5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm nguyên liệu
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Card 1: Total Items */}
        <div className="bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5EFE6] border-t-4 border-t-[#4A121A] border-x border-b border-[#E8E2D9] rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Tổng nguyên liệu</span>
            <div className="h-7 w-7 rounded-lg bg-[#4A121A]/10 text-[#4A121A] flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <span className="text-2xl font-extrabold font-serif text-[#4A121A] mt-2 block">{totalItemsCount}</span>
        </div>

        {/* Card 2: Total Value */}
        <div className="bg-gradient-to-br from-white via-[#FAF5EB] to-[#F7EDDC] border-t-4 border-t-[#C5A059] border-x border-b border-[#E8E2D9] rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Giá trị tồn kho</span>
            <div className="h-7 w-7 rounded-lg bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-extrabold font-serif text-[#9E7A33] mt-2 block">{totalInventoryValue.toLocaleString()} VNĐ</span>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-white border-t-4 border-t-amber-500 border-x border-b border-amber-200/80 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">Sắp hết (Tồn thấp)</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <span className="text-2xl font-extrabold font-serif text-amber-900 mt-2 block">{lowStockCount} NL</span>
        </div>

        {/* Card 4: Expired */}
        <div className="bg-gradient-to-br from-rose-50/70 via-rose-50/30 to-white border-t-4 border-t-rose-500 border-x border-b border-rose-200/80 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block">Hết hạn sử dụng</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/15 text-rose-600 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="text-2xl font-extrabold font-serif text-rose-900 mt-2 block">{expiredCount} NL</span>
        </div>

        {/* Card 5: Monthly Stock In */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-emerald-50/30 to-white border-t-4 border-t-emerald-500 border-x border-b border-emerald-200/80 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Nhập trong tháng</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-extrabold font-serif text-emerald-900 mt-2 block">{monthlyImportValue.toLocaleString()} VNĐ</span>
        </div>

        {/* Card 6: Monthly Stock Out */}
        <div className="bg-gradient-to-br from-sky-50/70 via-sky-50/30 to-white border-t-4 border-t-sky-500 border-x border-b border-sky-200/80 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-widest block">Xuất trong tháng</span>
            <div className="h-7 w-7 rounded-lg bg-sky-500/15 text-sky-600 flex items-center justify-center">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-extrabold font-serif text-sky-900 mt-2 block">{monthlyExportValue.toLocaleString()} VNĐ</span>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        /* Dashboard Detailed Reports */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="restaurant-card p-5 border border-[#E8E2D9]">
              <h3 className="text-base font-bold font-serif text-[#4A121A] mb-3">🏆 Nhà cung cấp nhập nhiều nhất</h3>
              <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]/60">
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block">Đối tác chiến lược</span>
                <span className="text-xl font-bold font-serif text-gray-800 mt-1 block">{topSupplier}</span>
                <span className="text-[11px] text-gray-500 mt-1 block">Tỷ lệ cung ứng nguyên liệu tươi chiếm hơn 45% tổng kho.</span>
              </div>
            </div>

            <div className="restaurant-card p-5 border border-[#E8E2D9]">
              <h3 className="text-base font-bold font-serif text-[#4A121A] mb-3">⚠️ Nguyên liệu báo động (Cần mua)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ingredients.filter(i => i.stockQuantity <= i.minStockThreshold).map(ing => (
                  <div key={ing.id} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-950">{ing.name}</span>
                    <span className="text-amber-800 font-mono">Tồn: {ing.stockQuantity} {ing.unit} (Định mức: {ing.minStockThreshold})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="restaurant-card p-5 border border-[#E8E2D9]">
              <h3 className="text-base font-bold font-serif text-[#4A121A] mb-3">⏳ Nguyên liệu cận/hết hạn</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ingredients.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date()).map(ing => (
                  <div key={ing.id} className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-red-950">{ing.name}</span>
                    <span className="text-red-800 font-mono">Hạn: {ing.expiryDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'history' ? (
        /* Audit Log & History View */
        <div className="restaurant-card overflow-hidden border border-[#E8E2D9] animate-fade-in">
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex justify-between items-center">
            <h3 className="text-base font-bold font-serif text-[#4A121A]">Nhật ký thao tác & Lịch sử giao dịch Kho (Audit Log)</h3>
            <span className="text-xs text-gray-500 font-medium">{history.length} Thao tác đã ghi nhận</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mã phiếu</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Loại thao tác</th>
                  <th className="py-3 px-4">Nguyên liệu</th>
                  <th className="py-3 px-4">Số lượng</th>
                  <th className="py-3 px-4">Đơn giá / Thành tiền</th>
                  <th className="py-3 px-4">Nhà cung cấp</th>
                  <th className="py-3 px-4">Ghi chú / Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {history.map((h) => {
                  const isStockIn = h.type === 'STOCK_IN';
                  const isAdjust = h.type === 'ADJUSTMENT';
                  const qtyColor = isStockIn ? 'text-emerald-700 font-bold' : isAdjust ? 'text-purple-700 font-bold' : 'text-rose-700 font-bold';
                  const badgeColor = isStockIn
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isAdjust
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200';

                  const dateObj = h.transactionDate ? new Date(h.transactionDate) : new Date();
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateStr = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });

                  return (
                    <tr key={h.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-gray-500">
                        <span className="font-bold text-gray-800">{timeStr}</span>
                        <span className="block text-[10px] text-gray-400">{dateStr}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#C5A059]">{h.ticketCode || `LOG-${h.id}`}</td>
                      <td className="py-2.5 px-4 font-bold text-[#4A121A]">{h.performedBy || 'Admin'}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeColor}`}>
                          {isStockIn ? 'Nhập kho' : isAdjust ? 'Điều chỉnh' : 'Xuất kho'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-gray-800">{h.ingredient ? h.ingredient.name : '---'}</td>
                      <td className={`py-2.5 px-4 ${qtyColor}`}>
                        {isStockIn ? `+${h.quantity}` : h.quantity} {h.ingredient?.unit}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {h.unitPrice ? `${Number(h.unitPrice).toLocaleString()} VNĐ` : '---'}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">{h.supplierName || '---'}</td>
                      <td className="py-2.5 px-4 text-gray-500 italic max-w-xs truncate">{h.note || '---'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Table View with Search, Category Filter, and Pagination */
        <div className="space-y-4">
          
          {/* Toolbar & Filter Bar */}
          <div className="bg-white/90 backdrop-blur-md p-4 flex flex-col lg:flex-row gap-4 justify-between items-center border border-[#E8E2D9] rounded-2xl shadow-sm">
            {/* Search */}
            <div className="w-full lg:w-80 relative">
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-[#C5A059] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm theo Mã NL, Tên nguyên liệu..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '2.5rem' }}
                className="form-input py-2.5 pr-4 text-xs font-medium placeholder:text-gray-400 w-full bg-[#FAF7F2] border-[#E8E2D9] focus:border-[#4A121A] rounded-xl"
              />
            </div>

            <div className="w-full lg:w-auto flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Danh mục:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3.5 py-2 font-bold text-[#4A121A] focus:outline-none focus:border-[#4A121A] cursor-pointer shadow-2xs"
                >
                  <option value="All">Tất cả danh mục</option>
                  <option value="Thịt & Hải sản">Thịt & Hải sản</option>
                  <option value="Rau củ & Gia vị">Rau củ & Gia vị</option>
                  <option value="Bơ sữa & Phô mai">Bơ sữa & Phô mai</option>
                  <option value="Nông sản & Thô">Nông sản & Thô</option>
                  <option value="Đồ uống & Vang">Đồ uống & Vang</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Trạng thái tồn:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3.5 py-2 font-bold text-[#4A121A] focus:outline-none focus:border-[#4A121A] cursor-pointer shadow-2xs"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="NORMAL">Tồn kho bình thường</option>
                  <option value="LOW_STOCK">Cảnh báo sắp hết (Tồn thấp)</option>
                  <option value="EXPIRED">Cảnh báo đã hết hạn</option>
                </select>
              </div>

              {/* Items Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Hiển thị:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-2 font-bold text-[#4A121A] focus:outline-none focus:border-[#4A121A] cursor-pointer shadow-2xs"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="restaurant-card overflow-hidden border border-[#E8E2D9]">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải kho nguyên liệu...</span>
              </div>
            ) : paginatedIngredients.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span>Không tìm thấy nguyên liệu nào phù hợp.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8E2D9] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Mã NL</th>
                      <th className="py-3.5 px-4">Tên nguyên liệu</th>
                      <th className="py-3.5 px-4">Danh mục</th>
                      <th className="py-3.5 px-4">Tồn thực tế</th>
                      <th className="py-3.5 px-4">Định mức min</th>
                      <th className="py-3.5 px-4">Giá nhập gần nhất</th>
                      <th className="py-3.5 px-4">Nhà cung cấp</th>
                      <th className="py-3.5 px-4">Hạn sử dụng</th>
                      <th className="py-3.5 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9]/40 font-medium text-gray-700">
                    {paginatedIngredients.map((ing) => {
                      const isLow = ing.stockQuantity <= ing.minStockThreshold;
                      const isExp = ing.expiryDate && new Date(ing.expiryDate) < new Date();

                      return (
                        <tr key={ing.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#C5A059]">
                            {ing.code || `ING-${String(ing.id).padStart(3, '0')}`}
                          </td>
                          <td className="py-3 px-4 font-serif font-bold text-[#4A121A]">
                            {ing.name}
                            {isExp && (
                              <span className="ml-2 text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">Hết hạn</span>
                            )}
                            {isLow && !isExp && (
                              <span className="ml-2 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Sắp hết</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-semibold">{ing.category || 'Chưa phân loại'}</td>
                          <td className="py-3 px-4">
                            <span className={`font-bold text-sm ${isLow ? 'text-amber-700 font-extrabold' : 'text-gray-800'}`}>
                              {ing.stockQuantity} {ing.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-semibold">{ing.minStockThreshold} {ing.unit}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                            {ing.importPrice ? `${Number(ing.importPrice).toLocaleString()} VNĐ` : '---'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{ing.supplierName || '---'}</td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {ing.expiryDate ? (
                              <span className={isExp ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                {ing.expiryDate}
                              </span>
                            ) : (
                              '---'
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* View Detail */}
                              <button
                                onClick={() => openDetailModal(ing)}
                                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-[#4A121A] cursor-pointer shadow-2xs"
                                title="Xem chi tiết nguyên liệu"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              {/* Adjust Stock */}
                              <button
                                onClick={() => openAdjustModal(ing)}
                                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-purple-600 hover:bg-purple-50 cursor-pointer shadow-2xs"
                                title="Điều chỉnh tồn kho"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => openEditModal(ing)}
                                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-gray-900 cursor-pointer shadow-2xs"
                                title="Chỉnh sửa thông tin"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => { setSelectedIngredient(ing); setShowDeleteConfirm(true); }}
                                className="p-1.5 rounded-lg border border-red-100 bg-white text-red-500 hover:bg-red-50 cursor-pointer shadow-2xs"
                                title="Xóa nguyên liệu"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-1M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredIngredients.length > 0 && (
              <div className="p-3.5 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-gray-500 font-medium">
                  Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredIngredients.length)} trong tổng số <strong className="text-gray-800 font-bold">{filteredIngredients.length} nguyên liệu</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E8E2D9] bg-white font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    Trang trước
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold cursor-pointer ${
                          currentPage === p ? 'bg-[#4A121A] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[#E8E2D9] bg-white font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#4A121A]"></div>
            
            <div className="p-6">
              <div className="mb-5 flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedIngredient ? `Cập nhật nguyên liệu: ${name}` : 'Thêm nguyên liệu kho mới'}
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

              <form noValidate onSubmit={handleSaveIngredient} className="space-y-3.5 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Mã nguyên liệu (Code)</label>
                    <input
                      type="text"
                      placeholder="VD: ING-101..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="form-input text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tên nguyên liệu *</label>
                    <input
                      type="text"
                      placeholder="VD: Thịt Thăn Bò Wagyu A5..."
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setFieldErrors(prev => ({ ...prev, name: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.name ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Danh mục nguyên liệu *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50 border-[#E8E2D9] rounded-xl"
                    >
                      <option value="Thịt & Hải sản">Thịt & Hải sản</option>
                      <option value="Rau củ & Gia vị">Rau củ & Gia vị</option>
                      <option value="Bơ sữa & Phô mai">Bơ sữa & Phô mai</option>
                      <option value="Nông sản & Thô">Nông sản & Thô</option>
                      <option value="Đồ uống & Vang">Đồ uống & Vang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Đơn vị tính *</label>
                    <input
                      type="text"
                      placeholder="VD: Kg, g, Lít, Chai, Hộp..."
                      value={unit}
                      onChange={(e) => {
                        setUnit(e.target.value);
                        setFieldErrors(prev => ({ ...prev, unit: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.unit ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.unit && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.unit}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {!selectedIngredient && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Số lượng ban đầu *</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stockQuantity}
                        onChange={(e) => {
                          setStockQuantity(e.target.value);
                          setFieldErrors(prev => ({ ...prev, stockQuantity: null }));
                        }}
                        className={`form-input text-xs py-2 ${fieldErrors.stockQuantity ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.stockQuantity && (
                        <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.stockQuantity}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tồn tối thiểu (Báo động) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="5"
                      value={minStockThreshold}
                      onChange={(e) => {
                        setMinStockThreshold(e.target.value);
                        setFieldErrors(prev => ({ ...prev, minStockThreshold: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.minStockThreshold ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.minStockThreshold && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.minStockThreshold}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Giá nhập (VNĐ) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={importPrice}
                      onChange={(e) => {
                        setImportPrice(e.target.value);
                        setFieldErrors(prev => ({ ...prev, importPrice: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.importPrice ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.importPrice && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.importPrice}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nhà cung cấp *</label>
                    <input
                      type="text"
                      placeholder="VD: Paris Food Co., Fresh Farm..."
                      value={supplierName}
                      onChange={(e) => {
                        setSupplierName(e.target.value);
                        setFieldErrors(prev => ({ ...prev, supplierName: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.supplierName ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.supplierName && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.supplierName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Vị trí lưu trữ</label>
                    <input
                      type="text"
                      placeholder="VD: Kho đông Tầng 1 (Kệ A-01)"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      className="form-input text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Mô tả / Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về tiêu chuẩn bảo quản..."
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
                    {actionLoading ? 'Đang lưu...' : 'Lưu nguyên liệu'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Detail Modal (with Dishes & History) */}
      {showDetailModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#4A121A]"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start pb-3 border-b border-[#E8E2D9]">
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#4A121A] flex items-center gap-2">
                    {selectedIngredient.name}
                    <span className="text-xs font-mono text-[#C5A059] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#C5A059]/30">
                      {selectedIngredient.code || `ING-${selectedIngredient.id}`}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Danh mục: {selectedIngredient.category || 'Thịt & Hải sản'}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8E2D9]">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Số lượng tồn kho:</span>
                    <span className="font-bold text-[#4A121A] text-base">{selectedIngredient.stockQuantity} {selectedIngredient.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Giá nhập gần nhất:</span>
                    <span className="font-bold text-[#C5A059] text-base">
                      {selectedIngredient.importPrice ? `${Number(selectedIngredient.importPrice).toLocaleString()} VNĐ` : '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Vị trí lưu trữ:</span>
                    <span className="font-semibold text-gray-800">{selectedIngredient.storageLocation || 'Chưa xếp vị trí'}</span>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-gray-200">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Nhà cung cấp:</span>
                    <span className="font-bold text-gray-800">{selectedIngredient.supplierName || '---'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Hạn sử dụng:</span>
                    <span className="font-mono font-bold text-gray-800">{selectedIngredient.expiryDate || 'Không giới hạn'}</span>
                  </div>
                </div>

                {/* Dishes using this Ingredient */}
                <div>
                  <h4 className="font-bold text-[#4A121A] mb-2 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Món ăn sử dụng nguyên liệu này (Công thức Recipe):
                  </h4>
                  {detailDishes.length === 0 ? (
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 italic">Chưa có liên kết món ăn nào.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {detailDishes.map((d) => (
                        <span key={d.id} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-950 font-bold rounded-lg text-xs">
                          🍔 {d.name} ({Number(d.price).toLocaleString()} VNĐ)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* History Transactions */}
                <div>
                  <h4 className="font-bold text-[#4A121A] mb-2">Lịch sử Nhập / Xuất gần nhất:</h4>
                  {detailHistory.length === 0 ? (
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 italic">Chưa có giao dịch kho nào.</div>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {detailHistory.map((h) => (
                        <div key={h.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center text-[11px]">
                          <span className="font-mono text-gray-500">{h.transactionDate ? h.transactionDate.replace('T', ' ').substring(0, 16) : '---'}</span>
                          <span className={`font-bold ${h.type === 'STOCK_IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {h.type === 'STOCK_IN' ? `+${h.quantity}` : `-${h.quantity}`} {selectedIngredient.unit}
                          </span>
                          <span className="text-gray-600 font-semibold">{h.performedBy || 'Admin'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8E2D9] flex justify-end">
                <button onClick={() => setShowDetailModal(false)} className="btn-secondary py-1.5 px-5 text-xs font-bold uppercase">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#4A121A]"></div>
            
            <div className="p-6">
              <div className="mb-5 flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedIngredient ? `Cập nhật nguyên liệu: ${name}` : 'Thêm nguyên liệu kho mới'}
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

              <form noValidate onSubmit={handleSaveIngredient} className="space-y-3.5 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Mã nguyên liệu (Code)</label>
                    <input
                      type="text"
                      placeholder="VD: ING-101..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="form-input text-xs py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tên nguyên liệu *</label>
                    <input
                      type="text"
                      placeholder="VD: Thịt Thăn Bò Wagyu A5..."
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setFieldErrors(prev => ({ ...prev, name: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.name ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Danh mục nguyên liệu *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50 border-[#E8E2D9] rounded-xl"
                    >
                      <option value="Thịt & Hải sản">Thịt & Hải sản</option>
                      <option value="Rau củ & Gia vị">Rau củ & Gia vị</option>
                      <option value="Bơ sữa & Phô mai">Bơ sữa & Phô mai</option>
                      <option value="Nông sản & Thô">Nông sản & Thô</option>
                      <option value="Đồ uống & Vang">Đồ uống & Vang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Đơn vị tính *</label>
                    <input
                      type="text"
                      placeholder="VD: Kg, g, Lít, Chai, Hộp..."
                      value={unit}
                      onChange={(e) => {
                        setUnit(e.target.value);
                        setFieldErrors(prev => ({ ...prev, unit: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.unit ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.unit && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.unit}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {!selectedIngredient && (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Số lượng ban đầu *</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stockQuantity}
                        onChange={(e) => {
                          setStockQuantity(e.target.value);
                          setFieldErrors(prev => ({ ...prev, stockQuantity: null }));
                        }}
                        className={`form-input text-xs py-2 ${fieldErrors.stockQuantity ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.stockQuantity && (
                        <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.stockQuantity}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tồn tối thiểu (Báo động) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="5"
                      value={minStockThreshold}
                      onChange={(e) => {
                        setMinStockThreshold(e.target.value);
                        setFieldErrors(prev => ({ ...prev, minStockThreshold: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.minStockThreshold ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.minStockThreshold && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.minStockThreshold}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Giá nhập (VNĐ) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="100000"
                      value={importPrice}
                      onChange={(e) => {
                        setImportPrice(e.target.value);
                        setFieldErrors(prev => ({ ...prev, importPrice: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.importPrice ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.importPrice && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.importPrice}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nhà cung cấp *</label>
                    <input
                      type="text"
                      placeholder="VD: Paris Food Co., Fresh Farm..."
                      value={supplierName}
                      onChange={(e) => {
                        setSupplierName(e.target.value);
                        setFieldErrors(prev => ({ ...prev, supplierName: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.supplierName ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.supplierName && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.supplierName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Vị trí lưu trữ</label>
                    <input
                      type="text"
                      placeholder="VD: Kho đông Tầng 1 (Kệ A-01)"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      className="form-input text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Mô tả / Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về tiêu chuẩn bảo quản..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="btn-secondary py-2 px-4 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg cursor-pointer"
                  >
                    {actionLoading ? 'Đang lưu...' : 'Lưu nguyên liệu'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Import Modal (Tạo phiếu nhập kho) */}
      {showImportModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-emerald-700"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">Tạo phiếu Nhập kho</h3>
                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleStockImport} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mã phiếu nhập</label>
                  <input type="text" value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} className="form-input text-xs py-2 bg-gray-50 font-mono" />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chọn nguyên liệu nhập *</label>
                  <select
                    value={selectedIngredient.id}
                    onChange={(e) => {
                      const ing = ingredients.find(i => i.id === Number(e.target.value));
                      if (ing) {
                        setSelectedIngredient(ing);
                        setTicketUnitPrice(ing.importPrice ? String(ing.importPrice) : '100000');
                        setTicketSupplier(ing.supplierName || 'Paris Food Co.');
                      }
                    }}
                    className="form-input text-xs py-2 font-semibold bg-[#FAF7F2]"
                  >
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (Tồn hiện tại: {ing.stockQuantity} {ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số lượng nhập *</label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={ticketQty}
                      onChange={(e) => setTicketQty(e.target.value)}
                      className={`form-input text-xs py-2 ${fieldErrors.ticketQty ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.ticketQty && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.ticketQty}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Đơn giá (VNĐ) *</label>
                    <input
                      type="number"
                      min="0"
                      value={ticketUnitPrice}
                      onChange={(e) => setTicketUnitPrice(e.target.value)}
                      className={`form-input text-xs py-2 ${fieldErrors.ticketUnitPrice ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.ticketUnitPrice && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.ticketUnitPrice}</p>}
                  </div>
                </div>

                {/* Total amount summary */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center font-bold text-emerald-950">
                  <span>Thành tiền:</span>
                  <span className="text-sm">
                    {((parseFloat(ticketQty || 0) * parseFloat(ticketUnitPrice || 0)) || 0).toLocaleString()} VNĐ
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nhà cung cấp *</label>
                  <input
                    type="text"
                    value={ticketSupplier}
                    onChange={(e) => setTicketSupplier(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Người nhập *</label>
                    <input type="text" value={ticketPerformer} onChange={(e) => setTicketPerformer(e.target.value)} className="form-input text-xs py-2" />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ngày nhập *</label>
                    <input type="date" value={ticketDate} onChange={(e) => setTicketDate(e.target.value)} className="form-input text-xs py-2" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ghi chú nhập kho</label>
                  <textarea rows={2} value={ticketNote} onChange={(e) => setTicketNote(e.target.value)} className="form-input text-xs py-2" />
                </div>

                <div className="pt-3 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button type="button" onClick={() => setShowImportModal(false)} className="btn-secondary py-2 px-4">Hủy</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary py-2 px-5 bg-emerald-700 hover:bg-emerald-800 border-emerald-700 text-white font-bold">
                    {actionLoading ? 'Đang nhập...' : 'Xác nhận Nhập kho'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Export Modal (Tạo phiếu xuất kho) */}
      {showExportModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-sky-700"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">Tạo phiếu Xuất kho chế biến</h3>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleStockExport} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mã phiếu xuất</label>
                  <input type="text" value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} className="form-input text-xs py-2 bg-gray-50 font-mono" />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nguyên liệu xuất *</label>
                  <select
                    value={selectedIngredient.id}
                    onChange={(e) => {
                      const ing = ingredients.find(i => i.id === Number(e.target.value));
                      if (ing) setSelectedIngredient(ing);
                    }}
                    className="form-input text-xs py-2 font-semibold bg-[#FAF7F2]"
                  >
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} (Tồn khả dụng: {ing.stockQuantity} {ing.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Số lượng xuất kho * (Tối đa: {selectedIngredient.stockQuantity} {selectedIngredient.unit})
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={ticketQty}
                    onChange={(e) => setTicketQty(e.target.value)}
                    className={`form-input text-xs py-2 ${fieldErrors.ticketQty ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                  />
                  {fieldErrors.ticketQty && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.ticketQty}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Người thực hiện *</label>
                  <input type="text" value={ticketPerformer} onChange={(e) => setTicketPerformer(e.target.value)} className="form-input text-xs py-2" />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lý do xuất kho *</label>
                  <textarea
                    rows={2.5}
                    placeholder="VD: Xuất cho Bếp làm thực đơn tiệc, hủy hàng hỏng..."
                    value={ticketNote}
                    onChange={(e) => setTicketNote(e.target.value)}
                    className={`form-input text-xs py-2 ${fieldErrors.ticketNote ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                  />
                  {fieldErrors.ticketNote && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.ticketNote}</p>}
                </div>

                <div className="pt-3 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button type="button" onClick={() => setShowExportModal(false)} className="btn-secondary py-2 px-4">Hủy</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary py-2 px-5 bg-sky-700 hover:bg-sky-800 border-sky-700 text-white font-bold">
                    {actionLoading ? 'Đang xuất...' : 'Xác nhận Xuất kho'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal (Điều chỉnh tồn kho kiểm kê) */}
      {showAdjustModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-purple-700"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">Điều chỉnh tồn kho (Kiểm kê)</h3>
                <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleStockAdjust} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mã phiếu điều chỉnh</label>
                  <input type="text" value={ticketCode} onChange={(e) => setTicketCode(e.target.value)} className="form-input text-xs py-2 bg-gray-50 font-mono" />
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 font-semibold">
                  Nguyên liệu: <strong>{selectedIngredient.name}</strong> (Tồn sổ sách: {selectedIngredient.stockQuantity} {selectedIngredient.unit})
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số lượng tồn kho THỰC TẾ sau kiểm kê *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ticketQty}
                    onChange={(e) => setTicketQty(e.target.value)}
                    className={`form-input text-xs py-2 ${fieldErrors.ticketQty ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                  />
                  {fieldErrors.ticketQty && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.ticketQty}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Người kiểm kê thực hiện *</label>
                  <input type="text" value={ticketPerformer} onChange={(e) => setTicketPerformer(e.target.value)} className="form-input text-xs py-2" />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lý do điều chỉnh chênh lệch *</label>
                  <textarea
                    rows={2.5}
                    placeholder="VD: Hao hụt kiểm kê tháng 7, cân sai số lượng..."
                    value={ticketNote}
                    onChange={(e) => setTicketNote(e.target.value)}
                    className={`form-input text-xs py-2 ${fieldErrors.ticketNote ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                  />
                  {fieldErrors.ticketNote && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.ticketNote}</p>}
                </div>

                <div className="pt-3 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAdjustModal(false)} className="btn-secondary py-2 px-4">Hủy</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary py-2 px-5 bg-purple-700 hover:bg-purple-800 border-purple-700 text-white font-bold">
                    {actionLoading ? 'Đang điều chỉnh...' : 'Xác nhận Điều chỉnh'}
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
            
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-1M4 7h16" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa nguyên liệu kho</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn nguyên liệu <span className="font-bold text-gray-800">{selectedIngredient?.name}</span>? Thao tác này không thể hoàn tác.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedIngredient(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteIngredient}
                disabled={actionLoading}
                className="btn-primary bg-gradient-to-r from-red-700 to-red-800 border-red-800 text-white py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
              >
                {actionLoading ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
