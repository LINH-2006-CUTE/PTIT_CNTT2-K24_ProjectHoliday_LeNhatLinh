import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals & Forms
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formError, setFormError] = useState('');

  // Toast
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        api.get('/api/admin/roles'),
        api.get('/api/admin/roles/permissions')
      ]);

      if (rolesRes.data && rolesRes.data.success) {
        const sortedRoles = [...rolesRes.data.data].sort((a, b) => b.id - a.id);
        setRoles(sortedRoles);
      }
      if (permRes.data && permRes.data.success) {
        setPermissions(permRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải vai trò và quyền hạn. Vui lòng thử lại.');
      showToast('Tải dữ liệu thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setSelectedRole(null);
    setRoleName('');
    setSelectedPermissions([]);
    setFormError('');
    setShowAddEditModal(true);
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions.map((p) => p.name));
    setFormError('');
    setShowAddEditModal(true);
  };

  const handlePermissionToggle = (permName) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const isSystemRole = (name) => {
    return name === 'ROLE_ADMIN' || name === 'ROLE_MANAGER' || name === 'ROLE_STAFF' || name === 'ROLE_CUSTOMER';
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

  const getRoleHeaderStyle = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return {
          bg: 'bg-rose-50 border-rose-200/80',
          title: 'text-rose-900',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          iconBg: 'bg-rose-100 text-rose-700'
        };
      case 'ROLE_MANAGER':
        return {
          bg: 'bg-emerald-50 border-emerald-200/80',
          title: 'text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          iconBg: 'bg-emerald-100 text-emerald-700'
        };
      case 'ROLE_CASHIER':
        return {
          bg: 'bg-amber-50 border-amber-200/80',
          title: 'text-amber-900',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          iconBg: 'bg-amber-100 text-amber-700'
        };
      case 'ROLE_CHEF':
        return {
          bg: 'bg-orange-50 border-orange-200/80',
          title: 'text-orange-900',
          badge: 'bg-orange-100 text-orange-800 border-orange-300',
          iconBg: 'bg-orange-100 text-orange-700'
        };
      case 'ROLE_WAITER':
        return {
          bg: 'bg-indigo-50 border-indigo-200/80',
          title: 'text-indigo-900',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          iconBg: 'bg-indigo-100 text-indigo-700'
        };
      case 'ROLE_STAFF':
        return {
          bg: 'bg-sky-50 border-sky-200/80',
          title: 'text-sky-900',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          iconBg: 'bg-sky-100 text-sky-700'
        };
      case 'ROLE_CUSTOMER':
        return {
          bg: 'bg-stone-50 border-stone-200',
          title: 'text-stone-900',
          badge: 'bg-stone-200 text-stone-700 border-stone-300',
          iconBg: 'bg-stone-200 text-stone-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          title: 'text-gray-900',
          badge: 'bg-gray-100 text-gray-700 border-gray-300',
          iconBg: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const renderRoleIcon = (roleName) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'ROLE_MANAGER':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'ROLE_CASHIER':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ROLE_CHEF':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.605 15.12a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'ROLE_WAITER':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'ROLE_STAFF':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6" />
          </svg>
        );
      case 'ROLE_CUSTOMER':
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const renderPermissionBadge = (permName, description) => {
    if (!permName) return null;
    const name = permName.toUpperCase();
    let icon = null;
    let label = permName;

    if (name.includes('USER')) {
      label = 'Quản lý người dùng';
      icon = (
        <svg className="h-3.5 w-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (name.includes('EMPLOYEE')) {
      label = 'Quản lý nhân sự';
      icon = (
        <svg className="h-3.5 w-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('ROLE')) {
      label = 'Vai trò & Phân quyền';
      icon = (
        <svg className="h-3.5 w-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    } else if (name.includes('MENU') || name.includes('DISH') || name.includes('CATEGORY')) {
      label = 'Quản lý thực đơn';
      icon = (
        <svg className="h-3.5 w-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    } else if (name.includes('TABLE')) {
      label = 'Quản lý sơ đồ bàn';
      icon = (
        <svg className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    } else if (name.includes('RESERVATION')) {
      label = 'Quản lý đặt bàn';
      icon = (
        <svg className="h-3.5 w-3.5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (name.includes('ORDER') || name.includes('POS')) {
      label = 'Gọi món & Thanh toán';
      icon = (
        <svg className="h-3.5 w-3.5 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (name.includes('KITCHEN')) {
      label = 'Điều phối Bếp';
      icon = (
        <svg className="h-3.5 w-3.5 text-orange-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      );
    } else if (name.includes('INVENTORY') || name.includes('STOCK')) {
      label = 'Quản lý kho hàng';
      icon = (
        <svg className="h-3.5 w-3.5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    } else if (name.includes('REPORT') || name.includes('DASHBOARD')) {
      label = 'Xem báo cáo & Thống kê';
      icon = (
        <svg className="h-3.5 w-3.5 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      );
    } else {
      icon = (
        <svg className="h-3.5 w-3.5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <span
        key={permName}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-semibold border border-[#E8E2D9] shadow-2xs hover:border-[#C5A059] transition-all"
        title={description || permName}
      >
        {icon}
        <span>{label}</span>
      </span>
    );
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setFormError('');

    let formattedName = roleName.trim().toUpperCase();
    if (!formattedName) {
      setFormError('Vui lòng nhập tên vai trò (ví dụ: ROLE_SHIFT_LEADER).');
      return;
    }

    if (!formattedName.startsWith('ROLE_')) {
      formattedName = 'ROLE_' + formattedName;
    }

    if (!/^[A-Z0-9_]+$/.test(formattedName)) {
      setFormError('Tên vai trò chỉ được gồm chữ cái in hoa, chữ số và dấu gạch dưới (_).');
      return;
    }

    if (selectedPermissions.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 quyền hạn (Permission) cho vai trò này.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        name: formattedName,
        permissionNames: selectedPermissions
      };

      if (selectedRole) {
        // Edit
        const res = await api.put(`/api/admin/roles/${selectedRole.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật vai trò ${roleName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchData();
        }
      } else {
        // Add
        const res = await api.post('/api/admin/roles', payload);
        if (res.data && res.data.success) {
          showToast(`Thêm vai trò ${roleName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu vai trò.';
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/roles/${selectedRole.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa vai trò ${selectedRole.name} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedRole(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể xóa vai trò này.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

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

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý vai trò & Phân quyền</h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Admin định nghĩa vai trò hệ thống và gán các quyền hạn (Permissions) chi tiết tương ứng (RBAC).
          </p>
        </div>
        
        <button
          onClick={openAddModal}
          className="btn-primary self-start md:self-auto py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Thêm vai trò mới
        </button>
      </div>

      {error && (
        <div className="restaurant-card p-6 text-center text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Main Roles Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải cấu hình RBAC...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {roles.map((role) => {
            const style = getRoleHeaderStyle(role.name);
            const isSystem = isSystemRole(role.name);
            return (
              <div
                key={role.id}
                className="restaurant-card overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Bar */}
                  <div className={`p-4.5 border-b flex items-center justify-between ${style.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${style.iconBg}`}>
                        {renderRoleIcon(role.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-serif font-bold ${style.title}`}>
                            {getRoleBadgeTitle(role.name)}
                          </h3>
                          <span className="text-xs text-gray-400 font-mono font-medium">
                            ({role.name.replace('ROLE_', '')})
                          </span>
                        </div>
                        {isSystem && (
                          <span className={`inline-block mt-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${style.badge}`}>
                            Hệ Thống Bảo Vệ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2 text-gray-600 hover:text-[#4A121A] bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer shadow-2xs transition-all"
                        title="Sửa vai trò & Cấu hình quyền"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {!isSystem && (
                        <button
                          onClick={() => { setSelectedRole(role); setShowDeleteConfirm(true); }}
                          className="p-2 text-red-600 hover:text-red-800 bg-white border border-red-200 hover:bg-red-50 rounded-xl cursor-pointer shadow-2xs transition-all"
                          title="Xóa vai trò"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body - Permissions List */}
                  <div className="p-5">
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                      TẬP QUYỀN HẠN ĐƯỢC CẤP ({role.permissions ? role.permissions.length : 0})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map((p) => (
                          <React.Fragment key={p.id}>
                            {renderPermissionBadge(p.name, p.description)}
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 w-full text-center">
                          Chưa có quyền hạn nào được cấp.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-[#FAF7F2]/60 border-t border-[#E8E2D9]/60 flex justify-between items-center text-[10px] text-gray-400 font-mono font-medium">
                  <span>ROLE_ID-{String(role.id).padStart(3, '0')}</span>
                  <span className="text-gray-500 font-sans font-bold">
                    {role.permissions ? `${role.permissions.length} Quyền` : '0 Quyền'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#C5A059]"></div>
            
            <div className="p-7">
              <div className="mb-6 flex justify-between items-center pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
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

              <form onSubmit={handleSaveRole} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Tên vai trò <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={selectedRole && isSystemRole(selectedRole.name)}
                    placeholder="CHEF, COUNTER, VALET..."
                    value={roleName.replace('ROLE_', '')}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="form-input text-xs py-2.5 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  {selectedRole && isSystemRole(selectedRole.name) && (
                    <span className="text-[10px] text-gray-400 mt-1 block">Không thể đổi tên vai trò hệ thống mặc định.</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Các quyền truy cập (Permissions)
                  </label>
                  <div className="space-y-2 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9] max-h-[250px] overflow-y-auto">
                    {permissions.map((p) => (
                      <label key={p.id} className="flex items-start gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer p-1 rounded hover:bg-white/50">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(p.name)}
                          onChange={() => handlePermissionToggle(p.name)}
                          className="h-4.5 w-4.5 rounded text-[#4A121A] focus:ring-[#4A121A] cursor-pointer mt-0.5"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-light mt-0.5">{p.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
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
                    {actionLoading ? 'Đang lưu...' : 'Lưu vai trò'}
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

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa vai trò hệ thống</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn vai trò <span className="font-bold text-gray-800">{selectedRole?.name}</span>? Những tài khoản đang được gán vai trò này sẽ mất quyền truy cập tương ứng.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedRole(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
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
