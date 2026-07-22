import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';
import api from '../services/api';
import RevenueChart from '../components/RevenueChart';
import UserManagement from '../components/UserManagement';
import EmployeeManagement from '../components/EmployeeManagement';
import RoleManagement from '../components/RoleManagement';
import CategoryManagement from '../components/CategoryManagement';
import MenuManagement from '../components/MenuManagement';
import TableManagement from '../components/TableManagement';
import ReservationManagement from '../components/ReservationManagement';
import KitchenManagement from '../components/KitchenManagement';
import InventoryManagement from '../components/InventoryManagement';
import SupplierManagement from '../components/SupplierManagement';
import CustomerManagement from '../components/CustomerManagement';
import PromotionManagement from '../components/PromotionManagement';
import ReportManagement from '../components/ReportManagement';
import AdminNotificationManagement from '../components/AdminNotificationManagement';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'employees', 'roles', 'categories', 'menu', 'tables', 'reservations', 'kitchen'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [revenueMode, setRevenueMode] = useState('month'); // 'month' or 'week'

  // Top Dishes Interaction States (Search, Filter, Sort)
  const [dishSearch, setDishSearch] = useState('');
  const [dishCategory, setDishCategory] = useState('All');
  const [dishSortBy, setDishSortBy] = useState('quantity'); // 'quantity' or 'revenue'
  const [dishPage, setDishPage] = useState(1);
  const dishesPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/admin/dashboard', { params: { months: 6, topLimit: 20 } });
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve administrative statistics. Please verify backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  // Filter and Sort Top Dishes
  const getProcessedDishes = () => {
    if (!stats || !stats.topSellingDishes) return [];
    
    return stats.topSellingDishes
      .filter((dish) => {
        const matchesSearch = dish.name.toLowerCase().includes(dishSearch.toLowerCase());
        const matchesCategory = dishCategory === 'All' || dish.category === dishCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (dishSortBy === 'quantity') {
          return b.quantitySold - a.quantitySold;
        } else {
          return b.totalRevenue - a.totalRevenue;
        }
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Đang tải dữ liệu quản trị...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-red-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-700 font-serif">Cảnh Báo Hệ Thống</h3>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 btn-primary w-full py-2.5"
          >
            Thử Lại Kết Nối
          </button>
        </div>
      </div>
    );
  }

  const processedDishes = getProcessedDishes();
  const totalDishPages = Math.max(1, Math.ceil(processedDishes.length / dishesPerPage));
  const currentDishPage = Math.min(dishPage, totalDishPages);
  const visibleDishes = processedDishes.slice((currentDishPage - 1) * dishesPerPage, currentDishPage * dishesPerPage);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans pb-16">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#4A121A] text-white shadow-md border-b-2 border-[#C5A059]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-11 w-11 rounded-xl object-cover border border-[#C5A059] shadow-lg" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wider text-[#FAF7F2] font-serif">Quản Trị L'ÉCLAT</span>
                <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold font-sans mt-0.5">Phân Tích Doanh Nghiệp</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-[#C5A059] flex items-center justify-center font-bold text-[#4A121A] text-xs shrink-0 shadow-md" title={`Hồ sơ: ${user?.fullName || 'Quản Trị Viên'}`}>
                <User className="w-4.5 h-4.5 text-[#4A121A]" />
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#C5A059] hover:border-transparent transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-[#E8E2D9] flex flex-wrap gap-x-6 gap-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Báo cáo tổng quan
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý người dùng
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'employees' || activeTab === 'roles'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý nhân sự & Phân quyền
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý danh mục
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'menu'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý thực đơn
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'tables'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý bàn
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'reservations'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Đặt bàn trước
          </button>
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'kitchen'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Màn hình bếp
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Quản lý kho
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Nhà cung cấp & Mua hàng
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'customers'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Khách hàng & Thành viên
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'promotions'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Khuyến mãi & Voucher
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Báo cáo & Thống kê
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-[#4A121A] text-[#4A121A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Khẩn cấp & Thông báo
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Core Financial Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          
          <div className="restaurant-card p-6 border-l-4 border-l-[#C5A059]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">TỔNG DOANH THU HỆ THỐNG</span>
            <h2 className="text-3xl font-bold font-serif text-[#4A121A]">{formatCurrency(stats?.totalRevenue)}</h2>
            <p className="text-xs text-gray-500 mt-2 font-medium">Tích lũy hóa đơn đã hoàn thành</p>
          </div>

          <div className="restaurant-card p-6 border-l-4 border-l-[#1B3B2B]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">DOANH THU HÔM NAY</span>
            <h2 className="text-3xl font-bold font-serif text-[#1B3B2B]">{formatCurrency(stats?.todayRevenue)}</h2>
            <p className="text-xs text-gray-500 mt-2 font-medium">Doanh thu tính từ 00:00 sáng</p>
          </div>

          <div className="restaurant-card p-6 border-l-4 border-l-[#4A121A]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">DOANH THU THÁNG HIỆN TẠI</span>
            <h2 className="text-3xl font-bold font-serif text-[#C5A059]">{formatCurrency(stats?.monthRevenue)}</h2>
            <p className="text-xs text-gray-500 mt-2 font-medium">Cộng dồn doanh thu trong tháng</p>
          </div>

        </div>

        {/* Visual Charts & Order stats */}
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Revenue Chart */}
          <div className="restaurant-card p-6 lg:col-span-2 flex flex-col justify-between">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D9]">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  Biểu Đồ Doanh Thu {revenueMode === 'month' ? 'Theo Tháng' : 'Theo Tuần'}
                </h3>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5 block">
                  {revenueMode === 'month' ? 'Thống kê 6 tháng gần nhất' : 'Thống kê 8 tuần gần nhất'}
                </span>
              </div>
              
              {/* Toggle Buttons: Month vs Week */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8E2D9] self-start sm:self-auto">
                <button
                  onClick={() => setRevenueMode('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    revenueMode === 'month'
                      ? 'bg-[#4A121A] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Theo Tháng
                </button>
                <button
                  onClick={() => setRevenueMode('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    revenueMode === 'week'
                      ? 'bg-[#4A121A] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Theo Tuần
                </button>
              </div>
            </div>

            <div className="w-full">
              <RevenueChart
                data={revenueMode === 'month' ? stats?.monthlyRevenueData : stats?.weeklyRevenueData}
                title={revenueMode === 'month' ? 'Doanh thu tháng' : 'Doanh thu tuần'}
              />
            </div>
          </div>

          {/* Core Operations Widget */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Orders stats card */}
            <div className="restaurant-card p-6">
              <h3 className="text-lg font-bold font-serif text-[#4A121A] mb-4 pb-1.5 border-b border-[#E8E2D9]">Hoạt Động Đơn Hàng</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8E2D9]">
                  <h4 className="text-xl font-bold text-gray-700">{stats?.totalOrders}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">Tổng Đơn</p>
                </div>
                <div className="bg-[#1B3B2B]/5 p-3.5 rounded-xl border border-[#1B3B2B]/20">
                  <h4 className="text-xl font-bold text-[#1B3B2B]">{stats?.activeOrders}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#1B3B2B] mt-1">Đang Phục Vụ</p>
                </div>
                <div className="bg-[#C5A059]/5 p-3.5 rounded-xl border border-[#C5A059]/20">
                  <h4 className="text-xl font-bold text-[#C5A059]">{stats?.completedOrders}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#C5A059] mt-1">Hoàn Thành</p>
                </div>
              </div>
            </div>

            {/* Personnel stats card */}
            <div className="restaurant-card p-6">
              <h3 className="text-lg font-bold font-serif text-[#4A121A] mb-4 pb-1.5 border-b border-[#E8E2D9]">Tài Khoản & Nhân Sự</h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] text-[#4A121A]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-lg">{stats?.totalCustomers}</h5>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Khách Hàng Đăng Ký</p>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-[#E8E2D9]"></div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] text-[#1B3B2B]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 text-lg">{stats?.totalEmployees}</h5>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Nhân Viên Hoạt Động</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Operational Tables Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Table 1: Top Dishes with Search, Filter & Sort */}
          <div className="restaurant-card p-6 lg:col-span-2">
            <div className="mb-6 pb-3 border-b border-[#E8E2D9] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-xl font-bold font-serif text-[#4A121A]">Top Món Ăn Bán Chạy</h3>
              
              {/* Filter controls */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <input
                  type="text"
                  placeholder="Tìm món..."
                  value={dishSearch}
                  onChange={(e) => { setDishSearch(e.target.value); setDishPage(1); }}
                  className="form-input text-xs py-1.5 px-3 max-w-[150px]"
                />
                
                <select
                  value={dishCategory}
                  onChange={(e) => { setDishCategory(e.target.value); setDishPage(1); }}
                  className="form-input text-xs py-1.5 px-3 max-w-[140px] cursor-pointer font-semibold text-[#4A121A]"
                >
                  <option value="All">Tất cả danh mục</option>
                  <option value="Main">Món Chính</option>
                  <option value="Appetizer">Khai Vị</option>
                  <option value="Dessert">Tráng Miệng</option>
                  <option value="Drink">Đồ Uống</option>
                </select>

                <select
                  value={dishSortBy}
                  onChange={(e) => { setDishSortBy(e.target.value); setDishPage(1); }}
                  className="form-input text-xs py-1.5 px-3 max-w-[150px] cursor-pointer font-semibold text-[#4A121A]"
                >
                  <option value="quantity">Sắp xếp: Số lượng</option>
                  <option value="revenue">Sắp xếp: Doanh thu</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E2D9] text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    <th className="py-2.5">Tên Món Ăn</th>
                    <th className="py-2.5">Danh Mục</th>
                    <th className="py-2.5 text-center">Số Lượng Bán</th>
                    <th className="py-2.5 text-right">Doanh Thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]/40 text-sm">
                  {visibleDishes.length > 0 ? (
                    visibleDishes.map((dish, i) => (
                      <tr key={i} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3 font-semibold text-gray-800">{dish.name}</td>
                        <td className="py-3">
                          <span className="inline-block bg-[#FAF7F2] text-[#6E6564] text-[10px] px-2 py-0.5 rounded border border-[#E8E2D9] font-bold">
                            {dish.category === 'Main' ? 'Món Chính' : dish.category === 'Appetizer' ? 'Khai Vị' : dish.category === 'Dessert' ? 'Tráng Miệng' : dish.category === 'Drink' ? 'Đồ Uống' : dish.category}
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono font-semibold text-gray-700">{dish.quantitySold}</td>
                        <td className="py-3 text-right font-mono font-bold text-[#4A121A]">{formatCurrency(dish.totalRevenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-xs text-gray-400 uppercase tracking-widest">
                        Không tìm thấy món ăn phù hợp với bộ lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {processedDishes.length > dishesPerPage && <div className="mt-5 flex items-center justify-between border-t border-[#E8E2D9] pt-4 text-xs"><span className="text-[#6E6564]">Trang {currentDishPage}/{totalDishPages}</span><div className="flex gap-2"><button type="button" className="btn-secondary px-3 py-1.5 text-xs" disabled={currentDishPage === 1} onClick={() => setDishPage(currentDishPage - 1)}>Trước</button><button type="button" className="btn-secondary px-3 py-1.5 text-xs" disabled={currentDishPage === totalDishPages} onClick={() => setDishPage(currentDishPage + 1)}>Sau</button></div></div>}
          </div>

          {/* Side Panels */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Table 2: Top Customers */}
            <div className="restaurant-card p-6">
              <h3 className="text-lg font-bold font-serif text-[#4A121A] mb-4 pb-2 border-b border-[#E8E2D9]">Khách Hàng Thân Thiết Top</h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {stats?.topCustomers && stats.topCustomers.length > 0 ? (
                  stats.topCustomers.map((cust, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8E2D9] transition-all">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{cust.fullName}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{cust.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-[#1B3B2B]">{formatCurrency(cust.totalSpent)}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider font-bold">{cust.ordersCount} hóa đơn</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-gray-400 py-6">Chưa có dữ liệu giao dịch khách hàng.</p>
                )}
              </div>
            </div>

            {/* Table 3: Low Stock Alerts */}
            <div className="restaurant-card p-6 border-t-4 border-t-red-700">
              <div className="mb-4 pb-2 border-b border-[#E8E2D9] flex justify-between items-center">
                <h3 className="text-lg font-bold font-serif text-red-700 flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Cảnh Báo Hạn Mức Kho
                </h3>
                <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded">
                  {stats?.lowStockIngredients?.length || 0} Cần nhập kho
                </span>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {stats?.lowStockIngredients && stats.lowStockIngredients.length > 0 ? (
                  stats.lowStockIngredients.map((ing, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-xl">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{ing.name}</h4>
                        <p className="text-[9px] text-[#6E6564] mt-0.5 font-bold">Ngưỡng tối thiểu: {ing.minStockThreshold} {ing.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-red-700">{ing.stockQuantity} {ing.unit}</span>
                        <span className="block text-[8px] font-bold text-red-600 uppercase tracking-widest mt-0.5">CẦN MUA</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-green-600 font-semibold py-6">Tất cả nguyên liệu trong kho ở mức an toàn.</p>
                )}
              </div>
            </div>

          </div>

        </div>
          </>
        ) : activeTab === 'users' ? (
          <UserManagement />
        ) : (activeTab === 'employees' || activeTab === 'roles') ? (
          <EmployeeManagement initialTab={activeTab === 'roles' ? 'roles' : 'employees'} />
        ) : activeTab === 'categories' ? (
          <CategoryManagement />
        ) : activeTab === 'menu' ? (
          <MenuManagement />
        ) : activeTab === 'tables' ? (
          <TableManagement />
        ) : activeTab === 'reservations' ? (
          <ReservationManagement />
        ) : activeTab === 'kitchen' ? (
          <KitchenManagement />
        ) : activeTab === 'inventory' ? (
          <InventoryManagement />
        ) : activeTab === 'suppliers' ? (
          <SupplierManagement />
        ) : activeTab === 'customers' ? (
          <CustomerManagement />
        ) : activeTab === 'promotions' ? (
          <PromotionManagement />
        ) : activeTab === 'notifications' ? (
          <AdminNotificationManagement />
        ) : (
          <ReportManagement />
        )}

      </main>

    </div>
  );
}
