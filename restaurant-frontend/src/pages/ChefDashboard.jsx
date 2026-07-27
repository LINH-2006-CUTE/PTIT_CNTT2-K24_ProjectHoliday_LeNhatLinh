import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  Flame,
  ChefHat,
  CheckCheck,
  Clock,
  Sparkles,
  Utensils,
  AlertCircle,
  Eye,
  Package,
  MapPin,
  X,
  BellRing,
  Check,
  RefreshCw,
  ListFilter,
  CircleDot,
  Timer,
  BoxSelect,
  WalletCards
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'PENDING',
    label: 'Chờ Tiếp Nhận',
    step: '01',
    accent: '#F59E0B',
    dot: 'bg-amber-400',
    header: 'bg-amber-50 border-amber-200 text-amber-900',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    card: 'border-amber-200 hover:border-amber-400',
  },
  {
    key: 'PREPARING',
    label: 'Chuẩn Bị',
    step: '02',
    accent: '#9333EA',
    dot: 'bg-purple-500',
    header: 'bg-purple-50 border-purple-200 text-purple-900',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    card: 'border-purple-200 hover:border-purple-400',
  },
  {
    key: 'COOKING',
    label: 'Đang Nấu',
    step: '03',
    accent: '#EA580C',
    dot: 'bg-orange-500 animate-pulse',
    header: 'bg-orange-50 border-orange-200 text-orange-900',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    card: 'border-orange-200 hover:border-orange-400',
  },
  {
    key: 'READY',
    label: 'Sẵn Sàng',
    step: '04',
    accent: '#16A34A',
    dot: 'bg-emerald-500',
    header: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    card: 'border-emerald-200 hover:border-emerald-400',
  },
  {
    key: 'COMPLETED',
    label: 'Hoàn Thành',
    step: '05',
    accent: '#6B7280',
    dot: 'bg-gray-400',
    header: 'bg-gray-50 border-gray-200 text-gray-700',
    badge: 'bg-gray-200 text-gray-700 border-gray-300',
    card: 'border-gray-200 hover:border-gray-400',
  },
];

const STATUS_VI = {
  PENDING:   'Chờ tiếp nhận',
  PREPARING: 'Chuẩn bị',
  COOKING:   'Đang nấu',
  READY:     'Sẵn sàng',
  COMPLETED: 'Hoàn thành',
};

