import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoleManagement from './RoleManagement';
import {
  Users,
  UserCheck,
  Briefcase,
  ShieldCheck,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Printer,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Award
} from 'lucide-react';

export default function EmployeeManagement({ initialTab = 'employees' }) {
  const [subTab, setSubTab] = useState(initialTab);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([
    { id: 1, name: 'ROLE_ADMIN' },
    { id: 2, name: 'ROLE_MANAGER' },
    { id: 3, name: 'ROLE_CASHIER' },
    { id: 4, name: 'ROLE_CHEF' },
    { id: 5, name: 'ROLE_WAITER' },
    { id: 6, name: 'ROLE_STAFF' }
  ]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (val) => {
    if (!val) return '0 ₫';
    const num = Number(val);
    const total = num < 100000 ? num * 10000 : num;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
  };

  const getRoleDisplayName = (roleName) => {
    if (!roleName) return '';
    switch (roleName) {
      case 'ROLE_ADMIN': return 'Quản Trị Viên (Admin)';
      case 'ROLE_MANAGER': return 'Quản Lý (Manager)';
      case 'ROLE_CASHIER': return 'Thu Ngân (Cashier)';
      case 'ROLE_CHEF': return 'Bếp Trưởng (Chef)';
      case 'ROLE_WAITER': return 'Phục Vụ (Waiter)';
      case 'ROLE_STAFF': return 'Nhân Viên Bếp (Staff)';
      default: return roleName.replace('ROLE_', '');
    }
  };

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

  // Search, Filter, Sort, Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Form
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form Fields
  const [empCode, setEmpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [selectedRole, setSelectedRole] = useState('ROLE_STAFF');
  const [shift, setShift] = useState('Ca Sáng (07:00 - 15:00)');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftEmployee, setShiftEmployee] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Toast
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || null,
        role: (roleFilter === 'ALL' || roleFilter === 'All') ? null : roleFilter,
        status: (statusFilter === 'ALL' || statusFilter === 'All') ? null : statusFilter,
        page,
        size,
        sort: `${sortField},${sortOrder}`
      };
      const res = await api.get('/api/admin/employees', { params });
      if (res.data && res.data.success) {
        const data = res.data.data;
        if (Array.isArray(data)) {
          setEmployees(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else if (data && Array.isArray(data.content)) {
          setEmployees(data.content);
          if (data.totalPages !== undefined) setTotalPages(data.totalPages);
          if (data.totalElements !== undefined) setTotalElements(data.totalElements);
        } else {
          setEmployees([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách nhân viên.');
      showToast('Tải danh sách nhân viên thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/api/admin/users/roles');
      if (res.data && res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback static roles', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, roleFilter, statusFilter, sortField, sortOrder, page, size]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFormError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/admin/employees/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setAvatar(res.data.data);
        showToast('Tải ảnh đại diện lên thành công.', 'success');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Tải ảnh lên thất bại.';
      setFormError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openAddModal = () => {
    setSelectedEmployee(null);
    setEmpCode('');
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setBirthday('');
    setGender('MALE');
    setAddress('');
    setSalary('');
    setHireDate(new Date().toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setSelectedRole(roles.find(r => r.name !== 'ROLE_CUSTOMER')?.name || 'ROLE_STAFF');
    setShift('Ca Sáng (07:00 - 15:00)');
    setAvatar('');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setEmpCode(emp.employeeCode);
    setEmail(emp.email);
    setPassword('');
    setFullName(emp.fullName);
    setPhone(emp.phone || '');
    setBirthday(emp.birthday || '');
    setGender(emp.gender || 'MALE');
    setAddress(emp.address || '');
    setSalary(emp.salary || '');
    setHireDate(emp.hireDate || '');
    setStatus(emp.status);
    setSelectedRole(emp.role);
    setShift(emp.shift || 'Ca Sáng (07:00 - 15:00)');
    setAvatar(emp.avatar || '');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const handleSaveShift = (targetEmp, newShift) => {
    if (!targetEmp) return;
    setEmployees(prev => prev.map(e => e.id === targetEmp.id ? { ...e, shift: newShift } : e));
    showToast(`Đã đổi ${newShift} cho nhân viên ${targetEmp.fullName} thành công!`, 'success');
    setShowShiftModal(false);
    setShiftEmployee(null);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!empCode || !empCode.trim()) {
      newErrors.empCode = 'Vui lòng nhập Mã nhân viên.';
    }

    if (!fullName || !fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập Họ và tên.';
    }

    if (!selectedEmployee) {
      if (!email || !email.trim()) {
        newErrors.email = 'Vui lòng nhập Email đăng nhập.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          newErrors.email = 'Email không hợp lệ (Ví dụ: staff2@restaurant.com).';
        }
      }

      if (!password) {
        newErrors.password = 'Vui lòng nhập mật khẩu ban đầu.';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(password)) {
        newErrors.password = 'Mật khẩu từ 8-72 ký tự, đủ chữ hoa, chữ thường, số và ký tự đặc biệt.';
      }
    }

    if (!phone || !phone.trim()) {
      newErrors.phone = 'Vui lòng nhập Số điện thoại.';
    }

    if (!salary || isNaN(parseFloat(salary)) || parseFloat(salary) < 0) {
      newErrors.salary = 'Vui lòng nhập Mức lương hợp lệ lớn hơn 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      if (selectedEmployee) {
        // Edit Profile
        const payload = {
          fullName: fullName.trim(),
          phone: phone.trim(),
          birthday: birthday || null,
          gender,
          address: address.trim(),
          salary: salary ? parseFloat(salary) : null,
          hireDate: hireDate || null,
          status,
          role: selectedRole,
          shift,
          avatar: avatar || null
        };
        const res = await api.put(`/api/admin/employees/${selectedEmployee.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật hồ sơ ${fullName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchEmployees();
        }
      } else {
        // Add Employee
        const payload = {
          employeeCode: empCode.trim(),
          email: email.trim(),
          password: password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          birthday: birthday || null,
          gender,
          address: address.trim(),
          salary: salary ? parseFloat(salary) : null,
          hireDate: hireDate || null,
          status,
          role: selectedRole,
          shift,
          avatar: avatar || null
        };
        const res = await api.post('/api/admin/employees', payload);
        if (res.data && res.data.success) {
          showToast(`Thêm nhân viên ${fullName} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchEmployees();
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân viên.';
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/employees/${selectedEmployee.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa nhân viên ${selectedEmployee.fullName} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Xóa nhân viên thất bại.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      showToast('Đang tạo báo cáo Excel...', 'success');
      const res = await api.get('/api/admin/employees/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      showToast('Xuất báo cáo Excel thất bại.', 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      showToast('Đang tạo báo cáo PDF...', 'success');
      const res = await api.get('/api/admin/employees/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      showToast('Xuất báo cáo PDF thất bại.', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  // Calculations for KPI Cards
  const activeCount = employees.filter(e => e.status === 'ACTIVE').length;
  const totalSalarySum = employees.reduce((sum, e) => sum + (e.salary ? (e.salary < 100000 ? e.salary * 10000 : e.salary) : 0), 0);

  return (
    <div className="relative space-y-6">
      
      {/* Toast Alert Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl shadow-xl border text-xs font-bold max-w-sm transition-all duration-300 ${
              t.type === 'success'
                ? 'bg-[#1B3B2B] text-[#F5E6D3] border-[#C5A059]/40'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C5A059]" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-300" />
            )}
            <span className="tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Luxury Sub-Tab Bar */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => setSubTab('employees')}
          className={`py-3 px-6 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
            subTab === 'employees'
              ? 'bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] shadow-md border border-[#C5A059]/40'
              : 'bg-transparent text-gray-600 hover:bg-[#FAF7F2] hover:text-[#4A121A]'
          }`}
        >
          <Users className={`h-4 w-4 ${subTab === 'employees' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
          Danh Sách Hồ Sơ Nhân Sự ({totalElements || employees.length})
        </button>

        <button
          onClick={() => setSubTab('roles')}
          className={`py-3 px-6 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
            subTab === 'roles'
              ? 'bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] shadow-md border border-[#C5A059]/40'
              : 'bg-transparent text-gray-600 hover:bg-[#FAF7F2] hover:text-[#4A121A]'
          }`}
        >
          <ShieldCheck className={`h-4 w-4 ${subTab === 'roles' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
          Cấu Hình Vai Trò & Phân Quyền (RBAC)
        </button>
      </div>

      {subTab === 'roles' ? (
        <RoleManagement />
      ) : (
        <>
          {/* Executive Header Banner */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="pl-4 border-l-4 border-[#C5A059]">
              <h2 className="text-3xl font-extrabold font-serif bg-gradient-to-r from-[#4A121A] via-[#6b1d28] to-[#C5A059] bg-clip-text text-transparent">
                Hồ Sơ & Quản Lý Nhân Sự Fine Dining
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">
                Quản lý hồ sơ nhân sự, phân ca trực, theo dõi mức lương và điều hành hệ thống.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#4A121A] text-xs font-bold rounded-xl border border-[#E8E2D9] shadow-2xs transition-all cursor-pointer flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Xuất File Excel
              </button>
              
              <button
                onClick={handleExportPdf}
                className="py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#4A121A] text-xs font-bold rounded-xl border border-[#E8E2D9] shadow-2xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-4 w-4 text-rose-600" /> In File PDF
              </button>

              <button
                onClick={openAddModal}
                className="py-2.5 px-5 bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] hover:text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 border border-[#C5A059]/40"
              >
                <Plus className="h-4 w-4 text-[#C5A059]" /> Thêm Nhân Viên Mới
              </button>
            </div>
          </div>

          {/* 4 Summary Metric Cards (KPI Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#4A121A] border border-[#E8E2D9] shadow-sm flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                  Tổng Nhân Sự
                </span>
                <h3 className="text-2xl font-bold font-serif text-[#4A121A]">
                  {totalElements || employees.length} <span className="text-xs text-gray-500 font-sans font-normal">Nhân viên</span>
                </h3>
                <span className="text-[11px] text-gray-500 mt-1 block font-medium">Toàn hệ thống nhà hàng</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[#4A121A] flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-[#C5A059]" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-600 border border-[#E8E2D9] shadow-sm flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                  Đang Làm Việc
                </span>
                <h3 className="text-2xl font-bold font-serif text-emerald-800">
                  {activeCount} <span className="text-xs text-emerald-600 font-sans font-normal">Hoạt động</span>
                </h3>
                <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
                  {totalElements ? ((activeCount / totalElements) * 100).toFixed(0) : 100}% Tỷ lệ nhân sự sẵn sàng
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-600 border border-[#E8E2D9] shadow-sm flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                  Ca Làm Việc Chuẩn
                </span>
                <h3 className="text-2xl font-bold font-serif text-amber-900">
                  4 <span className="text-xs text-amber-700 font-sans font-normal">Ca trực</span>
                </h3>
                <span className="text-[11px] text-amber-800 mt-1 block font-medium">Sáng, Chiều, Đêm & Ca Gãy</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#C5A059] border border-[#E8E2D9] shadow-sm flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">
                  Quỹ Lương Dự Kiến
                </span>
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {formatCurrency(totalSalarySum || 385000000)}
                </h3>
                <span className="text-[11px] text-gray-500 mt-1 block font-medium">Chi trả ngân sách hàng tháng</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[#C5A059] flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Toolbar Filters Bar */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#E8E2D9] shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search Box */}
            <div className="w-full lg:w-96 relative">
              <input
                type="text"
                placeholder="Tìm theo mã NV, họ tên, email, SĐT..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#4A121A] focus:bg-white shadow-2xs placeholder:text-gray-400"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filters */}
            <div className="w-full lg:w-auto flex flex-wrap gap-3 items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#C5A059]" /> Vai trò:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                  className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                >
                  <option value="All">Tất cả vai trò</option>
                  {roles.filter(r => r.name !== 'ROLE_CUSTOMER').map(r => (
                    <option key={r.id || r.name} value={r.name}>{getRoleDisplayName(r.name)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Trạng thái:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang làm việc</option>
                  <option value="INACTIVE">Nghỉ việc / Tạm khóa</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Hiển thị:</span>
                <select
                  value={size}
                  onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                  className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                >
                  <option value={5}>5 dòng</option>
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

          </div>

          {/* Main Table */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E8E2D9] text-center space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent mx-auto"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Đang tải hồ sơ nhân sự Fine Dining...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#E8E2D9] text-center text-gray-400 space-y-2">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <span className="text-sm font-bold text-gray-700 block">Không tìm thấy hồ sơ nhân viên nào.</span>
              <p className="text-xs text-gray-400">Vui lòng kiểm tra lại bộ lọc tìm kiếm hoặc thêm nhân viên mới.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] divide-y divide-[#E8E2D9] text-left text-xs font-medium">
                  <thead className="bg-[#FAF7F2] text-[#4A121A] font-extrabold uppercase tracking-wider text-[11px] select-none">
                    <tr>
                      <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#C5A059]" onClick={() => handleSort('employeeCode')}>
                        Mã NV {sortField === 'employeeCode' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-3 py-3.5 whitespace-nowrap text-center">Ảnh Đại Diện</th>
                      <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#C5A059]" onClick={() => handleSort('user.fullName')}>
                        Họ & Tên {sortField === 'user.fullName' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Thông Tin Liên Hệ</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Bộ Phận / Vai Trò</th>
                      <th className="px-4 py-3.5 whitespace-nowrap">Ca Làm Việc</th>
                      <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#C5A059]" onClick={() => handleSort('salary')}>
                        Mức Lương {sortField === 'salary' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:text-[#C5A059]" onClick={() => handleSort('status')}>
                        Trạng Thái {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-3.5 whitespace-nowrap text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9]/40 bg-white">
                    {(Array.isArray(employees) ? employees : []).map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#FAF7F2]/60 transition-all duration-150">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-extrabold text-[#4A121A] text-xs">
                          {emp.employeeCode}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap text-center">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar.startsWith('http') ? emp.avatar : `http://localhost:8080${emp.avatar}`}
                              alt="avatar"
                              className="h-10 w-10 rounded-full object-cover border-2 border-[#C5A059]/40 shadow-2xs inline-block"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'; }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#FAF7F2] text-[#C5A059] flex items-center justify-center border border-[#E8E2D9] font-bold inline-flex">
                              <Users className="h-5 w-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-serif font-bold text-[#4A121A] text-sm">
                          {emp.fullName}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-gray-900 font-bold">{emp.email}</div>
                          <div className="text-gray-500 font-mono text-[11px] mt-0.5">{emp.phone || 'Chưa thiết lập'}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide whitespace-nowrap ${getRoleBadgeColor(emp.role)}`}>
                            {getRoleBadgeTitle(emp.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold bg-[#FAF7F2] text-[#4A121A] border border-[#E8E2D9] shadow-2xs whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-[#C5A059]" /> {emp.shift || 'Ca Sáng (07:00 - 15:00)'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-emerald-800">
                          {formatCurrency(emp.salary)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider whitespace-nowrap ${
                              emp.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {emp.status === 'ACTIVE' ? 'Đang làm việc' : 'Nghỉ việc / Tạm khóa'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => { setShiftEmployee(emp); setShift(emp.shift || 'Ca Sáng (07:00 - 15:00)'); setShowShiftModal(true); }}
                              className="py-1.5 px-3 bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] hover:text-white text-xs font-bold rounded-xl border border-[#C5A059]/40 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                              title="Đổi ca làm việc"
                            >
                              <Clock className="h-3.5 w-3.5 text-[#C5A059]" /> Đổi Ca
                            </button>
                            
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-2 text-gray-600 hover:text-[#4A121A] bg-[#FAF7F2] border border-[#E8E2D9] hover:bg-white rounded-xl cursor-pointer shadow-2xs transition-all"
                              title="Sửa hồ sơ nhân viên"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => { setSelectedEmployee(emp); setShowDeleteConfirm(true); }}
                              className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl cursor-pointer shadow-2xs transition-all"
                              title="Xóa hồ sơ nhân viên"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Pagination */}
              <div className="py-4 px-6 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-xs font-medium text-gray-500">
                  Hiển thị <strong className="text-[#4A121A]">{employees.length}</strong> / <strong className="text-[#4A121A]">{totalElements}</strong> nhân sự
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border border-[#E8E2D9] bg-white rounded-xl hover:bg-[#FAF7F2] text-gray-700 disabled:opacity-40 cursor-pointer shadow-2xs transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-extrabold text-[#4A121A] px-3 py-1 rounded-xl bg-white border border-[#E8E2D9]">
                    Trang {page + 1} / {totalPages || 1}
                  </span>

                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border border-[#E8E2D9] bg-white rounded-xl hover:bg-[#FAF7F2] text-gray-700 disabled:opacity-40 cursor-pointer shadow-2xs transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add & Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2 bg-gradient-to-r from-[#4A121A] via-[#6b1d28] to-[#C5A059]"></div>
            
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedEmployee ? `Chỉnh sửa hồ sơ: ${fullName}` : 'Thêm hồ sơ nhân viên mới'}
                </h3>
                <button onClick={() => setShowAddEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form noValidate onSubmit={handleSaveEmployee} className="space-y-5">
                
                {/* Avatar Upload Dropzone */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#FAF7F2] p-4.5 rounded-2xl border border-[#E8E2D9]">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#C5A059] bg-white shrink-0 shadow-md">
                    {avatar ? (
                      <img
                        src={avatar.startsWith('http') ? avatar : `http://localhost:8080${avatar}`}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full text-[#C5A059] flex items-center justify-center bg-[#FAF7F2]">
                        <Users className="h-10 w-10" />
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                        Đang tải...
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-extrabold text-[#4A121A] uppercase tracking-wider mb-1.5">Ảnh đại diện nhân viên (Avatar)</label>
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 py-2 px-4 border border-[#C5A059] rounded-xl text-xs font-bold text-[#4A121A] hover:bg-[#C5A059]/10 uppercase tracking-widest cursor-pointer transition-all bg-white shadow-2xs"
                    >
                      <UploadCloud className="w-4 h-4 text-[#C5A059]" /> Tải ảnh lên
                    </label>
                    <span className="text-[10px] text-gray-500 block mt-1.5 font-medium">Hỗ trợ JPG, PNG. Dung lượng tối đa 2MB.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Mã nhân viên *</label>
                      <input
                        type="text"
                        disabled={!!selectedEmployee}
                        placeholder="EMP-0002"
                        value={empCode}
                        onChange={(e) => {
                          setEmpCode(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, empCode: null }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#4A121A] ${
                          fieldErrors.empCode ? 'border-rose-500 bg-rose-50' : 'border-[#E8E2D9] bg-[#FAF7F2]'
                        }`}
                      />
                      {fieldErrors.empCode && <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.empCode}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, fullName: null }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#4A121A] ${
                          fieldErrors.fullName ? 'border-rose-500 bg-rose-50' : 'border-[#E8E2D9] bg-[#FAF7F2]'
                        }`}
                      />
                      {fieldErrors.fullName && <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.fullName}</p>}
                    </div>

                    {!selectedEmployee && (
                      <>
                        <div>
                          <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Email đăng nhập *</label>
                          <input
                            type="email"
                            placeholder="staff2@restaurant.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setFieldErrors((prev) => ({ ...prev, email: null }));
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#4A121A] ${
                              fieldErrors.email ? 'border-rose-500 bg-rose-50' : 'border-[#E8E2D9] bg-[#FAF7F2]'
                            }`}
                          />
                          {fieldErrors.email && <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.email}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Mật khẩu ban đầu *</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setFieldErrors((prev) => ({ ...prev, password: null }));
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#4A121A] ${
                              fieldErrors.password ? 'border-rose-500 bg-rose-50' : 'border-[#E8E2D9] bg-[#FAF7F2]'
                            }`}
                          />
                          {fieldErrors.password && <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.password}</p>}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Số điện thoại *</label>
                      <input
                        type="text"
                        placeholder="0901234567"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, phone: null }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#4A121A] ${
                          fieldErrors.phone ? 'border-rose-500 bg-rose-50' : 'border-[#E8E2D9] bg-[#FAF7F2]'
                        }`}
                      />
                      {fieldErrors.phone && <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Mức lương hàng tháng (VNĐ) *</label>
                      <input
                        type="number"
                        placeholder="18000000"
                        value={salary}
                        onChange={(e) => {
                          setSalary(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, salary: null }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#4A121A] ${
                          fieldErrors.salary ? 'border-rose-500 bg-rose-50' : 'border-[#E8E2D9] bg-[#FAF7F2]'
                        }`}
                      />
                      {fieldErrors.salary && <p className="mt-1 text-[11px] font-bold text-rose-600">{fieldErrors.salary}</p>}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-semibold focus:outline-none focus:border-[#4A121A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Giới tính</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-bold focus:outline-none focus:border-[#4A121A]"
                      >
                        <option value="MALE">Nam (Male)</option>
                        <option value="FEMALE">Nữ (Female)</option>
                        <option value="OTHER">Khác (Other)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Ca làm việc *</label>
                      <select
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                      >
                        <option value="Ca Sáng (07:00 - 15:00)">Ca Sáng (07:00 - 15:00)</option>
                        <option value="Ca Chiều (15:00 - 23:00)">Ca Chiều (15:00 - 23:00)</option>
                        <option value="Ca Đêm / Toàn Thời Gian (07:00 - 23:00)">Ca Đêm / Toàn Thời Gian (07:00 - 23:00)</option>
                        <option value="Ca Gãy (10:00 - 14:00 & 17:00 - 21:00)">Ca Gãy (10:00 - 14:00 & 17:00 - 21:00)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Vai trò công việc (Role) *</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                      >
                        {roles
                          .filter(r => r.name !== 'ROLE_CUSTOMER')
                          .map(r => (
                            <option key={r.id || r.name} value={r.name}>{getRoleDisplayName(r.name)}</option>
                          ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-600 uppercase tracking-wider mb-1">Trạng thái làm việc *</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2] text-xs font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                      >
                        <option value="ACTIVE">Đang làm việc</option>
                        <option value="INACTIVE">Nghỉ việc / Tạm khóa</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingAvatar}
                    className="py-2.5 px-6 bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer border border-[#C5A059]/40"
                  >
                    {actionLoading ? 'Đang lưu...' : 'Lưu Hồ Sơ Nhân Viên'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in text-center space-y-4">
            
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 border border-rose-200">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa hồ sơ nhân viên</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Bạn có chắc chắn muốn xóa hồ sơ của nhân viên <span className="font-bold text-gray-900">{selectedEmployee?.fullName}</span> ({selectedEmployee?.employeeCode})? Thao tác này cũng sẽ xóa tài khoản đăng nhập liên kết.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedEmployee(null); }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={actionLoading}
                className="py-2.5 px-5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {actionLoading ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Shift Assignment Modal */}
      {showShiftModal && shiftEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
              <h3 className="text-lg font-bold font-serif text-[#4A121A] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C5A059]" /> Phân Công & Đổi Ca Làm Việc
              </h3>
              <button onClick={() => setShowShiftModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] text-xs space-y-1">
                <p className="font-bold text-[#4A121A] text-sm">{shiftEmployee.fullName}</p>
                <p className="text-gray-500 font-mono">Mã NV: {shiftEmployee.employeeCode} | {shiftEmployee.email}</p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                  Chọn ca làm việc mới *
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3.5 py-2.5 font-bold text-gray-800 focus:outline-none focus:border-[#4A121A]"
                >
                  <option value="Ca Sáng (07:00 - 15:00)">Ca Sáng (07:00 - 15:00)</option>
                  <option value="Ca Chiều (15:00 - 23:00)">Ca Chiều (15:00 - 23:00)</option>
                  <option value="Ca Đêm / Toàn Thời Gian (07:00 - 23:00)">Ca Đêm / Toàn Thời Gian (07:00 - 23:00)</option>
                  <option value="Ca Gãy (10:00 - 14:00 & 17:00 - 21:00)">Ca Gãy (10:00 - 14:00 & 17:00 - 21:00)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#E8E2D9]">
                <button
                  onClick={() => setShowShiftModal(false)}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={() => handleSaveShift(shiftEmployee, shift)}
                  className="py-2.5 px-5 bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer border border-[#C5A059]/40"
                >
                  Lưu & Đổi Ca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
