import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('GRID'); // GRID (Floor Plan) or TABLE (List)

  // Merging state
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [primaryTableId, setPrimaryTableId] = useState('');
  const [subTableIds, setSubTableIds] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSplitConfirm, setShowSplitConfirm] = useState(false);

  const [selectedTable, setSelectedTable] = useState(null);
  const [detailTable, setDetailTable] = useState(null);
  const [tableToSplit, setTableToSplit] = useState(null);

  // Form Fields (Add/Edit)
  const [tableCode, setTableCode] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [area, setArea] = useState('Tầng 1 (Main Hall)');
  const [capacity, setCapacity] = useState('4');
  const [tableType, setTableType] = useState('Thường');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState('');

  // Reservation Fields
  const [resCustomerName, setResCustomerName] = useState('');
  const [resCustomerPhone, setResCustomerPhone] = useState('');
  const [resTime, setResTime] = useState('');
  const [resSpecialRequests, setResSpecialRequests] = useState('');

  // Move Table Fields
  const [targetTableId, setTargetTableId] = useState('');

  // Error States
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/tables', {
        params: {
          search,
          area: areaFilter,
          status: statusFilter
        }
      });
      if (res.data && res.data.success) {
        const sortedTables = (res.data.data || []).sort((a, b) => a.id - b.id);
        setTables(sortedTables);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách bàn ăn', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [search, areaFilter, statusFilter]);

  // Open Add Modal
  const openAddModal = () => {
    setSelectedTable(null);
    setTableCode(`TBL-${Math.floor(100 + Math.random() * 900)}`);
    setTableNumber('');
    setArea('Tầng 1 (Main Hall)');
    setCapacity('4');
    setTableType('Thường');
    setNotes('');
    setStatus('AVAILABLE');
    setAssignedStaff('');
    setCurrentCustomer('');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const openEditModal = (t) => {
    setSelectedTable(t);
    setTableCode(t.tableCode || `TBL-${String(t.id).padStart(3, '0')}`);
    setTableNumber(t.tableNumber);
    setArea(t.area || 'Tầng 1 (Main Hall)');
    setCapacity(t.capacity ? String(t.capacity) : '4');
    setTableType(t.tableType || 'Thường');
    setNotes(t.notes || '');
    setStatus(t.status || 'AVAILABLE');
    setAssignedStaff(t.assignedStaff || '');
    setCurrentCustomer(t.currentCustomer || '');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  // Open Detail View Modal
  const openDetailModal = (t) => {
    setDetailTable(t);
    setShowDetailModal(true);
  };

  // Open Reserve Modal
  const openReserveModal = (t) => {
    setSelectedTable(t);
    setResCustomerName(t?.currentCustomer ? t.currentCustomer.split(' - ')[0] || '' : '');
    setResCustomerPhone(t?.currentCustomer ? t.currentCustomer.split(' - ')[1] || '' : '');
    setResTime(t?.reservationTime || new Date().toISOString().slice(0, 16));
    setResSpecialRequests(t?.specialRequests || '');
    setShowReserveModal(true);
  };

  // Open Move Table Modal
  const openMoveModal = (t) => {
    setSelectedTable(t);
    setTargetTableId('');
    setShowMoveModal(true);
  };

  // Open Merge Modal
  const openMergeModal = () => {
    setPrimaryTableId('');
    setSubTableIds([]);
    setShowMergeModal(true);
  };

  // Toggle Sub-table selection in Merge mode/modal
  const toggleSubTable = (id) => {
    const numId = Number(id);
    setSubTableIds((prev) =>
      prev.includes(numId) ? prev.filter((i) => i !== numId) : [...prev, numId]
    );
  };

  // Handle clicking a card directly on Floor Plan during Merge mode
  const handleCardClickInMergeMode = (id) => {
    const numId = Number(id);
    if (!primaryTableId) {
      setPrimaryTableId(String(numId));
      return;
    }

    if (numId === Number(primaryTableId)) {
      // Unset primary table
      setPrimaryTableId('');
      return;
    }

    toggleSubTable(numId);
  };

  // Save Table (Add / Edit) with Strict Validation
  const handleSaveTable = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    // 1. Validate Code
    if (tableCode && !/^[A-Za-z0-9_-]{2,20}$/.test(tableCode.trim())) {
      newErrors.tableCode = 'Mã bàn gồm 2-20 ký tự (chữ, số, -, _).';
    }

    // 2. Validate Table Name / Number
    if (!tableNumber || !tableNumber.trim()) {
      newErrors.tableNumber = 'Vui lòng nhập Tên bàn (VD: Bàn 101, VIP 01).';
    } else if (tableNumber.trim().length < 2 || tableNumber.trim().length > 50) {
      newErrors.tableNumber = 'Tên bàn phải từ 2 đến 50 ký tự.';
    }

    // 3. Validate Area
    if (!area || !area.trim()) {
      newErrors.area = 'Vui lòng chọn Khu vực bàn ăn.';
    }

    // 4. Validate Capacity
    if (!capacity || isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      newErrors.capacity = 'Vui lòng nhập Sức chứa hợp lệ (>0 khách).';
    } else if (parseInt(capacity) > 50) {
      newErrors.capacity = 'Sức chứa tối đa 50 khách.';
    }

    // 5. Validate Table Type
    if (!tableType || !tableType.trim()) {
      newErrors.tableType = 'Vui lòng chọn Loại bàn.';
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
        tableCode: tableCode.trim(),
        tableNumber: tableNumber.trim(),
        area: area.trim(),
        capacity: parseInt(capacity),
        tableType,
        notes: notes.trim(),
        assignedStaff: assignedStaff.trim() || null,
        currentCustomer: currentCustomer.trim() || null,
        status
      };

      if (selectedTable) {
        const res = await api.put(`/api/admin/tables/${selectedTable.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật bàn ${tableNumber} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchTables();
        }
      } else {
        const res = await api.post('/api/admin/tables', payload);
        if (res.data && res.data.success) {
          showToast(`Tạo bàn ăn ${tableNumber} mới thành công.`, 'success');
          setShowAddEditModal(false);
          fetchTables();
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bàn.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Reservation
  const handleSaveReservation = async (e) => {
    e.preventDefault();
    if (!resCustomerName.trim()) {
      showToast('Vui lòng nhập tên khách hàng đặt bàn.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const customerInfo = `${resCustomerName.trim()}${resCustomerPhone ? ` - ${resCustomerPhone.trim()}` : ''}`;
      const payload = {
        tableCode: selectedTable.tableCode,
        tableNumber: selectedTable.tableNumber,
        area: selectedTable.area,
        capacity: selectedTable.capacity,
        tableType: selectedTable.tableType,
        notes: selectedTable.notes,
        assignedStaff: selectedTable.assignedStaff,
        currentCustomer: customerInfo,
        reservationTime: resTime,
        specialRequests: resSpecialRequests.trim(),
        status: 'RESERVED'
      };

      const res = await api.put(`/api/admin/tables/${selectedTable.id}`, payload);
      if (res.data && res.data.success) {
        showToast(`Đặt bàn ${selectedTable.tableNumber} thành công cho khách ${resCustomerName}.`, 'success');
        setShowReserveModal(false);
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi đặt bàn.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Move Table Action
  const handleMoveTable = async () => {
    if (!targetTableId) {
      showToast('Vui lòng chọn bàn đích để chuyển sang.', 'error');
      return;
    }

    const targetT = tables.find(t => t.id === Number(targetTableId));
    if (!targetT) return;

    setActionLoading(true);
    try {
      await api.put(`/api/admin/tables/${targetT.id}`, {
        tableCode: targetT.tableCode,
        tableNumber: targetT.tableNumber,
        area: targetT.area,
        capacity: targetT.capacity,
        tableType: targetT.tableType,
        notes: selectedTable.notes,
        assignedStaff: selectedTable.assignedStaff,
        currentCustomer: selectedTable.currentCustomer,
        status: selectedTable.status === 'RESERVED' ? 'RESERVED' : 'OCCUPIED'
      });

      await api.put(`/api/admin/tables/${selectedTable.id}`, {
        tableCode: selectedTable.tableCode,
        tableNumber: selectedTable.tableNumber,
        area: selectedTable.area,
        capacity: selectedTable.capacity,
        tableType: selectedTable.tableType,
        notes: null,
        assignedStaff: null,
        currentCustomer: null,
        reservationTime: null,
        specialRequests: null,
        status: 'AVAILABLE'
      });

      showToast(`Chuyển từ ${selectedTable.tableNumber} sang ${targetT.tableNumber} thành công!`, 'success');
      setShowMoveModal(false);
      fetchTables();
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi chuyển bàn.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Table
  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/tables/${selectedTable.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa bàn ${selectedTable.tableNumber} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedTable(null);
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Không thể xóa bàn này.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Merge Tables Action
  const handleMergeTables = async () => {
    if (!primaryTableId) {
      showToast('Vui lòng chọn bàn đại diện chính cho nhóm ghép.', 'error');
      return;
    }
    if (subTableIds.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 bàn phụ để ghép cùng bàn chính.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const allMergedIds = [Number(primaryTableId), ...subTableIds.map(Number)];
      const payload = {
        primaryTableId: Number(primaryTableId),
        tableIdsToMerge: allMergedIds
      };

      const res = await api.post('/api/admin/tables/merge', payload);
      if (res.data && res.data.success) {
        showToast('Ghép các bàn ăn thành công.', 'success');
        setIsMergeMode(false);
        setShowMergeModal(false);
        setPrimaryTableId('');
        setSubTableIds([]);
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Ghép bàn thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Split Table Action
  const openSplitConfirm = (t) => {
    setTableToSplit(t);
    setShowSplitConfirm(true);
  };

  const handleSplitTable = async () => {
    if (!tableToSplit) return;
    setActionLoading(true);
    try {
      const targetId = tableToSplit.parentTableId ? tableToSplit.parentTableId : tableToSplit.id;
      const res = await api.post(`/api/admin/tables/split/${targetId}`);
      if (res.data && res.data.success) {
        showToast(`Tách nhóm bàn thành công.`, 'success');
        setShowSplitConfirm(false);
        setTableToSplit(null);
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Tách bàn thất bại.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const quickChangeStatus = async (tableId, currentNum, newStatus) => {
    try {
      const res = await api.put(`/api/admin/tables/${tableId}/status`, null, {
        params: { status: newStatus }
      });
      if (res.data && res.data.success) {
        showToast(`Đổi trạng thái ${currentNum} sang ${getStatusDetails(newStatus).text} thành công.`, 'success');
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi đổi trạng thái bàn.', 'error');
    }
  };

  // Calculate total capacity
  const primaryTableObj = tables.find(t => t.id === Number(primaryTableId));
  const primaryCap = primaryTableObj ? primaryTableObj.capacity : 0;
  const subCapSum = subTableIds.reduce((sum, id) => {
    const tbl = tables.find(t => t.id === id);
    return sum + (tbl ? tbl.capacity : 0);
  }, 0);
  const totalMergeCapacity = primaryCap + subCapSum;

  // 7 Standard Statuses Mapping
  const getStatusDetails = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { text: 'Trống', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
      case 'RESERVED':
        return { text: 'Đã đặt trước', color: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' };
      case 'OCCUPIED':
        return { text: 'Đang phục vụ', color: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-600' };
      case 'DIRTY':
        return { text: 'Chờ dọn', color: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'CLEANING':
        return { text: 'Đang vệ sinh', color: 'bg-yellow-50 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' };
      case 'MAINTENANCE':
        return { text: 'Bảo trì', color: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' };
      case 'OUT_OF_SERVICE':
        return { text: 'Ngừng sử dụng', color: 'bg-gray-100 text-gray-500 border-gray-300', dot: 'bg-gray-400' };
      default:
        return { text: status, color: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
    }
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
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Sơ đồ & Quản lý bàn ăn</h2>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#C5A059]/15 text-[#4A121A] border border-[#C5A059]/30">
              {tables.length} Bàn ăn
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Theo dõi sơ đồ 7 trạng thái trực quan, thực hiện Đặt bàn, Chuyển bàn, Ghép/Tách bàn tiện lợi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Toggle View Mode */}
          <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#E8E2D9]">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID' ? 'bg-white text-[#4A121A] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Sơ đồ
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-[#4A121A] shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Danh sách
            </button>
          </div>

          {/* Merge Button */}
          <button
            onClick={() => {
              if (isMergeMode) {
                setIsMergeMode(false);
                setPrimaryTableId('');
                setSubTableIds([]);
              } else {
                openMergeModal();
              }
            }}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              isMergeMode
                ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                : 'bg-white border-[#E8E2D9] text-[#4A121A] hover:bg-[#FAF7F2]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {isMergeMode ? 'Hủy ghép' : 'Ghép bàn ăn'}
          </button>

          {/* Add Table Button */}
          <button
            onClick={openAddModal}
            className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm bàn ăn
          </button>
        </div>
      </div>

      {/* Merge Selection Banner */}
      {isMergeMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
          <div className="text-xs text-amber-900 font-medium flex items-center gap-3 flex-wrap">
            <span className="font-bold bg-amber-200 text-amber-950 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <svg className="h-4 w-4 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Chế độ chọn bàn ghép trực tiếp:
            </span>
            <span>
              Bàn chính:{' '}
              {primaryTableId ? (
                <strong className="text-[#4A121A] font-bold underline">
                  {tables.find(t => t.id === Number(primaryTableId))?.tableNumber}
                </strong>
              ) : (
                <span className="italic text-gray-500">Bấm chọn 1 bàn làm bàn chính</span>
              )}
            </span>
            <span>• Bàn phụ đã chọn: <strong className="text-amber-950 font-bold">{subTableIds.length} bàn</strong></span>
            {primaryTableId && (
              <span>• Tổng sức chứa: <strong className="text-amber-950 font-bold text-sm">{totalMergeCapacity} Khách</strong></span>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setIsMergeMode(false);
                setPrimaryTableId('');
                setSubTableIds([]);
              }}
              className="px-3.5 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleMergeTables}
              disabled={!primaryTableId || subTableIds.length === 0 || actionLoading}
              className="px-4 py-1.5 bg-amber-700 text-white font-bold rounded-xl text-xs hover:bg-amber-800 disabled:opacity-40 cursor-pointer shadow-md"
            >
              Xác nhận ghép {subTableIds.length + (primaryTableId ? 1 : 0)} bàn
            </button>
          </div>
        </div>
      )}

      {/* Status Legend Bar */}
      <div className="restaurant-card p-3.5 mb-6 overflow-x-auto border border-[#E8E2D9]">
        <div className="flex items-center justify-between min-w-[700px] text-[11px] font-semibold text-gray-700 gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">7 Trạng thái:</span>
          {[
            { key: 'AVAILABLE', text: 'Trống', dot: 'bg-emerald-500' },
            { key: 'RESERVED', text: 'Đã đặt trước', dot: 'bg-sky-500' },
            { key: 'OCCUPIED', text: 'Đang phục vụ', dot: 'bg-rose-600' },
            { key: 'DIRTY', text: 'Chờ dọn', dot: 'bg-amber-500' },
            { key: 'CLEANING', text: 'Đang vệ sinh', dot: 'bg-yellow-500' },
            { key: 'MAINTENANCE', text: 'Bảo trì', dot: 'bg-purple-500' },
            { key: 'OUT_OF_SERVICE', text: 'Ngừng sử dụng', dot: 'bg-gray-400' }
          ].map((st) => (
            <div key={st.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50/80 border border-gray-100">
              <span className={`h-2 w-2 rounded-full ${st.dot}`}></span>
              <span>{st.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="restaurant-card p-4 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center border border-[#E8E2D9]">
        
        {/* Search with Fixed Icon Alignment */}
        <div className="w-full lg:w-80 relative">
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo Mã bàn, Số bàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
            className="form-input py-2 pr-3 text-xs placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Filters */}
        <div className="w-full lg:w-auto flex flex-wrap gap-4 items-center">
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khu vực:</span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
            >
              <option value="All">Tất cả khu vực</option>
              <option value="Tầng 1 (Main Hall)">Tầng 1 (Main Hall)</option>
              <option value="Tầng 2 (Sân thượng)">Tầng 2 (Sân thượng)</option>
              <option value="Phòng VIP 1">Phòng VIP 1</option>
              <option value="Khu Sân Vườn">Khu Sân Vườn</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="AVAILABLE">Trống (Available)</option>
              <option value="RESERVED">Đã đặt trước (Reserved)</option>
              <option value="OCCUPIED">Đang phục vụ (Occupied)</option>
              <option value="DIRTY">Chờ dọn (Dirty)</option>
              <option value="CLEANING">Đang vệ sinh (Cleaning)</option>
              <option value="MAINTENANCE">Bảo trì (Maintenance)</option>
              <option value="OUT_OF_SERVICE">Ngừng sử dụng (Out of service)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải sơ đồ bàn ăn...</span>
        </div>
      ) : tables.length === 0 ? (
        <div className="restaurant-card p-12 text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-sm font-medium">Không tìm thấy bàn ăn nào phù hợp với bộ lọc.</span>
        </div>
      ) : viewMode === 'GRID' ? (
        /* Visual Floor Plan Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((t) => {
            const stat = getStatusDetails(t.status);
            const isPrimary = Number(primaryTableId) === t.id;
            const isSubSelected = subTableIds.includes(t.id);
            const isMergedSub = t.parentTableId != null;
            const isMergedPrimary = t.mergedTableNumbers && t.mergedTableNumbers.length > 0;

            return (
              <div
                key={t.id}
                onClick={() => {
                  if (isMergeMode) handleCardClickInMergeMode(t.id);
                }}
                className={`restaurant-card p-4.5 flex flex-col justify-between relative group transition-all duration-300 ${
                  isMergeMode ? 'cursor-pointer hover:scale-[1.02]' : 'hover:border-[#C5A059]/60'
                } ${
                  isPrimary
                    ? 'ring-2 ring-amber-600 border-amber-600 bg-amber-100/40'
                    : isSubSelected
                    ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/40'
                    : isMergedPrimary
                    ? 'border-[#C5A059] bg-[#FAF7F2]/40'
                    : isMergedSub
                    ? 'border-sky-300 bg-sky-50/20'
                    : ''
                }`}
              >
                
                {/* Selection Badge for Merge mode */}
                {isMergeMode && (
                  <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                    {isPrimary ? (
                      <span className="text-[10px] bg-amber-700 text-white px-2 py-0.5 rounded-md font-bold uppercase shadow-2xs flex items-center gap-1">
                        👑 Bàn chính
                      </span>
                    ) : isSubSelected ? (
                      <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-md font-bold uppercase shadow-2xs flex items-center gap-1">
                        🔗 Bàn phụ
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-semibold border border-gray-200">
                        Bấm chọn
                      </span>
                    )}
                  </div>
                )}

                {/* Header info */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-[#C5A059]">
                      {t.tableCode || `TBL-${String(t.id).padStart(3, '0')}`}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{t.area}</span>
                  </div>
                  
                  {/* Status Pill */}
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${stat.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`}></span>
                    {stat.text}
                  </span>
                </div>

                {/* Table Details */}
                <div className="my-2 text-center py-2 bg-[#FAF7F2]/60 rounded-xl border border-[#E8E2D9]/40">
                  <h3 className="text-xl font-bold font-serif text-[#4A121A] tracking-wide flex items-center justify-center gap-1.5">
                    {t.tableNumber}
                    {isMergedPrimary && (
                      <span className="text-[9px] bg-[#C5A059] text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1" title="Bàn chính của nhóm ghép">
                        <span>👑</span> Ghép
                      </span>
                    )}
                    {isMergedSub && (
                      <span className="text-[9px] bg-sky-600 text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1" title="Bàn ghép phụ">
                        <span>🔗</span> Phụ
                      </span>
                    )}
                  </h3>
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5 flex justify-center items-center gap-2">
                    <span>Sức chứa: {t.capacity} Khách</span>
                    <span>•</span>
                    <span className="text-gray-600 font-bold">{t.tableType || 'Thường'}</span>
                  </div>

                  {t.currentCustomer && (
                    <div className="mt-2 mx-3 px-2 py-1 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-700 font-medium truncate flex items-center justify-center gap-1" title={t.currentCustomer}>
                      <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{t.currentCustomer}</span>
                    </div>
                  )}
                </div>

                {/* Merged Info Badge */}
                {isMergedPrimary && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 font-medium flex justify-between items-center">
                    <span>👑 <strong>Bàn chính ghép với:</strong> {t.mergedTableNumbers.join(', ')}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openSplitConfirm(t); }}
                      className="text-[9px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                    >
                      Tách
                    </button>
                  </div>
                )}
                {isMergedSub && (
                  <div className="mt-2 p-2 bg-sky-50 border border-sky-200 rounded-xl text-[10px] text-sky-900 font-medium flex justify-between items-center">
                    <span>🔗 <strong>Bàn ghép thuộc:</strong> {t.parentTableNumber}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openSplitConfirm(t); }}
                      className="text-[9px] font-bold text-sky-800 hover:text-sky-950 underline cursor-pointer"
                    >
                      Tách
                    </button>
                  </div>
                )}

                {/* Quick Actions Footer */}
                <div className="mt-3 pt-3 border-t border-[#E8E2D9]/40 flex justify-between items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Status Dropdown */}
                  {!isMergeMode && (
                    <select
                      value={t.status}
                      onChange={(e) => quickChangeStatus(t.id, t.tableNumber, e.target.value)}
                      className="bg-white border border-[#E8E2D9] rounded-lg text-[9px] px-1.5 py-1 font-bold text-gray-700 focus:outline-none focus:border-[#C5A059] shadow-2xs"
                    >
                      <option value="AVAILABLE">Trống</option>
                      <option value="RESERVED">Đã đặt trước</option>
                      <option value="OCCUPIED">Đang phục vụ</option>
                      <option value="DIRTY">Chờ dọn</option>
                      <option value="CLEANING">Đang vệ sinh</option>
                      <option value="MAINTENANCE">Bảo trì</option>
                      <option value="OUT_OF_SERVICE">Ngừng dùng</option>
                    </select>
                  )}

                  {/* Icon Action Buttons */}
                  <div className="flex items-center gap-1 ml-auto">
                    {!isMergeMode && (
                      <>
                        {/* Eye Detail */}
                        <button
                          onClick={() => openDetailModal(t)}
                          className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-[#4A121A] hover:border-[#C5A059] cursor-pointer shadow-2xs"
                          title="Xem chi tiết bàn"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Move Table */}
                        <button
                          onClick={() => openMoveModal(t)}
                          className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-sky-600 hover:bg-sky-50 cursor-pointer shadow-2xs"
                          title="Chuyển bàn"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>

                        {/* Reserve Table */}
                        <button
                          onClick={() => openReserveModal(t)}
                          className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-amber-600 hover:bg-amber-50 cursor-pointer shadow-2xs"
                          title="Đặt bàn trước"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-gray-900 cursor-pointer shadow-2xs"
                          title="Chỉnh sửa bàn"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => { setSelectedTable(t); setShowDeleteConfirm(true); }}
                          className="p-1.5 rounded-lg border border-red-100 bg-white text-red-500 hover:bg-red-50 cursor-pointer shadow-2xs"
                          title="Xóa bàn"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-1M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="restaurant-card overflow-hidden border border-[#E8E2D9]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E2D9] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã bàn</th>
                  <th className="py-3.5 px-5">Tên bàn ăn</th>
                  <th className="py-3.5 px-5">Khu vực</th>
                  <th className="py-3.5 px-5">Sức chứa</th>
                  <th className="py-3.5 px-5">Loại bàn</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5">Khách hàng</th>
                  <th className="py-3.5 px-5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]/40 text-xs font-medium text-gray-700">
                {tables.map((t) => {
                  const stat = getStatusDetails(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-5 font-mono font-bold text-[#C5A059]">
                        {t.tableCode || `TBL-${String(t.id).padStart(3, '0')}`}
                      </td>
                      <td className="py-3 px-5 font-serif font-bold text-[#4A121A]">
                        {t.tableNumber}
                      </td>
                      <td className="py-3 px-5 text-gray-600">{t.area}</td>
                      <td className="py-3 px-5 font-bold text-gray-800">{t.capacity} Khách</td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold">
                          {t.tableType || 'Thường'}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${stat.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${stat.dot}`}></span>
                          {stat.text}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-600">{t.currentCustomer || '---'}</td>
                      <td className="py-3 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openDetailModal(t)}
                            className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-[#4A121A] cursor-pointer shadow-2xs"
                            title="Xem chi tiết"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-gray-900 cursor-pointer shadow-2xs"
                            title="Chỉnh sửa"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setSelectedTable(t); setShowDeleteConfirm(true); }}
                            className="p-1.5 rounded-lg border border-red-100 bg-white text-red-500 hover:bg-red-50 cursor-pointer shadow-2xs"
                            title="Xóa"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-1M4 7h16" />
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
        </div>
      )}

      {/* Interactive Merge Table Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-amber-600"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                    <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif text-[#4A121A]">Ghép nhiều bàn ăn</h3>
                    <p className="text-[11px] text-gray-500">Gộp các bàn lẻ thành 1 nhóm đại diện duy nhất cho đoàn tiệc đông khách.</p>
                  </div>
                </div>
                <button onClick={() => setShowMergeModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                
                {/* Step 1: Pick Primary Table */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">1. Chọn Bàn Chính (Bàn đại diện tính hóa đơn) *</label>
                  <select
                    value={primaryTableId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrimaryTableId(val);
                      if (val) {
                        setSubTableIds(prev => prev.filter(id => id !== Number(val)));
                      }
                    }}
                    className="form-input text-xs py-2.5 font-semibold bg-[#FAF7F2] border-[#E8E2D9] rounded-xl w-full"
                  >
                    <option value="">-- Chọn 1 bàn ăn làm bàn chính --</option>
                    {tables.filter(t => !t.parentTableId).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.tableNumber} ({t.area} - {t.capacity} Khách - {getStatusDetails(t.status).text})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Pick Sub-tables */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    2. Tích chọn các Bàn phụ ghép cùng *
                  </label>

                  {!primaryTableId ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                      Vui lòng chọn <strong>Bàn chính</strong> ở bước 1 trước.
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto p-3 bg-gray-50/80 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tables
                        .filter(t => !t.parentTableId && t.id !== Number(primaryTableId))
                        .map((t) => {
                          const isSubSelected = subTableIds.includes(t.id);

                          return (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() => toggleSubTable(t.id)}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSubSelected
                                  ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-400 text-sky-950 font-bold'
                                  : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className={`h-4 w-4 rounded flex items-center justify-center border ${
                                  isSubSelected ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-gray-300'
                                }`}>
                                  {isSubSelected && (
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className="font-bold block">{t.tableNumber}</span>
                                  <span className="text-[10px] text-gray-400 block">{t.area} • {t.capacity} khách</span>
                                </div>
                              </div>
                              {isSubSelected && (
                                <span className="text-[9px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                                  Phụ ghép
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Realtime Summary Box */}
                {primaryTableId && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-900 font-semibold">
                    <div>
                      Nhóm ghép:{' '}
                      <span className="font-bold text-[#4A121A]">
                        {tables.find(t => t.id === Number(primaryTableId))?.tableNumber} (Chính)
                      </span>
                      {subTableIds.length > 0 && (
                        <span> + {subTableIds.map(id => tables.find(t => t.id === id)?.tableNumber).join(', ')}</span>
                      )}
                    </div>
                    <div className="text-amber-950">
                      Tổng sức chứa: <strong className="text-sm font-bold">{totalMergeCapacity} Khách</strong>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button type="button" onClick={() => setShowMergeModal(false)} className="btn-secondary py-2 px-4">
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleMergeTables}
                    disabled={!primaryTableId || subTableIds.length === 0 || actionLoading}
                    className="btn-primary py-2 px-5 bg-amber-700 hover:bg-amber-800 border-amber-700 text-white font-bold"
                  >
                    {actionLoading ? 'Đang ghép...' : 'Xác nhận ghép bàn'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Table Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#4A121A]"></div>
            
            <div className="p-6">
              <div className="mb-5 flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedTable ? `Sửa bàn ăn: ${tableNumber}` : 'Thêm bàn ăn mới'}
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

              <form noValidate onSubmit={handleSaveTable} className="space-y-3.5">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Mã bàn (Code)</label>
                    <input
                      type="text"
                      placeholder="VD: TBL-101"
                      value={tableCode}
                      onChange={(e) => {
                        setTableCode(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, tableCode: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.tableCode ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.tableCode && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.tableCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Tên bàn ăn *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Bàn 101, VIP 01..."
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, tableNumber: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.tableNumber ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.tableNumber && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.tableNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Khu vực *</label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50 border-[#E8E2D9] rounded-xl"
                    >
                      <option value="Tầng 1 (Main Hall)">Tầng 1 (Main Hall)</option>
                      <option value="Tầng 2 (Sân thượng)">Tầng 2 (Sân thượng)</option>
                      <option value="Phòng VIP 1">Phòng VIP 1</option>
                      <option value="Khu Sân Vườn">Khu Sân Vườn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Sức chứa (Khách) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="VD: 2, 4, 8..."
                      value={capacity}
                      onChange={(e) => {
                        setCapacity(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, capacity: null }));
                      }}
                      className={`form-input text-xs py-2 ${fieldErrors.capacity ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                    />
                    {fieldErrors.capacity && (
                      <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.capacity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Loại bàn *</label>
                    <select
                      value={tableType}
                      onChange={(e) => setTableType(e.target.value)}
                      className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50 border-[#E8E2D9] rounded-xl"
                    >
                      <option value="Thường">Loại Thường</option>
                      <option value="VIP">Loại VIP</option>
                      <option value="Phòng riêng">Phòng riêng</option>
                      <option value="Ngoài trời">Ngoài trời</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Trạng thái *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50 border-[#E8E2D9] rounded-xl"
                    >
                      <option value="AVAILABLE">Trống (Available)</option>
                      <option value="RESERVED">Đã đặt trước (Reserved)</option>
                      <option value="OCCUPIED">Đang phục vụ (Occupied)</option>
                      <option value="DIRTY">Chờ dọn (Dirty)</option>
                      <option value="CLEANING">Đang vệ sinh (Cleaning)</option>
                      <option value="MAINTENANCE">Bảo trì (Maintenance)</option>
                      <option value="OUT_OF_SERVICE">Ngừng sử dụng (Out of service)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Mô tả / Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú về vị trí hoặc góc bàn..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-2"
                  ></textarea>
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
                    {actionLoading ? 'Đang lưu...' : 'Lưu bàn ăn'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Table Details Modal */}
      {showDetailModal && detailTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2 bg-[#4A121A]"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start pb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/40 text-[#4A121A] flex items-center justify-center font-bold">
                    <svg className="h-5 w-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif text-[#4A121A]">{detailTable.tableNumber}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-[#C5A059] font-bold">{detailTable.tableCode}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-gray-500">{detailTable.area}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setShowDetailModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                
                {/* Status Indicator Bar */}
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] flex items-center justify-between">
                  <span className="font-bold text-gray-600 uppercase">Trạng thái hiện tại:</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getStatusDetails(detailTable.status).color}`}>
                    <span className={`h-2 w-2 rounded-full ${getStatusDetails(detailTable.status).dot}`}></span>
                    {getStatusDetails(detailTable.status).text}
                  </span>
                </div>

                {/* Properties Grid */}
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#E8E2D9]">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Sức chứa tối đa:</span>
                    <span className="font-bold text-gray-800 text-sm">{detailTable.capacity} Khách</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-0.5">Loại bàn:</span>
                    <span className="font-bold text-[#4A121A]">{detailTable.tableType || 'Thường'}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-0.5">Nhân viên phục vụ:</span>
                    <span className="font-semibold text-gray-700">{detailTable.assignedStaff || 'Chưa phân công'}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-0.5">Khách đang ngồi / Đặt:</span>
                    <span className="font-semibold text-gray-800">{detailTable.currentCustomer || 'Không có'}</span>
                  </div>
                </div>

                {detailTable.reservationTime && (
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
                    <span className="font-bold text-sky-900 block mb-1">📅 Thời gian khách đặt bàn:</span>
                    <span className="text-sky-800 font-mono font-semibold">{detailTable.reservationTime}</span>
                  </div>
                )}

                {detailTable.specialRequests && (
                  <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                    <span className="font-bold text-amber-900 block mb-1">⭐ Yêu cầu đặc biệt của khách:</span>
                    <span className="text-amber-800 font-medium">{detailTable.specialRequests}</span>
                  </div>
                )}

                {detailTable.notes && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Mô tả / Ghi chú bàn:</label>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                      {detailTable.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8E2D9] flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn-secondary py-1.5 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showReserveModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="h-2 bg-amber-600"></div>
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">Đặt bàn trước: {selectedTable.tableNumber}</h3>
                <button onClick={() => setShowReserveModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveReservation} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Tên khách hàng *</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A..."
                    value={resCustomerName}
                    onChange={(e) => setResCustomerName(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 0987654321..."
                    value={resCustomerPhone}
                    onChange={(e) => setResCustomerPhone(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Thời gian tới bàn</label>
                  <input
                    type="datetime-local"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Ghi chú yêu cầu đặc biệt</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Đặt nến sinh nhật, rượu vang đỏ..."
                    value={resSpecialRequests}
                    onChange={(e) => setResSpecialRequests(e.target.value)}
                    className="form-input text-xs py-2"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button type="button" onClick={() => setShowReserveModal(false)} className="btn-secondary py-2 px-4">
                    Hủy
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn-primary py-2 px-5 bg-amber-700 hover:bg-amber-800 border-amber-700">
                    {actionLoading ? 'Đang lưu...' : 'Xác nhận đặt bàn'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Move Table Modal */}
      {showMoveModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="h-2 bg-sky-600"></div>
            <div className="p-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">Chuyển bàn: {selectedTable.tableNumber}</h3>
                <button onClick={() => setShowMoveModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <p className="text-gray-600">
                  Chọn bàn ăn trống đích để chuyển thông tin <span className="font-bold text-gray-800">{selectedTable.tableNumber}</span> ({selectedTable.currentCustomer || 'Không khách'}) sang:
                </p>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Bàn đích *</label>
                  <select
                    value={targetTableId}
                    onChange={(e) => setTargetTableId(e.target.value)}
                    className="form-input text-xs py-2 font-medium bg-[#FAF7F2]/50"
                  >
                    <option value="">-- Chọn bàn ăn đích --</option>
                    {tables.filter(t => t.id !== selectedTable.id && t.status === 'AVAILABLE').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.tableNumber} ({t.area} - {t.capacity} Khách)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-[#E8E2D9] flex justify-end gap-3">
                  <button onClick={() => setShowMoveModal(false)} className="btn-secondary py-2 px-4">
                    Hủy
                  </button>
                  <button onClick={handleMoveTable} disabled={!targetTableId || actionLoading} className="btn-primary py-2 px-5 bg-sky-700 hover:bg-sky-800 border-sky-700">
                    {actionLoading ? 'Đang chuyển...' : 'Xác nhận chuyển bàn'}
                  </button>
                </div>
              </div>
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

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa bàn ăn</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn bàn <span className="font-bold text-gray-800">{selectedTable?.tableNumber}</span>? Thao tác này không thể hoàn tác.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedTable(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteTable}
                disabled={actionLoading}
                className="btn-primary bg-gradient-to-r from-red-700 to-red-800 border-red-800 text-white py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
              >
                {actionLoading ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Split Confirmation Modal */}
      {showSplitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in text-center">
            
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Tách bàn ăn ghép</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn tách nhóm bàn ghép <span className="font-bold text-gray-800">{tableToSplit?.tableNumber}</span> về các bàn đơn lẻ ban đầu?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowSplitConfirm(false); setTableToSplit(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSplitTable}
                disabled={actionLoading}
                className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
              >
                {actionLoading ? 'Đang tách...' : 'Đồng ý tách bàn'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
