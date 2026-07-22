import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Award,
  Printer,
  PieChart,
  BarChart3,
  ChefHat,
  Package,
  Utensils,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  FileText,
  Search,
  Filter
} from 'lucide-react';

export default function ReportManagement() {
  const [activeReportTab, setActiveReportTab] = useState('revenue'); // 'revenue', 'inventory', 'food', 'employee', 'customer', 'profit'
  const [loading, setLoading] = useState(true);

  // Sub-filters for Customer Tab
  const [customerFilter, setCustomerFilter] = useState('ALL'); // 'ALL', 'ACTIVE_MEMBER', 'GOLD', 'SILVER', 'DIAMOND', 'MEMBER'

  // Sub-filters for Profit Tab
  const [profitFilter, setProfitFilter] = useState('ALL'); // 'ALL', 'GROSS_REVENUE', 'PROCUREMENT_COST', 'NET_PROFIT'

  // Search inside tables
  const [searchTerm, setSearchTerm] = useState('');

  // Date Filter (Default 30 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Report Data States
  const [revenueData, setRevenueData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [profitData, setProfitData] = useState(null);

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeReportTab === 'revenue') {
        const res = await api.get('/api/admin/reports/revenue', { params: { startDate, endDate } });
        if (res.data && res.data.success) setRevenueData(res.data.data);
      } else if (activeReportTab === 'inventory') {
        const res = await api.get('/api/admin/reports/inventory');
        if (res.data && res.data.success) setInventoryData(res.data.data);
      } else if (activeReportTab === 'food') {
        const res = await api.get('/api/admin/reports/food', { params: { startDate, endDate } });
        if (res.data && res.data.success) setFoodData(res.data.data);
      } else if (activeReportTab === 'employee') {
        const res = await api.get('/api/admin/reports/employee');
        if (res.data && res.data.success) setEmployeeData(res.data.data);
      } else if (activeReportTab === 'customer') {
        const res = await api.get('/api/admin/reports/customer');
        if (res.data && res.data.success) setCustomerData(res.data.data);
      } else if (activeReportTab === 'profit') {
        const res = await api.get('/api/admin/reports/profit', { params: { startDate, endDate } });
        if (res.data && res.data.success) setProfitData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải dữ liệu báo cáo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReportTab, startDate, endDate]);

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/admin/reports/export/excel', {
        params: { type: activeReportTab, startDate, endDate },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_${activeReportTab}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast(`Đã xuất báo cáo CSV thành công.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xuất file báo cáo.', 'error');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  // Filter Customer Details List based on selected card / filter
  const getFilteredCustomerList = () => {
    if (!customerData || !customerData.customerList) return [];
    let list = customerData.customerList;

    if (customerFilter === 'ACTIVE_MEMBER') {
      list = list.filter((c) => c.isMembershipActive);
    } else if (customerFilter !== 'ALL') {
      list = list.filter((c) => (c.rank || '').toLowerCase().includes(customerFilter.toLowerCase()));
    }

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.fullName && c.fullName.toLowerCase().includes(s)) ||
          (c.phone && c.phone.includes(s)) ||
          (c.email && c.email.toLowerCase().includes(s)) ||
          (c.membershipCardNumber && c.membershipCardNumber.toLowerCase().includes(s))
      );
    }

    return list;
  };

  return (
    <div className="relative print:p-0 print:bg-white">
      
      {/* Toast Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 print:hidden">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl shadow-xl border text-sm max-w-sm transition-all duration-300 transform translate-x-0 ${
              t.type === 'success' ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]/30' : 'bg-red-800 text-white border-red-900'
            }`}
          >
            {t.type === 'success' ? (
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#C5A059]" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-200" />
            )}
            <span className="font-semibold tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#E8E2D9] shadow-sm print:mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="pl-4 border-l-4 border-[#C5A059]">
            <h2 className="text-3xl font-extrabold font-serif bg-gradient-to-r from-[#4A121A] via-[#6b1d28] to-[#C5A059] bg-clip-text text-transparent">
              Báo Cáo & Thống Kê Doanh Nghiệp
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 font-medium tracking-wide uppercase print:hidden">
              Phân tích tổng hợp doanh thu, tồn kho, món ăn, hiệu suất nhân viên, thành viên và lợi nhuận Fine Dining.
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleExportExcel}
              className="py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#4A121A] text-xs font-bold rounded-xl border border-[#E8E2D9] shadow-2xs transition-all cursor-pointer flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Xuất File CSV / Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="py-2.5 px-5 bg-gradient-to-r from-[#4A121A] to-[#6b1d28] text-[#F5E6D3] hover:text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 border border-[#C5A059]/40"
            >
              <Printer className="h-4 w-4 text-[#C5A059]" /> In Báo Cáo (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#E8E2D9] rounded-2xl shadow-sm print:hidden">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#4A121A] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C5A059]" /> Từ ngày:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-bold text-gray-700 focus:outline-none focus:border-[#4A121A]"
          />
          <span className="text-xs font-bold text-[#4A121A] uppercase tracking-wider">Đến ngày:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-bold text-gray-700 focus:outline-none focus:border-[#4A121A]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setStartDate(d.toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[11px] font-extrabold text-[#4A121A] hover:bg-[#4A121A] hover:text-[#C5A059] transition-all cursor-pointer uppercase shadow-2xs"
          >
            7 ngày qua
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 30);
              setStartDate(d.toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] text-[11px] font-extrabold text-[#4A121A] hover:bg-[#4A121A] hover:text-[#C5A059] transition-all cursor-pointer uppercase shadow-2xs"
          >
            30 ngày qua
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mb-6 border-b border-[#E8E2D9] flex flex-wrap gap-x-6 gap-y-2 print:hidden">
        {[
          { key: 'revenue', label: 'Doanh Thu', icon: TrendingUp },
          { key: 'inventory', label: 'Kho & Vật Tư', icon: Package },
          { key: 'food', label: 'Thực Đơn & Món Ăn', icon: Utensils },
          { key: 'employee', label: 'Hiệu Suất Nhân Viên', icon: ChefHat },
          { key: 'customer', label: 'Thành Viên & Khách', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveReportTab(tab.key);
                setSearchTerm('');
              }}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-[#4A121A] text-[#4A121A]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Panels */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-[#E8E2D9]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tổng hợp báo cáo dữ liệu...</span>
        </div>
      ) : (
        <div>
          {/* TAB 1: REVENUE REPORT */}
          {activeReportTab === 'revenue' && revenueData && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#C5A059] border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Tổng doanh thu kỳ báo cáo</span>
                  <h3 className="text-2xl font-bold font-serif text-[#4A121A]">{formatCurrency(revenueData.totalRevenue)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-600 border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Doanh thu hôm nay</span>
                  <h3 className="text-2xl font-bold font-serif text-emerald-800">{formatCurrency(revenueData.todayRevenue)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-indigo-600 border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Doanh thu tháng này</span>
                  <h3 className="text-2xl font-bold font-serif text-indigo-800">{formatCurrency(revenueData.monthRevenue)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-500 border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Đơn hoàn tất / Tổng đơn</span>
                  <h3 className="text-2xl font-bold font-serif text-amber-900">{revenueData.completedOrders} / {revenueData.totalOrders} đơn</h3>
                </div>
              </div>

              {/* Daily Revenue Detail Table */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                <h4 className="text-base font-bold font-serif text-[#4A121A] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C5A059]" /> Chi tiết doanh thu từng ngày
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E8E2D9] text-left text-xs font-medium">
                    <thead className="bg-[#FAF7F2] text-[#4A121A] font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3.5">Ngày thực hiện</th>
                        <th className="px-6 py-3.5">Số lượng đơn hàng</th>
                        <th className="px-6 py-3.5 text-right">Tổng doanh thu ngày</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]/40 bg-white">
                      {revenueData.dailyPoints?.map((p, i) => (
                        <tr key={i} className="hover:bg-[#FAF7F2]/60 transition-all">
                          <td className="px-6 py-3.5 font-mono font-bold text-gray-800">{p.date}</td>
                          <td className="px-6 py-3.5 font-mono text-gray-600">{p.orderCount} đơn hàng</td>
                          <td className="px-6 py-3.5 text-right font-mono font-extrabold text-[#4A121A]">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY REPORT */}
          {activeReportTab === 'inventory' && inventoryData && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-[#C5A059] border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Tổng nguyên liệu kho</span>
                  <h3 className="text-2xl font-bold font-serif text-[#4A121A]">{inventoryData.totalIngredients} loại</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-500 border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Cảnh báo sắp hết (Low Stock)</span>
                  <h3 className="text-2xl font-bold font-serif text-amber-700">{inventoryData.lowStockCount} loại</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-rose-600 border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Đã hết hạn sử dụng</span>
                  <h3 className="text-2xl font-bold font-serif text-rose-700">{inventoryData.expiredCount} loại</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-600 border-x border-b border-[#E8E2D9] shadow-sm">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Ước tính giá trị tồn kho</span>
                  <h3 className="text-2xl font-bold font-serif text-emerald-800">{formatCurrency(inventoryData.estimatedStockValue)}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                <h4 className="text-base font-bold font-serif text-[#4A121A] mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C5A059]" /> Lịch sử biến động xuất / nhập kho gần đây
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E8E2D9] text-left text-xs font-medium">
                    <thead className="bg-[#FAF7F2] text-[#4A121A] font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3.5">Thời gian</th>
                        <th className="px-6 py-3.5">Nguyên liệu</th>
                        <th className="px-6 py-3.5">Loại thao tác</th>
                        <th className="px-6 py-3.5 text-right">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]/40 bg-white">
                      {inventoryData.recentMovements?.map((m, i) => (
                        <tr key={i} className="hover:bg-[#FAF7F2]/60 transition-all">
                          <td className="px-6 py-3.5 font-mono text-gray-500">{m.date}</td>
                          <td className="px-6 py-3.5 font-extrabold text-gray-800">{m.ingredientName}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${m.type === 'STOCK_IN' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}`}>
                              {m.type === 'STOCK_IN' ? '+ Nhập kho' : '- Xuất kho'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right font-mono font-bold text-gray-900">{m.quantity} {m.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FOOD REPORT */}
          {activeReportTab === 'food' && foodData && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                  <h4 className="text-base font-bold font-serif text-[#4A121A] mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C5A059]" /> Top 10 món ăn bán chạy nhất
                  </h4>
                  <div className="space-y-3">
                    {foodData.topSellingDishes?.map((dish, i) => (
                      <div key={i} className="flex justify-between items-center p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]/60 text-xs hover:border-[#C5A059]/40 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-[#4A121A] text-[#C5A059] flex items-center justify-center font-extrabold text-[10px] border border-[#C5A059]/40">
                            #{i+1}
                          </span>
                          <div>
                            <span className="font-extrabold text-gray-900 block">{dish.name}</span>
                            <span className="text-[9px] text-gray-400 uppercase font-semibold">{dish.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-extrabold text-[#4A121A] block">{formatCurrency(dish.totalRevenue)}</span>
                          <span className="text-[10px] text-gray-500 font-mono font-bold">{dish.quantitySold} suất đã bán</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                  <h4 className="text-base font-bold font-serif text-[#4A121A] mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#C5A059]" /> Tỷ lệ đóng góp doanh thu theo Danh mục
                  </h4>
                  <div className="space-y-4">
                    {foodData.categoryBreakdown?.map((cat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-gray-800 font-serif text-sm">{cat.categoryName}</span>
                          <span className="text-[#4A121A] font-mono">{formatCurrency(cat.revenue)} ({cat.percentage?.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#E8E2D9]/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#4A121A] to-[#C5A059] rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYEE REPORT */}
          {activeReportTab === 'employee' && employeeData && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-bold font-serif text-[#4A121A] flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-[#C5A059]" /> Bảng xếp hạng doanh số nhân viên
                  </h4>
                  <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Tổng nhân sự: {employeeData.totalEmployees} nhân viên</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E8E2D9] text-left text-xs font-medium">
                    <thead className="bg-[#FAF7F2] text-[#4A121A] font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3.5">Mã NV</th>
                        <th className="px-6 py-3.5">Họ và tên</th>
                        <th className="px-6 py-3.5">Vai trò</th>
                        <th className="px-6 py-3.5">Số đơn đã phục vụ</th>
                        <th className="px-6 py-3.5 text-right">Tổng doanh số tạo ra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]/40 bg-white">
                      {employeeData.employeePerformanceList?.map((emp, i) => (
                        <tr key={i} className="hover:bg-[#FAF7F2]/60 transition-all">
                          <td className="px-6 py-3.5 font-mono font-extrabold text-gray-700">{emp.employeeCode}</td>
                          <td className="px-6 py-3.5 font-extrabold text-gray-900">{emp.fullName}</td>
                          <td className="px-6 py-3.5 text-gray-500 uppercase text-[10px] font-bold">{emp.role}</td>
                          <td className="px-6 py-3.5 font-mono text-gray-700">{emp.ordersServed} đơn</td>
                          <td className="px-6 py-3.5 text-right font-mono font-extrabold text-[#4A121A]">{formatCurrency(emp.totalSales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER & MEMBERSHIP REPORT (WITH DYNAMIC CARDS & DETAILED CUSTOMER LIST) */}
          {activeReportTab === 'customer' && customerData && (
            <div className="space-y-6 animate-fade-in">
              {/* Interactive KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() => setCustomerFilter('ALL')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
                    customerFilter === 'ALL'
                      ? 'bg-gradient-to-br from-[#4A121A] to-[#6b1d28] text-white border-[#4A121A] shadow-md'
                      : 'bg-white border-[#E8E2D9] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${customerFilter === 'ALL' ? 'text-amber-200' : 'text-gray-400'}`}>
                      Tổng lượng thực khách
                    </span>
                    <Users className={`w-5 h-5 ${customerFilter === 'ALL' ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mt-2">{customerData.totalCustomers} thực khách</h3>
                  <span className={`text-[11px] mt-1 block font-medium ${customerFilter === 'ALL' ? 'text-amber-100/80' : 'text-gray-500'}`}>
                    Nhấn để xem toàn bộ danh sách khách hàng
                  </span>
                </div>

                <div
                  onClick={() => setCustomerFilter('ACTIVE_MEMBER')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
                    customerFilter === 'ACTIVE_MEMBER'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                      : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${customerFilter === 'ACTIVE_MEMBER' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                      Thẻ thành viên kích hoạt
                    </span>
                    <CreditCard className={`w-5 h-5 ${customerFilter === 'ACTIVE_MEMBER' ? 'text-white' : 'text-emerald-700'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold font-serif mt-2 ${customerFilter === 'ACTIVE_MEMBER' ? 'text-white' : 'text-emerald-950'}`}>
                    {customerData.membershipCount} thẻ kích hoạt
                  </h3>
                  <span className={`text-[11px] mt-1 block font-medium ${customerFilter === 'ACTIVE_MEMBER' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                    Nhấn để xem danh sách khách có thẻ thành viên
                  </span>
                </div>

                <div
                  onClick={() => setCustomerFilter('ALL')}
                  className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-500 border-x border-b border-[#E8E2D9] shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase">Tổng điểm Loyalty tích lũy</span>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-amber-900 mt-2">{customerData.totalLoyaltyPoints} points</h3>
                  <span className="text-[11px] text-gray-500 mt-1 block font-medium">Tích điểm thưởng tự động qua hóa đơn</span>
                </div>
              </div>

              {/* Membership Ranks Distribution Bar Cards */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                <h4 className="text-base font-bold font-serif text-[#4A121A] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#C5A059]" /> Phân bổ hạng thẻ (Click chọn từng hạng để lọc)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { rank: 'Thành viên', filterKey: 'Thành viên', color: 'border-slate-300 bg-slate-50 text-slate-800' },
                    { rank: 'Bạc', filterKey: 'Bạc', color: 'border-blue-300 bg-blue-50 text-blue-900' },
                    { rank: 'Vàng', filterKey: 'Vàng', color: 'border-amber-300 bg-amber-50 text-amber-950' },
                    { rank: 'Kim Cương', filterKey: 'Kim Cương', color: 'border-purple-300 bg-purple-50 text-purple-950' }
                  ].map((rCard) => {
                    const found = customerData.rankDistribution?.find((rd) => rd.rank?.toLowerCase().includes(rCard.rank.toLowerCase()));
                    const isSelected = customerFilter === rCard.filterKey;
                    return (
                      <div
                        key={rCard.rank}
                        onClick={() => setCustomerFilter(isSelected ? 'ALL' : rCard.filterKey)}
                        className={`cursor-pointer p-4 rounded-xl border text-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#4A121A] text-[#F5E6D3] border-[#C5A059] shadow-md ring-2 ring-[#C5A059]'
                            : `${rCard.color} hover:shadow-md`
                        }`}
                      >
                        <span className="text-[10px] font-extrabold uppercase block">{rCard.rank}</span>
                        <span className="text-xl font-bold font-serif block mt-1">{found ? found.count : 0} thực khách</span>
                        <span className="text-xs font-mono font-bold mt-0.5 block">{found ? found.percentage?.toFixed(1) : 0}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Customer & Membership List Table */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div>
                    <h4 className="text-base font-bold font-serif text-[#4A121A] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#C5A059]" /> Chi Tiết Danh Sách Khách Hàng & Thẻ Thành Viên
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Hiển thị {getFilteredCustomerList().length} / {customerData.totalCustomers} khách hàng theo bộ lọc.
                    </p>
                  </div>

                  {/* Search Customer Input */}
                  <div className="w-full sm:w-72 relative">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#C5A059]" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên, SĐT, mã thẻ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      className="form-input py-2 text-xs font-bold w-full bg-[#FAF7F2] border-[#E8E2D9] focus:border-[#4A121A] rounded-xl"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E8E2D9] text-left text-xs font-medium">
                    <thead className="bg-[#FAF7F2] text-[#4A121A] font-extrabold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-5 py-3.5">Thực khách</th>
                        <th className="px-5 py-3.5">Số điện thoại</th>
                        <th className="px-5 py-3.5">Thẻ thành viên</th>
                        <th className="px-5 py-3.5">Hạng thẻ</th>
                        <th className="px-5 py-3.5">Điểm tích lũy</th>
                        <th className="px-5 py-3.5 text-right">Tổng chi tiêu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D9]/40 bg-white">
                      {getFilteredCustomerList().length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 font-bold text-xs">
                            Không tìm thấy khách hàng phù hợp bộ lọc này.
                          </td>
                        </tr>
                      ) : (
                        getFilteredCustomerList().map((cust) => (
                          <tr key={cust.id} className="hover:bg-[#FAF7F2]/60 transition-all">
                            <td className="px-5 py-3.5">
                              <span className="font-extrabold text-gray-900 block">{cust.fullName}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{cust.email || 'Chưa cập nhật email'}</span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-gray-700 font-bold">{cust.phone || '---'}</td>
                            <td className="px-5 py-3.5">
                              {cust.isMembershipActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-extrabold text-[11px]">
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                  {cust.membershipCardNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic text-[11px]">Chưa kích hoạt</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  cust.rank === 'Kim Cương'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : cust.rank === 'Vàng'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : cust.rank === 'Bạc'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}
                              >
                                {cust.rank || 'Thành viên'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono font-bold text-amber-900">
                              ⭐ {cust.loyaltyPoints} pts
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono font-extrabold text-[#4A121A]">
                              {formatCurrency(cust.totalSpent)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
