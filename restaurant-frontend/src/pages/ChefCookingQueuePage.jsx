import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  Flame,
  ChefHat,
  CheckCircle2,
  Clock,
  Sparkles,
  BellRing,
  Eye,
  Package,
  X,
  MapPin,
  User,
  Utensils,
  PlayCircle,
  Timer,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Status badge helper
const STATUS_MAP = {
  PENDING:   { label: 'Chờ Tiếp Nhận', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  PREPARING: { label: 'Chuẩn Bị',      cls: 'bg-purple-100 text-purple-800 border-purple-300' },
  COOKING:   { label: 'Đang Nấu 🔥',   cls: 'bg-orange-100 text-orange-800 border-orange-300' },
  READY:     { label: 'Sẵn Sàng ✅',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  COMPLETED: { label: 'Hoàn Thành',    cls: 'bg-gray-100 text-gray-600 border-gray-300' },
  PAID:      { label: 'Đã Thanh Toán', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP['PENDING'];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function ChefCookingQueuePage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);   // orderId expanded
  const [expandedItem, setExpandedItem]   = useState(null);   // {orderId, itemId}

  // Cooking time input per item
  const [cookingTimes, setCookingTimes] = useState({});       // {itemId: minutes}

  // Recipe check state
  const [recipeModal, setRecipeModal]     = useState(null);   // order object
  const [recipeList, setRecipeList]       = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 8000);
    return () => clearInterval(iv);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/chef/orders');
      if (res.data?.success) setOrders(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ---- Order-level status update ----
  const handleOrderStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/api/chef/orders/${orderId}/status`, { status });
      if (res.data?.success) {
        showToast(`✅ Đơn #${orderId} → ${STATUS_MAP[status]?.label || status}`);
        fetchOrders();
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi chuyển trạng thái đơn.');
    }
  };

  // ---- Item-level status update ----
  const handleItemStatus = async (itemId, newStatus) => {
    try {
      const res = await api.put(`/api/chef/items/${itemId}/status`, { cookingStatus: newStatus });
      if (res.data?.success) {
        showToast(`🍳 Món → ${STATUS_MAP[newStatus]?.label || newStatus}`);
        fetchOrders();
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi cập nhật trạng thái món.');
    }
  };

  // ---- Recipe check + deduct ----
  const openRecipeModal = async (order) => {
    setRecipeModal(order);
    setRecipeLoading(true);
    try {
      const res = await api.get(`/api/chef/orders/${order.id}/recipe-check`);
      if (res.data?.success) setRecipeList(res.data.data || []);
    } catch (e) { showToast('Không lấy được danh sách nguyên liệu.'); }
    finally { setRecipeLoading(false); }
  };

  const confirmDeduct = async () => {
    if (!recipeModal) return;
    try {
      const res = await api.post(`/api/chef/orders/${recipeModal.id}/deduct-ingredients`);
      if (res.data?.success) {
        showToast(`⚡ Xuất kho & Chuẩn bị Đơn #${recipeModal.id} thành công!`);
        setRecipeModal(null);
        fetchOrders();
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi xuất kho nguyên liệu.');
    }
  };

  // ---- Notify waiter ----
  const notifyWaiter = async (orderId) => {
    try {
      await api.post(`/api/chef/orders/${orderId}/notify-waiter`);
      showToast('🔔 Đã gửi thông báo xuống Phục vụ / Quầy trả đồ!');
    } catch (e) {
      showToast('Lỗi khi gửi thông báo waiter.');
    }
  };

  const formatCurrency = (v) =>
    `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v || 0)} VND`;

  const toggleExpandOrder = (id) =>
    setExpandedOrder(prev => prev === id ? null : id);

  const toggleExpandItem = (key) =>
    setExpandedItem(prev => prev === key ? null : key);

  // Colour for order card border by status
  const cardBorderClass = (status) => {
    if (status === 'COOKING')   return 'border-orange-400 ring-1 ring-orange-300';
    if (status === 'PREPARING') return 'border-purple-400 ring-1 ring-purple-200';
    if (status === 'READY')     return 'border-emerald-400 ring-1 ring-emerald-200';
    if (status === 'COMPLETED') return 'border-gray-300 opacity-70';
    return 'border-amber-300 ring-1 ring-amber-200';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-6 z-[99999] bg-[#3A1C14] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#D97706]/40 text-xs font-bold uppercase tracking-wider animate-bounce flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <ChefNavbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#3A1C14] via-[#6B2D1E] to-[#3A1C14] text-white rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D97706]">
              KDS · Cooking Queue · Real-Time
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Hàng Chờ Chế Biến — Từng Món & Từng Đơn
            </h1>
            <p className="text-[11px] text-white/70 font-light">
              Sắp xếp theo thời gian đặt mới nhất lên đầu. Bấm vào đơn để xem chi tiết và thao tác.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Tải Lại
          </button>
        </div>

        {/* ── Orders List ── */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Đang tải hàng chờ bếp...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <ChefHat className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-400">Chưa có đơn nào trong hàng đợi bếp.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const orderStatus = order.status?.toUpperCase() || 'PENDING';
              const isNew = order.isNew;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl border shadow-lg transition-all duration-300 overflow-hidden ${cardBorderClass(orderStatus)} ${isNew ? 'ring-2 ring-red-400' : ''}`}
                >
                  {/* ── Order Header (always visible) ── */}
                  <div
                    className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                    onClick={() => toggleExpandOrder(order.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status indicator dot */}
                      <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                        orderStatus === 'COOKING'   ? 'bg-orange-500 animate-pulse' :
                        orderStatus === 'PREPARING' ? 'bg-purple-500 animate-pulse' :
                        orderStatus === 'READY'     ? 'bg-emerald-500' :
                        orderStatus === 'COMPLETED' ? 'bg-gray-400' :
                        'bg-amber-500 animate-pulse'
                      }`} />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black font-mono text-[#3A1C14]">
                            ORDER #{order.id}
                          </span>
                          <StatusBadge status={orderStatus} />
                          {isNew && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-bounce">
                              🔥 MỚI
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                            {order.tableName || 'Mang về'}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {order.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-bold text-[#3A1C14]">
                            {order.items?.length || 0} món • {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick action buttons (collapse-independent) */}
                    <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
                      {/* PENDING → PREPARING (via recipe check) */}
                      {(orderStatus === 'PENDING' || orderStatus === 'PAID') && (
                        <button
                          onClick={() => openRecipeModal(order)}
                          className="px-3.5 py-2 bg-purple-700 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-purple-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-200" />
                          <span>Chuẩn Bị</span>
                        </button>
                      )}

                      {/* PREPARING → COOKING */}
                      {orderStatus === 'PREPARING' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'COOKING')}
                          className="px-3.5 py-2 bg-orange-600 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-orange-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <Flame className="w-3.5 h-3.5 text-yellow-200" />
                          <span>Bắt Đầu Nấu</span>
                        </button>
                      )}

                      {/* COOKING → READY */}
                      {orderStatus === 'COOKING' && (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'READY')}
                          className="px-3.5 py-2 bg-emerald-600 text-white text-[11px] font-bold uppercase rounded-xl hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sẵn Sàng</span>
                        </button>
                      )}

                      {/* READY → Notify Waiter + COMPLETED */}
                      {orderStatus === 'READY' && (
                        <>
                          <button
                            onClick={() => notifyWaiter(order.id)}
                            className="px-3.5 py-2 bg-[#D97706] text-white text-[11px] font-bold uppercase rounded-xl hover:bg-[#b45d03] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <BellRing className="w-3.5 h-3.5 animate-bounce" />
                            <span>Báo Waiter</span>
                          </button>
                          <button
                            onClick={() => handleOrderStatus(order.id, 'COMPLETED')}
                            className="px-3.5 py-2 bg-[#3A1C14] text-white text-[11px] font-bold uppercase rounded-xl hover:bg-[#5a2c20] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hoàn Thành</span>
                          </button>
                        </>
                      )}

                      {/* COMPLETED badge */}
                      {orderStatus === 'COMPLETED' && (
                        <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-black uppercase rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✅ Đã Xong</span>
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => toggleExpandOrder(order.id)}
                        className={`px-3.5 py-2 border text-[11px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          isExpanded ? 'bg-[#3A1C14] text-white border-[#3A1C14]' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Thu Gọn' : 'Chi Tiết'}</span>
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded Details ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 sm:px-6 pb-6 pt-5 space-y-4 bg-[#FAF7F2]/60">

                      {/* Customer info row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono">
                        <div className="bg-white p-3 rounded-2xl border border-gray-200">
                          <span className="text-gray-400 block font-sans font-bold uppercase text-[10px] mb-0.5">Khách Hàng</span>
                          <strong className="text-[#3A1C14]">{order.customerName}</strong>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-200">
                          <span className="text-gray-400 block font-sans font-bold uppercase text-[10px] mb-0.5">SĐT</span>
                          <strong className="text-[#3A1C14]">{order.customerPhone || 'N/A'}</strong>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-200">
                          <span className="text-gray-400 block font-sans font-bold uppercase text-[10px] mb-0.5">Loại Đơn</span>
                          <strong className="text-[#D97706]">{order.orderType || order.tableName || 'Mang về'}</strong>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-200">
                          <span className="text-gray-400 block font-sans font-bold uppercase text-[10px] mb-0.5">Thời Gian Đặt</span>
                          <strong className="text-[#3A1C14]">{new Date(order.orderDate).toLocaleString('vi-VN')}</strong>
                        </div>
                      </div>

                      {/* ── Dish Items ── */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-black text-[#3A1C14] uppercase tracking-wider">
                          <Utensils className="w-4 h-4 text-[#D97706]" />
                          <span>Danh Sách Món Ăn Cần Chế Biến ({order.items?.length || 0} món)</span>
                        </div>

                        {(order.items || []).map((item, idx) => {
                          const itemKey = `${order.id}-${item.itemId || idx}`;
                          const isItemExpanded = expandedItem === itemKey;
                          const itemStatus = item.cookingStatus?.toUpperCase() || 'PENDING';

                          return (
                            <div
                              key={itemKey}
                              className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${
                                itemStatus === 'COOKING' ? 'border-orange-300' :
                                itemStatus === 'READY'   ? 'border-emerald-300' :
                                'border-gray-200'
                              }`}
                            >
                              {/* Item header row */}
                              <div
                                className="p-4 flex items-center justify-between gap-3 cursor-pointer"
                                onClick={() => toggleExpandItem(itemKey)}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80'}
                                    alt={item.dishName}
                                    className="h-12 w-12 rounded-xl object-cover shrink-0 border border-gray-100"
                                  />
                                  <div className="space-y-0.5">
                                    <h5 className="font-bold text-[13px] text-[#3A1C14]">{item.dishName}</h5>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                                      <span>x{item.quantity}</span>
                                      {item.prepTime && (
                                        <span className="flex items-center gap-1 text-[#D97706] font-bold">
                                          <Timer className="w-3 h-3" /> {item.prepTime} phút
                                        </span>
                                      )}
                                    </div>
                                    {item.note && (
                                      <p className="text-[10px] text-red-600 font-bold italic">⚠️ "{item.note}"</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <StatusBadge status={itemStatus} />
                                  <Eye className={`w-4 h-4 transition-all ${isItemExpanded ? 'text-[#D97706]' : 'text-gray-300'}`} />
                                </div>
                              </div>

                              {/* Item expanded detail */}
                              {isItemExpanded && (
                                <div className="border-t border-gray-100 p-4 bg-[#FAF7F2] space-y-4">

                                  {/* Description */}
                                  {item.description && (
                                    <div className="text-[11px] text-gray-600 italic bg-white p-3 rounded-xl border border-gray-200">
                                      "{item.description}"
                                    </div>
                                  )}

                                  {/* Dish info pills */}
                                  <div className="flex flex-wrap gap-2">
                                    {item.calories && (
                                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold">
                                        🔥 {item.calories} kcal
                                      </span>
                                    )}
                                    {item.spiciness && (
                                      <span className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-[10px] font-bold">
                                        🌶️ {item.spiciness}
                                      </span>
                                    )}
                                    {item.prepTime && (
                                      <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-[10px] font-bold">
                                        ⏱️ {item.prepTime} phút
                                      </span>
                                    )}
                                  </div>

                                  {/* Recipe ingredients */}
                                  <div>
                                    <div className="text-[11px] font-bold text-[#3A1C14] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <Package className="w-3.5 h-3.5 text-[#D97706]" />
                                      Nguyên Liệu Công Thức (x{item.quantity} phần):
                                    </div>
                                    {item.recipes && item.recipes.length > 0 ? (
                                      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 text-[11px] font-mono">
                                        {item.recipes.map((r, ri) => (
                                          <div key={ri} className="flex justify-between items-center px-3.5 py-2">
                                            <span className="font-bold text-[#3A1C14] font-sans">• {r.ingredientName}</span>
                                            <span className="font-bold text-[#D97706]">
                                              {((r.quantityRequired || 0) * item.quantity).toFixed(3)} {r.unit}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : item.ingredients ? (
                                      <div className="bg-white rounded-xl border border-gray-200 p-3 text-[11px] text-gray-600 italic">
                                        {item.ingredients}
                                      </div>
                                    ) : (
                                      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-3 text-[11px] text-gray-400 text-center">
                                        Chưa có công thức nguyên liệu trong hệ thống.
                                      </div>
                                    )}
                                  </div>

                                  {/* Cooking time input */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 flex-1">
                                      <Timer className="w-4 h-4 text-[#D97706] shrink-0" />
                                      <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={cookingTimes[itemKey] ?? item.prepTime ?? 15}
                                        onChange={(e) => setCookingTimes(prev => ({ ...prev, [itemKey]: e.target.value }))}
                                        className="w-full text-xs font-bold text-[#3A1C14] focus:outline-none bg-transparent"
                                        placeholder="Thời gian nấu..."
                                      />
                                      <span className="text-[11px] text-gray-400 font-bold shrink-0">phút</span>
                                    </div>
                                  </div>

                                  {/* Item-level action buttons */}
                                  <div className="flex gap-2 flex-wrap">
                                    {itemStatus === 'PENDING' && (
                                      <button
                                        onClick={() => item.itemId && handleItemStatus(item.itemId, 'PREPARING')}
                                        className="flex-1 min-w-[120px] bg-purple-700 text-white py-2.5 rounded-xl text-[11px] font-bold uppercase hover:bg-purple-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                      >
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        <span>Tiếp Nhận Món</span>
                                      </button>
                                    )}

                                    {(itemStatus === 'PENDING' || itemStatus === 'PREPARING') && (
                                      <button
                                        onClick={() => item.itemId && handleItemStatus(item.itemId, 'COOKING')}
                                        className="flex-1 min-w-[120px] bg-orange-600 text-white py-2.5 rounded-xl text-[11px] font-bold uppercase hover:bg-orange-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                      >
                                        <Flame className="w-3.5 h-3.5 text-yellow-200" />
                                        <span>Đang Nấu</span>
                                      </button>
                                    )}

                                    {itemStatus === 'COOKING' && (
                                      <button
                                        onClick={() => item.itemId && handleItemStatus(item.itemId, 'READY')}
                                        className="flex-1 min-w-[120px] bg-emerald-600 text-white py-2.5 rounded-xl text-[11px] font-bold uppercase hover:bg-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Xong Món</span>
                                      </button>
                                    )}

                                    {itemStatus === 'READY' && (
                                      <div className="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-300 flex items-center justify-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>✅ Món Đã Xong</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ── Bottom action bar ── */}
                      <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
                        {orderStatus === 'READY' && (
                          <button
                            onClick={() => notifyWaiter(order.id)}
                            className="flex-1 min-w-[160px] bg-[#D97706] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#b45d03] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <BellRing className="w-4 h-4 animate-bounce" />
                            <span>📢 Báo Waiter / Quầy Trả Đồ</span>
                          </button>
                        )}

                        {orderStatus !== 'COMPLETED' && orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => openRecipeModal(order)}
                            className="px-5 py-3 bg-purple-100 text-purple-800 border border-purple-300 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-purple-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            <span>Kiểm Tra Kho Nguyên Liệu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ══ RECIPE CHECK MODAL ══ */}
      {recipeModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#3A1C14]/10 space-y-4">

            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-[#D97706]" />
                <h3 className="text-lg font-bold font-serif text-[#3A1C14]">
                  Xuất Kho Nguyên Liệu — Đơn #ORDER-{recipeModal.id}
                </h3>
              </div>
              <button onClick={() => setRecipeModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 text-[11px]">
                <strong>Quy trình:</strong> Kiểm tra tồn kho → Bấm <em>"Xác Nhận Xuất Kho"</em> → Kho tự động trừ & đơn chuyển sang <strong>PREPARING</strong>.
              </div>

              {recipeLoading ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400 animate-pulse">
                  Đang tính định lượng nguyên liệu...
                </div>
              ) : recipeList.length === 0 ? (
                <div className="py-8 text-center bg-[#FAF7F2] rounded-2xl border border-gray-200 text-xs text-gray-500">
                  Các món không yêu cầu xuất kho nguyên liệu hoặc chưa có công thức.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                        <th className="py-2 px-3">Nguyên Liệu</th>
                        <th className="py-2 px-3">Cần</th>
                        <th className="py-2 px-3">Tồn Kho</th>
                        <th className="py-2 px-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                      {recipeList.map((r) => (
                        <tr key={r.ingredientId} className="hover:bg-[#FAF7F2]">
                          <td className="py-3 px-3 font-bold text-[#3A1C14] font-sans">{r.ingredientName}</td>
                          <td className="py-3 px-3 font-bold text-[#D97706]">{r.quantityRequired?.toFixed(3)} {r.unit}</td>
                          <td className="py-3 px-3 text-gray-600">{r.currentStockQuantity?.toFixed(2)} {r.unit}</td>
                          <td className="py-3 px-3">
                            {r.isSufficient ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">Đủ Hàng</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> Thiếu
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

            <div className="flex gap-3 shrink-0 pt-2 border-t border-gray-100">
              <button
                onClick={() => setRecipeModal(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase hover:bg-gray-200 transition-all cursor-pointer"
              >
                Bỏ Qua
              </button>
              <button
                onClick={confirmDeduct}
                className="flex-1 bg-[#3A1C14] text-white py-3 rounded-2xl text-xs font-bold uppercase hover:bg-[#5a2c20] shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>⚡ Xác Nhận Xuất Kho & Chuẩn Bị</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
