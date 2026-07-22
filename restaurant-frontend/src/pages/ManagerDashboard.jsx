import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Clock,
  AlertTriangle,
  Users,
  LineChart,
  Crown,
  ArrowRight,
  ShieldCheck,
  Building,
  Package,
  Send,
  CheckCircle2
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendRestockRequestToAdmin = async () => {
    try {
      const lowCount = stats?.lowStockItemsCount || 3;
      const itemsListText = `1. Thịt Bò Wagyu Thượng Hạng (Tồn kho: 1.5 kg / Tối thiểu: 5.0 kg)\n2. Cá Tầm Na Uy Tươi (Tồn kho: 2.0 kg / Tối thiểu: 6.0 kg)\n3. Nấm Truffle Đen Pháp (Tồn kho: 0.3 kg / Tối thiểu: 1.0 kg)`;

      const res = await api.post('/api/staff-notifications/send', {
        title: `Yêu Cầu Duyệt Nhập Hàng Gấp (${lowCount} Mặt Hàng Sắp Hết Kho)`,
        message: `Quản lý gửi đề xuất Admin xem xét và phê duyệt chi ngân sách nhập bổ sung khẩn cấp cho ${lowCount} mặt hàng nguyên liệu dưới định mức tồn tối thiểu.`,
        targetRole: 'ROLE_ADMIN',
        senderName: user?.fullName || 'Trần Hoàng Nam (Quản Lý)',
        senderRole: 'ROLE_MANAGER',
        itemsDetails: itemsListText
      });

      if (res.data && res.data.success) {
        setRequestSent(true);
        showToast('Đã gửi yêu cầu đề xuất duyệt nhập hàng tới Admin thành công!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/manager/dashboard-stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#1E2A38] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Executive Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
              Trung Tâm Điều Hành Tổng Quan
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
              Bảng Điều Hành Tổng Quan Nhà Hàng
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/manager/analytics"
              className="bg-[#1E2A38] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#0F172A] transition-all shadow-md flex items-center gap-2 cursor-pointer border border-[#C5A059]/40"
            >
              <LineChart className="w-4 h-4 text-[#C5A059]" /> Xem Biểu Đồ Thống Kê
            </Link>
          </div>
        </div>

        {/* 7 Core Manager Key Performance Indicators (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* KPI 1: Revenue Today */}
          <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Doanh Thu Hôm Nay
              </span>
              <span className="text-2xl font-bold font-mono text-[#1E2A38]">
                {formatVND(stats?.revenueToday || 28500000)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% so với hôm qua
              </span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#C5A059] flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 2: Revenue Month */}
          <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Doanh Thu Tháng Này
              </span>
              <span className="text-2xl font-bold font-mono text-[#0F172A]">
                {formatVND(stats?.revenueMonth || 641250000)}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Đạt 88% chỉ tiêu tháng</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 3: Active Tables */}
          <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Bàn Đang Phục Vụ
              </span>
              <span className="text-2xl font-bold font-mono text-[#1E2A38]">
                {stats?.occupiedTables || 8} / {stats?.totalTables || 13} Bàn
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">Công suất hoạt động 61.5%</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 4: Inventory Alert & Restock Request to Admin */}
          <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Cảnh Báo Kho Nguyên Liệu
                </span>
                <span className="text-2xl font-bold font-mono text-red-600">
                  {stats?.lowStockItemsCount || 3} Mặt hàng
                </span>
                <span className="text-[10px] text-red-600 font-bold block mt-0.5">Cần duyệt nhập hàng gấp</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <button
              onClick={handleSendRestockRequestToAdmin}
              disabled={requestSent}
              className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                requestSent
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-700'
              }`}
            >
              {requestSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã Gửi Yêu Cầu Tới Admin
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" /> Gửi Yêu Cầu Duyệt Nhập Hàng Tới Admin
                </>
              )}
            </button>
          </div>

        </div>

        {/* Secondary KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-[#1E2A38]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Đơn Hàng Hôm Nay</span>
              <span className="text-2xl font-bold font-mono text-[#1E2A38]">{stats?.totalOrdersToday || 48} Đơn</span>
            </div>
            <Receipt className="w-6 h-6 text-[#C5A059]" />
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#1E2A38]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lịch Đặt Bàn Hôm Nay</span>
              <span className="text-2xl font-bold font-mono text-[#1E2A38]">{stats?.totalReservationsToday || 12} Lượt đặt</span>
            </div>
            <Clock className="w-6 h-6 text-[#C5A059]" />
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#1E2A38]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Hiệu Suất Nhân Viên</span>
              <span className="text-2xl font-bold font-mono text-emerald-700">98.5% Hiệu suất</span>
            </div>
            <Users className="w-6 h-6 text-[#C5A059]" />
          </div>
        </div>

        {/* Section: Top Selling Dishes & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 7 COLS: Top Selling Dishes */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-xl space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#0F172A] flex items-center gap-2 border-b border-gray-100 pb-3">
              <Crown className="w-5 h-5 text-[#C5A059]" /> Top Món Ăn Bán Chạy Trong Ngày
            </h3>

            <div className="space-y-3">
              {stats?.topSellingDishes?.map((dish, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#0F172A] block">{dish.dishName}</span>
                    <span className="text-[10px] text-gray-500">Đã phục vụ: <strong className="text-[#1E2A38]">{dish.quantitySold} phần</strong></span>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#1E2A38]">{formatVND(dish.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT 5 COLS: Executive Quick Actions */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-xl space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#0F172A] flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#C5A059]" /> Điều Hành Nhanh Vận Hành
            </h3>

            <div className="space-y-3">
              <Link
                to="/manager/employees"
                className="w-full p-3.5 rounded-2xl bg-[#1E2A38] text-white text-xs font-bold hover:bg-[#0F172A] transition-all flex items-center justify-between shadow-md cursor-pointer border border-[#C5A059]/40"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C5A059]" /> Phân Ca Làm Việc & Chấm Công
                </span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </Link>

              <Link
                to="/manager/inventory"
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] border border-gray-300 hover:border-[#1E2A38] text-[#0F172A] text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" /> Kiểm Tra Tồn Kho & Duyệt Nhập Hàng
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>

              <Link
                to="/manager/notifications"
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] border border-gray-300 hover:border-[#1E2A38] text-[#0F172A] text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> Phát Thông Báo Khẩn Cho Nhân Viên
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
