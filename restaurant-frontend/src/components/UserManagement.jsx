import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function UserManagement() {
  // Data States
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([
    { id: 1, name: 'ROLE_ADMIN' },
    { id: 2, name: 'ROLE_MANAGER' },
    { id: 3, name: 'ROLE_STAFF' },
    { id: 4, name: 'ROLE_CUSTOMER' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter, Sort, Pagination States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Locked'
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form States
  const [selectedUser, setSelectedUser] = useState(null); // null for Add, user object for Edit
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return 'bg-rose-50 text-rose-800 border-rose-200/80';
      case 'ROLE_MANAGER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'ROLE_CASHIER':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'ROLE_CHEF':
        return 'bg-orange-50 text-orange-800 border-orange-200/80';
      case 'ROLE_WAITER':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
      case 'ROLE_STAFF':
        return 'bg-sky-50 text-sky-800 border-sky-200/80';
      case 'ROLE_CUSTOMER':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getRoleBadgeTitle = (roleName) => {
    if (!roleName) return '';
    const clean = roleName.replace('ROLE_', '');
    switch (clean) {
      case 'ADMIN': return 'Quản Trị Viên';
      case 'MANAGER': return 'Quản Lý';
      case 'CASHIER': return 'Thu Ngân';
      case 'CHEF': return 'Bếp Trưởng';
      case 'WAITER': return 'Phục Vụ';
      case 'STAFF': return 'Nhân Viên Bếp';
      case 'CUSTOMER': return 'Khách Hàng';
      default: return clean;
    }
  };
  const [actionLoading, setActionLoading] = useState(false);

  // Toast States
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const enabledParam = statusFilter === 'All' ? null : statusFilter === 'Active';
      const params = {
        search: search || null,
        role: roleFilter === 'All' ? null : roleFilter,
        enabled: enabledParam,
        page: page,
        size: pageSize,
        sort: sortBy
      };

      const response = await api.get('/api/admin/users', { params });
      if (response.data && response.data.success) {
        setUsers(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách người dùng. Vui lòng kiểm tra lại kết nối.');
      showToast('Tải danh sách người dùng thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/admin/users/roles');
      if (response.data && response.data.success) {
        setRolesList(response.data.data);
      }
    } catch (err) {
      console.warn('Fallback to static roles list.', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, roleFilter, statusFilter, sortBy, page, pageSize]);

  // Handle pagination triggers
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // reset page to 0 on search
  };

  // Lock / Unlock User Status
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.enabled;
      const response = await api.post(`/api/admin/users/${user.id}/toggle-status`, null, {
        params: { enabled: newStatus }
      });
      if (response.data && response.data.success) {
        showToast(
          `Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản ${user.fullName} thành công.`,
          'success'
        );
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể thay đổi trạng thái người dùng.';
      showToast(msg, 'error');
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await api.delete(`/api/admin/users/${selectedUser.id}`);
      if (response.data && response.data.success) {
        showToast(`Đã xóa tài khoản ${selectedUser.fullName} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        setPage(0);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể xóa tài khoản này.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Save User (Create or Update)
  const handleSaveUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    // 1. Email validation
    if (!selectedUser) {
      if (!email || !email.trim()) {
        newErrors.email = 'Vui lòng nhập địa chỉ Email.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          newErrors.email = 'Email không hợp lệ (Ví dụ: example@restaurant.com).';
        }
      }
    }

    // 2. Password validation (for creation)
    if (!selectedUser) {
      if (!password) {
        newErrors.password = 'Vui lòng nhập mật khẩu khởi tạo.';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(password)) {
        newErrors.password = 'Mật khẩu cần từ 8-72 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
      }
    }

    // 3. Full name validation
    if (!fullName || !fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Vui lòng nhập Họ và tên hợp lệ (tối thiểu 2 ký tự).';
    }

    // 4. Phone validation
    if (!phone || !phone.trim()) {
      newErrors.phone = 'Vui lòng nhập Số điện thoại.';
    } else {
      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Số điện thoại không hợp lệ (Ví dụ: 0901234567 hoặc +84901234567).';
      }
    }

    // 5. Role selection
    if (!assignedRoles || assignedRoles.length === 0) {
      newErrors.roles = 'Vui lòng chọn ít nhất một vai trò hệ thống.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      if (selectedUser) {
        // Update Action
        const payload = {
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : '',
          roles: assignedRoles
        };
        const response = await api.put(`/api/admin/users/${selectedUser.id}`, payload);
        if (response.data && response.data.success) {
          showToast(`Cập nhật thông tin tài khoản ${fullName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchUsers();
        }
      } else {
        // Create Action
        const payload = {
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone ? phone.trim() : '',
          roles: assignedRoles
        };
        const response = await api.post('/api/admin/users', payload);
        if (response.data && response.data.success) {
          showToast(`Tạo mới tài khoản ${fullName} thành công.`, 'success');
          setShowAddEditModal(false);
          setPage(0);
          fetchUsers();
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi hệ thống. Không thể lưu người dùng.';
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Password Action
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(newPassword)) {
      setFormError('Mật khẩu mới cần 8–72 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.post(`/api/admin/users/${selectedUser.id}/reset-password`, {
        newPassword: newPassword
      });
      if (response.data && response.data.success) {
        showToast(`Đặt lại mật khẩu cho ${selectedUser.fullName} thành công.`, 'success');
        setShowResetPwdModal(false);
        setSelectedUser(null);
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể đặt lại mật khẩu.';
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setSelectedUser(null);
    setEmail('');
    setFullName('');
    setPhone('');
    setPassword('');
    setAssignedRoles(['ROLE_CUSTOMER']);
    setFormError('');
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEmail(user.email);
    setFullName(user.fullName);
    setPhone(user.phone || '');
    setAssignedRoles(user.roles && user.roles.length > 0 ? [user.roles[0]] : ['ROLE_CUSTOMER']);
    setFormError('');
    setShowAddEditModal(true);
  };

  // Single role selection handler
  const handleRoleSelect = (roleName) => {
    setAssignedRoles([roleName]);
  };

  const getRoleDisplayName = (roleName) => {
    if (!roleName) return '';
    const clean = roleName.replace('ROLE_', '');
    if (clean === 'ADMIN') return 'Quản Trị Viên (Admin)';
    if (clean === 'MANAGER') return 'Quản Lý (Manager)';
    if (clean === 'CASHIER') return 'Thu Ngân (Cashier)';
    if (clean === 'CHEF') return 'Bếp Trưởng (Chef)';
    if (clean === 'WAITER') return 'Phục Vụ (Waiter)';
    if (clean === 'CUSTOMER') return 'Khách Hàng (Customer)';
    if (clean === 'STAFF') return 'Nhân Viên Bếp (Staff)';
    return clean;
  };

  const displayedUsers = users.filter((u) => {
    if (!search || !search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term))
    );
  });

  return (
    <div className="relative">
      
      {/* Toast Alert stack */}
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

      {/* Header and Controls */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý người dùng</h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Quản trị viên có thể xem, thêm, sửa, xóa, khóa tài khoản và thiết lập quyền hệ thống.
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="btn-primary self-start md:self-auto py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Thêm người dùng mới
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="restaurant-card p-5 mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-center">
          
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Từ khóa tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#C5A059] shadow-xs placeholder:text-gray-400"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vai trò (Role)</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              className="form-input text-xs py-2.5 cursor-pointer"
            >
              <option value="All">Tất cả vai trò</option>
              {rolesList.map((role) => (
                <option key={role.id} value={role.name}>
                  {getRoleDisplayName(role.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="form-input text-xs py-2.5 cursor-pointer"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Locked">Đang khóa</option>
            </select>
          </div>

        </div>
        
        <div className="mt-4 pt-3 border-t border-[#E8E2D9] flex justify-between items-center text-xs">
          <div className="text-gray-500 font-medium">
            {search && search.trim() ? (
              <span>Tìm thấy <span className="text-[#4A121A] font-bold">{displayedUsers.length}</span> kết quả phù hợp</span>
            ) : (
              <span>Tổng số: <span className="text-[#4A121A] font-bold">{totalElements}</span> người dùng</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A] cursor-pointer"
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 mr-1.5 uppercase tracking-wider font-semibold text-[9px]">Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                className="bg-transparent border-0 font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="createdAt,desc">Ngày tạo (Mới nhất)</option>
                <option value="createdAt,asc">Ngày tạo (Cũ nhất)</option>
                <option value="fullName,asc">Tên (A-Z)</option>
                <option value="fullName,desc">Tên (Z-A)</option>
                <option value="email,asc">Email (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="restaurant-card">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang kết xuất dữ liệu...</span>
          </div>
        ) : displayedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2D9] text-[10px] uppercase tracking-wider text-gray-400 font-bold bg-[#FAF7F2]/40">
                  <th className="py-4.5 px-6">Thông tin thành viên</th>
                  <th className="py-4.5 px-4">Số điện thoại</th>
                  <th className="py-4.5 px-4">Quyền truy cập</th>
                  <th className="py-4.5 px-4 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="py-4.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]/40 text-sm">
                {displayedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 font-serif text-base">{u.fullName}</span>
                        <span className="text-xs text-gray-400 font-mono mt-0.5">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-medium text-gray-600">
                      {u.phone || <span className="text-gray-300 font-sans text-xs italic">Chưa cập nhật</span>}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide whitespace-nowrap ${getRoleBadgeColor(
                              r
                            )}`}
                          >
                            {getRoleBadgeTitle(r)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider whitespace-nowrap ${
                          u.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${u.enabled ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {u.enabled ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      
                      {/* Lock / Unlock */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          u.enabled
                            ? 'text-red-700 border-red-100 hover:bg-red-50'
                            : 'text-[#1B3B2B] border-green-100 hover:bg-green-50'
                        }`}
                      >
                        {u.enabled ? (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(u)}
                        title="Chỉnh sửa tài khoản"
                        className="p-2 text-gray-700 border border-gray-100 hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Reset password */}
                      <button
                        onClick={() => { setSelectedUser(u); setFormError(''); setShowResetPwdModal(true); }}
                        title="Đặt lại mật khẩu"
                        className="p-2 text-[#C5A059] border border-[#C5A059]/10 hover:bg-[#C5A059]/5 rounded-lg transition-all cursor-pointer"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-5 0a2 2 0 012 2m-5 8a2 2 0 012-2h1.5a1 1 0 00.832-.445l2.633-3.95A1.667 1.667 0 0016.663 7h-6.33a4 4 0 100 8h.33" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => { setSelectedUser(u); setShowDeleteConfirm(true); }}
                        title="Xóa tài khoản"
                        className="p-2 text-red-600 border border-red-100 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-bold text-gray-500 font-serif">Không tìm thấy kết quả</h3>
            <p className="mt-1.5 text-xs text-gray-400">Không có người dùng nào khớp với các bộ lọc của bạn.</p>
          </div>
        )}

        {/* Table Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E8E2D9] px-6 py-4 text-xs font-medium">
            <span className="text-[#6E6564]">
              Trang <span className="text-[#4A121A] font-bold">{page + 1}</span> trên <span className="font-bold">{totalPages}</span> (Tổng cộng {totalElements} thành viên)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary py-1.5 px-3.5 text-xs"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                Trước
              </button>
              <button
                type="button"
                className="btn-secondary py-1.5 px-3.5 text-xs"
                disabled={page === totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            {/* Top gold bar */}
            <div className="h-2.5 bg-[#C5A059]"></div>
            
            <div className="p-7">
              <div className="mb-6 flex justify-between items-center pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                </h3>
                <button
                  onClick={() => setShowAddEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form noValidate onSubmit={handleSaveUserSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Địa chỉ Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    disabled={!!selectedUser}
                    placeholder="example@restaurant.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: null }));
                    }}
                    className={`form-input text-xs py-2.5 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 ${
                      fieldErrors.email ? 'is-invalid' : ''
                    }`}
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

                {!selectedUser && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Mật khẩu khởi tạo <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Mật khẩu (8-72 ký tự, đủ chữ hoa, số, ký tự đặc biệt)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: null }));
                      }}
                      className={`form-input text-xs py-2.5 ${
                        fieldErrors.password ? 'is-invalid' : ''
                      }`}
                    />
                    {fieldErrors.password && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{fieldErrors.password}</span>
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Họ và tên <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, fullName: null }));
                    }}
                    className={`form-input text-xs py-2.5 ${
                      fieldErrors.fullName ? 'is-invalid' : ''
                    }`}
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Số điện thoại <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0901234567"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    className={`form-input text-xs py-2.5 ${
                      fieldErrors.phone ? 'is-invalid' : ''
                    }`}
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
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Vai trò trên hệ thống <span className="text-red-600">*</span>
                  </label>
                  <div className={`grid grid-cols-2 gap-2.5 bg-[#FAF7F2] p-3.5 rounded-xl border ${fieldErrors.roles ? 'border-red-500 bg-red-50/20' : 'border-[#E8E2D9]'}`}>
                    {rolesList.map((role) => {
                      const isSelected = assignedRoles.includes(role.name);
                      return (
                        <label
                          key={role.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white border-[#8C3A27] text-[#8C3A27] shadow-xs'
                              : 'border-transparent text-gray-700 hover:bg-white/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="userRole"
                            checked={isSelected}
                            onChange={() => {
                              handleRoleSelect(role.name);
                              setFieldErrors((prev) => ({ ...prev, roles: null }));
                            }}
                            className="h-4 w-4 text-[#8C3A27] focus:ring-[#8C3A27] cursor-pointer accent-[#8C3A27]"
                          />
                          <span>{getRoleDisplayName(role.name)}</span>
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.roles && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fieldErrors.roles}</span>
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3.5 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
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

      {/* Reset Password Modal */}
      {showResetPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="h-2 bg-[#C5A059]"></div>
            
            <div className="p-7">
              <div className="mb-5 flex justify-between items-center pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-lg font-bold font-serif text-[#4A121A]">
                  Đặt lại mật khẩu: {selectedUser?.fullName}
                </h3>
                <button
                  onClick={() => setShowResetPwdModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Mật khẩu mới <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu (8-72 ký tự, đủ chữ hoa, số, ký tự đặc biệt)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Xác nhận mật khẩu mới <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowResetPwdModal(false)}
                    className="btn-secondary py-2 px-4 text-xs uppercase tracking-wider font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-accent py-2 px-4.5 text-xs uppercase tracking-wider font-bold text-white shadow-lg"
                  >
                    {actionLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
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

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xác nhận xóa tài khoản</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <span className="font-bold text-gray-800">{selectedUser?.fullName}</span> ({selectedUser?.email})? Thao tác này không thể hoàn tác.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
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