const formatCurrency = (v) =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v || 0)} VND`;

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────
export default function ChefDashboard() {
  const [stats,  setStats]  = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' (4 Columns standard as requested), 'GRID' (100+ Orders), 'SUMMARY' (Aggregated Dish View)

  // Modals
  const [orderModal,  setOrderModal]  = useState(null);
  const [dishModal,   setDishModal]   = useState(null);
  const [recipeOrder, setRecipeOrder] = useState(null);
  const [recipeList,  setRecipeList]  = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  const load = async () => {
    try {
      const [sRes, oRes] = await Promise.all([
        api.get('/api/chef/dashboard/stats'),
        api.get('/api/chef/orders'),
      ]);
      if (sRes.data?.success) setStats(sRes.data.data);
      if (oRes.data?.success) setOrders(oRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/api/chef/orders/${orderId}/status`, { status });
      if (res.data?.success) {
        showToast(`✅ Đơn #${orderId} → ${STATUS_VI[status] || status}`);
        load();
        if (orderModal?.id === orderId) setOrderModal(res.data.data);
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi chuyển trạng thái đơn.');
    }
  };

  const openRecipeCheck = async (order) => {
    setRecipeOrder(order);
    setRecipeLoading(true);
    try {
      const res = await api.get(`/api/chef/orders/${order.id}/recipe-check`);
      if (res.data?.success) setRecipeList(res.data.data || []);
    } catch (e) {
      showToast('Không thể lấy danh sách nguyên liệu kho.');
    } finally {
      setRecipeLoading(false);
    }
  };

  const confirmDeduct = async () => {
    if (!recipeOrder) return;
    try {
      const res = await api.post(`/api/chef/orders/${recipeOrder.id}/deduct-ingredients`);
      if (res.data?.success) {
        showToast(`⚡ Xuất kho & chuyển Đơn #${recipeOrder.id} sang Chuẩn Bị thành công!`);
        setRecipeOrder(null);
        load();
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi xuất kho nguyên liệu.');
    }
  };

  // Filtered
  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hit =
        String(o.id).includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.tableName || '').toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (filterStatus === 'ALL') return true;
    const s = (o.status || '').toUpperCase();
    if (filterStatus === 'PENDING')   return ['PENDING','CONFIRMED','PAID'].includes(s);
    if (filterStatus === 'PREPARING') return s === 'PREPARING';
    if (filterStatus === 'COOKING')   return s === 'COOKING';
    if (filterStatus === 'READY')     return s === 'READY';
    if (filterStatus === 'COMPLETED') return s === 'COMPLETED';
    return true;
  });

  const byStatus = (key) => filtered.filter((o) => {
    const s = (o.status || '').toUpperCase();
    if (key === 'PENDING')   return ['PENDING','CONFIRMED','PAID'].includes(s);
    if (key === 'PREPARING') return s === 'PREPARING';
    if (key === 'COOKING')   return s === 'COOKING';
    if (key === 'READY')     return s === 'READY';
    if (key === 'COMPLETED') return s === 'COMPLETED';
    return false;
  });

  const aggregatedDishes = React.useMemo(() => {
    const map = {};
    filtered.forEach(o => {
      if (['COMPLETED'].includes((o.status || '').toUpperCase())) return;
      (o.items || []).forEach(item => {
        const name = item.dishName || 'Món ăn';
        if (!map[name]) {
          map[name] = { dishName: name, totalQuantity: 0, ordersCount: 0, items: [] };
        }
        map[name].totalQuantity += (item.quantity || 1);
        map[name].ordersCount += 1;
        map[name].items.push({ orderId: o.id, tableName: o.tableName, qty: item.quantity, status: o.status });
      });
    });
    return Object.values(map).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [filtered]);

  const FILTER_TABS = [
    { key: 'ALL',       label: 'Tất Cả Hàng Đợi', icon: ListFilter, count: orders.length },
    { key: 'PENDING',   label: 'Bước 1: Chờ', icon: Clock, count: byStatus('PENDING').length },
    { key: 'PREPARING', label: 'Bước 2: Chuẩn Bị', icon: Package, count: byStatus('PREPARING').length },
    { key: 'COOKING',   label: 'Bước 3: Đang Nấu', icon: Flame, count: byStatus('COOKING').length },
    { key: 'READY',     label: 'Bước 4: Sẵn Sàng', icon: CheckCheck, count: byStatus('READY').length },
    { key: 'COMPLETED', label: 'Bước 5: Hoàn Thành', icon: Check, count: byStatus('COMPLETED').length },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#1A0A05] font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-[99999] bg-[#1A0A05] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#D97706]/40 text-xs font-bold uppercase tracking-wider flex items-center gap-3 animate-bounce">
          <BellRing className="w-5 h-5 text-[#D97706] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <ChefNavbar />

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#1A0A05] via-[#3A1C14] to-[#1A0A05] text-white rounded-3xl px-8 py-7 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[4px] text-[#D97706]">
                KDS · Hệ Thống Điều Phối Bếp
              </span>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <CircleDot className="w-2 h-2 animate-pulse" /> Thời Gian Thực
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Bảng Điều Phối Bếp Trưởng — 5 Giai Đoạn
            </h1>
            <p className="text-[11px] text-white/50 font-light">
              Chờ Tiếp Nhận → Chuẩn Bị → Đang Nấu → Sẵn Sàng → Hoàn Thành
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Tìm mã đơn, bàn, khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs rounded-2xl focus:outline-none focus:border-[#D97706] w-56"
              />
            </div>
            <button
              onClick={load}
              className="p-2.5 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Đơn Chờ Xử Lý',
              value: stats?.pendingOrdersCount ?? 0,
              icon: Clock,
              color: 'text-amber-600',
              bg: 'bg-amber-50 border-amber-200',
              iconBg: 'bg-amber-100',
              hint: 'Nhấn để lọc',
              fkey: 'PENDING',
            },
            {
              label: 'Đơn Đang Nấu',
              value: stats?.cookingOrdersCount ?? 0,
              icon: Flame,
              color: 'text-orange-600',
              bg: 'bg-orange-50 border-orange-200',
              iconBg: 'bg-orange-100',
              hint: 'Nhấn để lọc',
              fkey: 'COOKING',
            },
            {
              label: 'Đơn Hoàn Thành',
              value: stats?.completedOrdersCount ?? 0,
              icon: CheckCheck,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 border-emerald-200',
              iconBg: 'bg-emerald-100',
              hint: 'Nhấn để lọc',
              fkey: 'COMPLETED',
            },
          ].map((card) => {
            const Icon = card.icon;
            const active = filterStatus === card.fkey;
            return (
              <div
                key={card.label}
                onClick={() => card.fkey && setFilterStatus(active ? 'ALL' : card.fkey)}
                className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all duration-200 ${card.bg} ${
                  card.fkey ? 'cursor-pointer hover:shadow-md' : ''
                } ${active ? 'ring-2 ring-offset-1 ring-[#D97706]' : ''}`}
              >
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-black font-mono ${card.color}`}>
                      {loading ? '–' : card.value}
                    </span>
                    {card.unit && <span className="text-xs font-bold text-gray-400">{card.unit}</span>}
                  </div>
                  <p className={`text-[10px] font-semibold mt-1 ${card.color} opacity-80`}>{card.hint}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Control Bar: View Switcher & Step Filter Tabs ── */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white border border-[#E8E2D9] p-3 sm:p-4 rounded-3xl shadow-sm">
          
          {/* Step Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-[#3A1C14] text-[#FAF7F2] shadow-md border border-[#D97706]/40'
                      : 'bg-[#FAF7F2] text-gray-600 hover:bg-gray-200 border border-gray-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#D97706]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    active ? 'bg-[#D97706] text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-2xl border border-gray-200 shrink-0 self-end xl:self-auto">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID' ? 'bg-[#3A1C14] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Chế độ Thẻ Lớn Grid (Tốt nhất cho 100+ đơn)"
            >
              <WalletCards className="w-4 h-4 text-[#D97706]" />
              <span>Lưới Thẻ Lớn (100+ Đơn)</span>
            </button>

            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'KANBAN' ? 'bg-[#3A1C14] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Chế độ Kanban 5 cột"
            >
              <BoxSelect className="w-4 h-4 text-amber-500" />
              <span>Kanban 4 Cột (Chuẩn KDS)</span>
            </button>

            <button
              onClick={() => setViewMode('SUMMARY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'SUMMARY' ? 'bg-[#3A1C14] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tổng hợp tổng số lượng từng món cần nấu"
            >
              <Utensils className="w-4 h-4 text-emerald-500" />
              <span>Gộp Món Cần Nấu</span>
            </button>
          </div>
        </div>

        {/* ── Main Display Area ── */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu bếp...
          </div>
        ) : viewMode === 'SUMMARY' ? (
          /* ── SUMMARY MODE: AGGREGATED DISHES VIEW ── */
          <div className="space-y-4 animate-fade-in">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-bold">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Tổng hợp số lượng các món ăn cần chế biến ngay (Tất cả các đơn đang chờ & nấu)</span>
              </div>
              <span className="font-mono bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs">
                {aggregatedDishes.length} Loại món khác nhau
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {aggregatedDishes.map((dish, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <h4 className="font-serif font-bold text-base text-[#1A0A05] line-clamp-2">{dish.dishName}</h4>
                    <span className="px-3 py-1.5 bg-[#4A121A] text-[#F5E6D3] font-black text-sm font-mono rounded-xl shrink-0 shadow-xs">
                      ×{dish.totalQuantity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Xuất hiện trong <strong>{dish.ordersCount} đơn hàng</strong>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                    {dish.items.map((it, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold bg-[#FAF7F2] text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                        #{it.orderId} ({it.tableName || 'Mang về'}): x{it.qty}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'GRID' ? (
          /* ── GRID MODE: HIGH CAPACITY RESPONSIVE GRID (100+ ORDERS) ── */
          <div className="space-y-4 animate-fade-in">
            {filtered.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-300 text-center text-gray-400 space-y-2">
                <ChefHat className="w-12 h-12 text-[#D97706] mx-auto opacity-50" />
                <p className="text-sm font-bold text-gray-600">Không có đơn hàng nào khớp với bộ lọc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((order) => {
                  const statusKey = (order.status || 'PENDING').toUpperCase();
                  const currentStepInfo = COLUMNS.find(c => c.key === statusKey) || COLUMNS[0];

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                        order.isNew ? 'ring-2 ring-red-400' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        {/* Order Ribbon & Step Indicator */}
                        <div className={`px-4 py-2.5 flex justify-between items-center border-b text-xs ${currentStepInfo.header}`}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${currentStepInfo.dot}`} />
                            <span className="font-extrabold uppercase tracking-wider">
                              Bước {currentStepInfo.step}: {currentStepInfo.label}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] font-bold opacity-80 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(order.orderDate)}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 space-y-3.5">
                          {/* Top Info */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-base font-black font-mono text-[#1A0A05]">ĐƠN #{order.id}</h4>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] mt-0.5">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>{order.tableName || 'Bàn Mang về'}</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-[#FAF7F2] text-[#4A121A] text-xs font-extrabold rounded-xl border border-gray-200">
                              {order.customerName || 'Khách Hàng'}
                            </span>
                          </div>

                          {/* 5-Step Visual Progress Bar */}
                          <div className="bg-[#FAF7F2] p-2 rounded-2xl border border-gray-200/80 space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500 px-1">
                              <span className={statusKey === 'PENDING' ? 'text-amber-600 font-bold' : ''}>1. Chờ</span>
                              <span className={statusKey === 'PREPARING' ? 'text-purple-600 font-bold' : ''}>2. Chuẩn bị</span>
                              <span className={statusKey === 'COOKING' ? 'text-orange-600 font-bold' : ''}>3. Nấu</span>
                              <span className={statusKey === 'READY' ? 'text-emerald-600 font-bold' : ''}>4. Sẵn sàng</span>
                              <span className={statusKey === 'COMPLETED' ? 'text-gray-800 font-bold' : ''}>5. Xong</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 h-1.5">
                              <div className={`rounded-full ${['PENDING','PREPARING','COOKING','READY','COMPLETED'].includes(statusKey) ? 'bg-amber-500' : 'bg-gray-200'}`} />
                              <div className={`rounded-full ${['PREPARING','COOKING','READY','COMPLETED'].includes(statusKey) ? 'bg-purple-500' : 'bg-gray-200'}`} />
                              <div className={`rounded-full ${['COOKING','READY','COMPLETED'].includes(statusKey) ? 'bg-orange-500' : 'bg-gray-200'}`} />
                              <div className={`rounded-full ${['READY','COMPLETED'].includes(statusKey) ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                              <div className={`rounded-full ${['COMPLETED'].includes(statusKey) ? 'bg-gray-700' : 'bg-gray-200'}`} />
                            </div>
                          </div>

                          {/* Dish Items */}
                          <div className="space-y-1.5 pt-1">
                            {(order.items || []).map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => { setOrderModal(order); setDishModal(item); }}
                                className="flex justify-between items-center text-xs font-bold text-[#1A0A05] p-2 rounded-xl bg-gray-50 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Utensils className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="truncate">{item.dishName}</span>
                                </span>
                                <span className="font-mono text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-gray-200 shrink-0">
                                  ×{item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button Footer */}
                      <div className="p-4 bg-[#FAF7F2]/80 border-t border-gray-200 space-y-2">
                        <button
                          onClick={() => setOrderModal(order)}
                          className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Chi Tiết Đơn</span>
                        </button>

                        {statusKey === 'PENDING' && (
                          <button
                            onClick={() => openRecipeCheck(order)}
                            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                          >
                            <Package className="w-4 h-4 text-purple-200" />
                            <span>1 ➔ 2: Xuất Kho & Chuẩn Bị</span>
                          </button>
                        )}

                        {statusKey === 'PREPARING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COOKING')}
                            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                          >
                            <Flame className="w-4 h-4 text-yellow-200 animate-pulse" />
                            <span>2 ➔ 3: Bắt Đầu Nấu 🔥</span>
                          </button>
                        )}

                        {statusKey === 'COOKING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                          >
                            <CheckCheck className="w-4 h-4" />
                            <span>3 ➔ 4: Sẵn Sàng Ra Món ✨</span>
                          </button>
                        )}

                        {statusKey === 'READY' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            className="w-full flex items-center justify-center gap-2 bg-[#1A0A05] hover:bg-[#3A1C14] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>4 ➔ 5: Hoàn Thành Đơn ✅</span>
                          </button>
                        )}

                        {statusKey === 'COMPLETED' && (
                          <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider">
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            <span>Bước 5: Đã Hoàn Thành</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── KANBAN MODE: 5 VERTICAL COLUMNS ── */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start animate-fade-in">
            {COLUMNS.map((col) => {
              const colOrders = byStatus(col.key);
              return (
                <div key={col.key} className="flex flex-col gap-3 min-h-[600px]">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${col.header}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${col.dot}`} />
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Bước {col.step}</span>
                        <p className="text-xs font-black uppercase tracking-wider leading-tight">{col.label}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${col.badge}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Cards */}
                  {colOrders.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center bg-white/60 rounded-2xl border border-dashed border-gray-300 py-10">
                      <p className="text-[11px] text-gray-400 italic text-center">Chưa có đơn hàng</p>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${col.card} ${
                          order.isNew ? 'ring-2 ring-red-400' : ''
                        }`}
                      >
                        {order.isNew && (
                          <div className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest text-center py-0.5 flex items-center justify-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Đơn Mới Nhất
                          </div>
                        )}

                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-black font-mono text-[#1A0A05]">ĐƠN #{order.id}</p>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{order.tableName || 'Mang về'}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatTime(order.orderDate)}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] rounded-xl px-3 py-2 text-[11px] space-y-0.5">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <ChefHat className="w-3 h-3 text-[#D97706] shrink-0" />
                              <span className="font-bold text-[#1A0A05]">{order.customerName}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {(order.items || []).map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => { setOrderModal(order); setDishModal(item); }}
                                className="flex justify-between items-center text-[11px] font-bold text-[#1A0A05] cursor-pointer hover:text-[#D97706] transition-colors group"
                              >
                                <span className="line-clamp-1 flex items-center gap-1">
                                  <Utensils className="w-3 h-3 text-gray-300 group-hover:text-[#D97706] shrink-0" />
                                  {item.dishName}
                                </span>
                                <span className="font-mono text-amber-700 ml-1 shrink-0">×{item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-100" />

                          <div className="space-y-2">
                            <button
                              onClick={() => setOrderModal(order)}
                              className="w-full flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem Chi Tiết
                            </button>

                            {col.key === 'PENDING' && (
                              <button
                                onClick={() => openRecipeCheck(order)}
                                className="w-full flex items-center justify-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                              >
                                <Package className="w-3.5 h-3.5 text-purple-200" />
                                Xuất Kho & Chuẩn Bị
                              </button>
                            )}
                            {col.key === 'PREPARING' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'COOKING')}
                                className="w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                              >
                                <Flame className="w-3.5 h-3.5 text-yellow-200" />
                                Bắt Đầu Nấu
                              </button>
                            )}
                            {col.key === 'COOKING' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'READY')}
                                className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Sẵn Sàng Phục Vụ
                              </button>
                            )}
                            {col.key === 'READY' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                className="w-full flex items-center justify-center gap-1.5 bg-[#1A0A05] hover:bg-[#3A1C14] text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Hoàn Thành Đơn
                              </button>
                            )}
                            {col.key === 'COMPLETED' && (
                              <div className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider">
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Đã Hoàn Tất
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ══ MODAL 1: Chi Tiết Đơn Hàng ══ */}
      {orderModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#FAF7F2] border border-[#D97706]/30 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Chi Tiết Đơn Hàng</p>
                  <h3 className="text-lg font-bold font-serif text-[#1A0A05]">ĐƠN #{orderModal.id}</h3>
                </div>
              </div>
              <button onClick={() => setOrderModal(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tên Khách Hàng', value: orderModal.customerName },
                  { label: 'Số Điện Thoại',  value: orderModal.customerPhone || 'N/A' },
                  { label: 'Loại Đơn Hàng',  value: orderModal.orderType },
                  { label: 'Vị Trí / Bàn',   value: orderModal.tableName || 'Mang về' },
                ].map((f) => (
                  <div key={f.label} className="bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className="font-bold text-[#1A0A05]">{f.value}</p>
                  </div>
                ))}
                <div className="col-span-2 bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Thời Gian Đặt Món</p>
                  <p className="font-bold text-[#1A0A05] font-mono">{new Date(orderModal.orderDate).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {/* Dish List */}
              <div>
                <p className="text-[11px] font-black text-[#1A0A05] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#D97706]" />
                  Danh Sách Món ({orderModal.items?.length || 0} món) — Bấm để xem công thức
                </p>
                <div className="space-y-2">
                  {(orderModal.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setDishModal(item)}
                      className="bg-[#FAF7F2] hover:bg-amber-50 border border-gray-200 hover:border-[#D97706] p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80'}
                          alt={item.dishName}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#1A0A05] group-hover:text-[#D97706] transition-colors text-sm">{item.dishName}</p>
                          <p className="text-gray-500 font-mono mt-0.5">×{item.quantity} · {item.prepTime || 15} phút</p>
                          {item.note && <p className="text-red-600 font-bold italic mt-0.5">⚠️ "{item.note}"</p>}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shrink-0 ${
                        item.cookingStatus === 'COOKING'  ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        item.cookingStatus === 'READY'    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        item.cookingStatus === 'PREPARING'? 'bg-purple-100 text-purple-800 border-purple-300' :
                        'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        {STATUS_VI[item.cookingStatus] || 'Chờ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setOrderModal(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ══ MODAL 2: Chi Tiết Món Ăn & Công Thức ══ */}
      {dishModal && (
        <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#D97706]" />
                <h3 className="text-base font-bold font-serif text-[#1A0A05]">Thông Tin Món & Công Thức</h3>
              </div>
              <button onClick={() => setDishModal(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {/* Dish info */}
              <div className="flex gap-4 items-center bg-[#FAF7F2] p-4 rounded-2xl border border-gray-200">
                <img
                  src={dishModal.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80'}
                  alt={dishModal.dishName}
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0"
                />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-[#1A0A05]">{dishModal.dishName}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[10px] font-bold">
                      <WalletCards className="w-3 h-3" /> {formatCurrency(dishModal.price)}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-[10px] font-bold">
                      <Timer className="w-3 h-3" /> {dishModal.prepTime || 15} phút
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-full text-[10px] font-bold">
                      ×{dishModal.quantity} phần
                    </span>
                  </div>
                  {dishModal.description && (
                    <p className="text-gray-500 italic leading-relaxed">{dishModal.description}</p>
                  )}
                </div>
              </div>

              {/* Recipe */}
              <div>
                <p className="text-[11px] font-black text-[#1A0A05] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#D97706]" />
                  Nguyên Liệu Công Thức (×{dishModal.quantity} phần):
                </p>
                {dishModal.recipes && dishModal.recipes.length > 0 ? (
                  <div className="bg-[#FAF7F2] rounded-2xl border border-gray-200 divide-y divide-gray-100 font-mono">
                    {dishModal.recipes.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2.5">
                        <span className="font-bold text-[#1A0A05] font-sans">• {r.ingredientName}</span>
                        <span className="font-bold text-[#D97706]">
                          {((r.quantityRequired || 0) * dishModal.quantity).toFixed(3)} {r.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-dashed border-gray-300 text-gray-400 italic text-center text-xs">
                    {dishModal.ingredients || 'Chưa có công thức nguyên liệu trong hệ thống.'}
                  </div>
                )}
              </div>

              {/* Special note */}
              {dishModal.note && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-red-700 font-black uppercase text-[11px]">
                    <AlertCircle className="w-4 h-4" /> Ghi Chú Đặc Biệt Của Khách
                  </div>
                  <p className="text-red-700 italic text-xs">"{dishModal.note}"</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setDishModal(null)}
              className="w-full bg-[#1A0A05] hover:bg-[#3A1C14] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              Đã Nắm Thông Tin
            </button>
          </div>
        </div>
      )}

      {/* ══ MODAL 3: Xuất Kho Nguyên Liệu ══ */}
      {recipeOrder && (
        <div className="fixed inset-0 z-[10002] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Xuất Kho Nguyên Liệu</p>
                  <h3 className="text-lg font-bold font-serif text-[#1A0A05]">Đơn #{recipeOrder.id}</h3>
                </div>
              </div>
              <button onClick={() => setRecipeOrder(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 cursor-pointer transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-[11px] leading-relaxed">
                <strong className="font-black">Quy trình:</strong> Kiểm tra định lượng → Bấm <em>"Xác Nhận Xuất Kho"</em>
                → Hệ thống tự trừ tồn kho MySQL và chuyển đơn sang <strong>Chuẩn Bị</strong> để khách theo dõi trực tiếp.
              </div>

              {recipeLoading ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">
                  Đang tính định lượng nguyên liệu...
                </div>
              ) : recipeList.length === 0 ? (
                <div className="py-8 text-center bg-[#FAF7F2] rounded-2xl border border-gray-200 text-xs text-gray-500">
                  Các món không cần xuất kho hoặc chưa có công thức trong hệ thống.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FAF7F2]">
                      <tr className="text-[10px] uppercase text-gray-500 font-black tracking-wider">
                        <th className="py-3 px-4">Nguyên Liệu</th>
                        <th className="py-3 px-4">Cần Dùng</th>
                        <th className="py-3 px-4">Tồn Kho</th>
                        <th className="py-3 px-4">Tình Trạng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                      {recipeList.map((r) => (
                        <tr key={r.ingredientId} className="hover:bg-[#FAF7F2] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#1A0A05] font-sans">{r.ingredientName}</td>
                          <td className="py-3 px-4 font-bold text-[#D97706]">{r.quantityRequired?.toFixed(3)} {r.unit}</td>
                          <td className="py-3 px-4 text-gray-600">{r.currentStockQuantity?.toFixed(2)} {r.unit}</td>
                          <td className="py-3 px-4">
                            {r.isSufficient ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase w-fit">
                                <Check className="w-2.5 h-2.5" /> Đủ Hàng
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-black uppercase w-fit">
                                <AlertCircle className="w-2.5 h-2.5" /> Thiếu Kho
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-3 shrink-0 pt-1 border-t border-gray-100">
              <button
                onClick={() => setRecipeOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Bỏ Qua
              </button>
              <button
                onClick={confirmDeduct}
                className="flex-1 bg-[#1A0A05] hover:bg-[#3A1C14] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                Xác Nhận Xuất Kho & Chuẩn Bị
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
