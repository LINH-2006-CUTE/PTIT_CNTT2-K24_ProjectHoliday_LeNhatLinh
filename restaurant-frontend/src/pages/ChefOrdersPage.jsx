import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  ChefHat,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Utensils,
  AlertTriangle,
  Eye,
  Package,
  ArrowRight,
  X,
  User,
  MapPin,
  FileText,
  BellRing,
  Volume2,
  Info,
  Check
} from 'lucide-react';

export default function ChefOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const previousOrderIdsRef = useRef(new Set());

  // Modal States
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [selectedDishDetail, setSelectedDishDetail] = useState(null);
  const [recipeCheckOrder, setRecipeCheckOrder] = useState(null);
  const [recipeCheckList, setRecipeCheckList] = useState([]);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Play crisp Audio Chime when new orders land
  const playNewOrderSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio chime not supported');
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Realtime poll every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/chef/orders');
      if (res.data && res.data.success) {
        const fetchedOrders = res.data.data || [];

        // Check for new incoming orders to trigger Audio Chime
        const currentIds = new Set(fetchedOrders.map(o => o.id));
        if (previousOrderIdsRef.current.size > 0) {
          const hasNew = fetchedOrders.some(o => !previousOrderIdsRef.current.has(o.id));
          if (hasNew) {
            playNewOrderSound();
            showToast('🔔 CÓ ĐƠN HÀNG MỚI VỪA TỚI BẾP!');
          }
        }
        previousOrderIdsRef.current = currentIds;

        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Strict Sequential Status Update for Item
  const handleUpdateItemStatus = async (itemId, targetStatus) => {
    try {
      const res = await api.put(`/api/chef/items/${itemId}/status`, { cookingStatus: targetStatus });
      if (res.data && res.data.success) {
        showToast(`Đã chuyển trạng thái món sang: ${
          targetStatus === 'PREPARING' ? 'Chuẩn Bị' :
          targetStatus === 'COOKING' ? 'Đang Nấu' :
          targetStatus === 'READY' ? 'Sẵn Sàng' : 'Hoàn Thành'
        }`);
        fetchOrders();
        if (selectedOrderDetail) {
          setSelectedOrderDetail(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi quy tắc chuyển trạng thái.');
    }
  };

  // Strict Sequential Status Update for Order
  const handleUpdateOrderStatus = async (orderId, targetStatus) => {
    try {
      const res = await api.put(`/api/chef/orders/${orderId}/status`, { status: targetStatus });
      if (res.data && res.data.success) {
        showToast(`🎉 Đã cập nhật trạng thái đơn #${orderId} sang: ${
          targetStatus === 'PREPARING' ? 'Chuẩn Bị' :
          targetStatus === 'COOKING' ? 'Đang Nấu' :
          targetStatus === 'READY' ? 'Sẵn Sàng' : 'Hoàn Thành'
        }`);
        fetchOrders();
        if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
          setSelectedOrderDetail(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi quy tắc chuyển trạng thái.');
    }
  };

  // Open Recipe Ingredient Check
  const handleOpenRecipeCheck = async (order) => {
    setRecipeCheckOrder(order);
    setLoadingRecipe(true);
    try {
      const res = await api.get(`/api/chef/orders/${order.id}/recipe-check`);
      if (res.data && res.data.success) {
        setRecipeCheckList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể lấy danh sách công thức kho.');
    } finally {
      setLoadingRecipe(false);
    }
  };

  // Confirm Deduct Ingredients & Start Cooking
  const handleConfirmDeductIngredients = async () => {
    if (!recipeCheckOrder) return;
    try {
      const res = await api.post(`/api/chef/orders/${recipeCheckOrder.id}/deduct-ingredients`);
      if (res.data && res.data.success) {
        showToast(`⚡ Đã xuất kho nguyên liệu tự động & chuyển đơn #${recipeCheckOrder.id} sang PREPARING!`);
        setRecipeCheckOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi khi xuất kho nguyên liệu.');
    }
  };

  // Helper to filter items in Kanban columns based on search
  const filteredOrders = orders.filter(o => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return String(o.id).includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.tableName && o.tableName.toLowerCase().includes(q));
  });

  const getOrdersByStatus = (st) => {
    return filteredOrders.filter(o => {
      const statusUpper = (o.status || 'PENDING').toUpperCase();
      if (st === 'PENDING') return statusUpper === 'PENDING' || statusUpper === 'CONFIRMED' || statusUpper === 'PAID' || statusUpper === 'KITCHEN_CONFIRMED';
      if (st === 'PREPARING') return statusUpper === 'PREPARING';
      if (st === 'COOKING') return statusUpper === 'COOKING';
      if (st === 'READY') return statusUpper === 'READY';
      if (st === 'COMPLETED') return statusUpper === 'COMPLETED';
      return false;
    });
  };

  const kanbanColumns = [
    { key: 'PENDING', title: '1. PENDING (Mới Tiếp Nhận)', color: 'border-amber-400 bg-amber-50/40 text-amber-900', badgeColor: 'bg-amber-100 text-amber-800' },
    { key: 'PREPARING', title: '2. PREPARING (Chuẩn Bị)', color: 'border-purple-400 bg-purple-50/40 text-purple-900', badgeColor: 'bg-purple-100 text-purple-800' },
    { key: 'COOKING', title: '3. COOKING (Đang Nấu)', color: 'border-orange-500 bg-orange-50/40 text-orange-900', badgeColor: 'bg-orange-100 text-orange-800' },
    { key: 'READY', title: '4. READY (Sẵn Sàng)', color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { key: 'COMPLETED', title: '5. COMPLETED (Hoàn Thành)', color: 'border-gray-400 bg-gray-50/40 text-gray-700', badgeColor: 'bg-gray-200 text-gray-800' }
  ];

  const formatCurrency = (val) => {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val || 0)} VND`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[99999] bg-[#3A1C14] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#D97706]/40 text-xs font-bold uppercase tracking-wider animate-bounce flex items-center gap-3">
          <BellRing className="w-5 h-5 text-[#D97706] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <ChefNavbar />

      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#3A1C14] via-[#5A2C20] to-[#3A1C14] text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-widest block">
                Kitchen Direct Display System (KDS)
              </span>
              <span className="px-2.5 py-0.5 bg-red-600/90 text-white text-[10px] font-bold uppercase rounded-full animate-pulse">
                Real-Time Kanban Sync
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif">Màn Hình Điều Phối Bếp Trưởng 5 Cột Kanban</h1>
            <p className="text-xs text-gray-300 font-light">Quản lý luồng chế biến nghiêm ngặt: PENDING ➔ PREPARING ➔ COOKING ➔ READY ➔ COMPLETED</p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/20">
            <Search className="w-4 h-4 text-gray-400 ml-1" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Bàn, Khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-gray-400 focus:outline-none w-48 sm:w-64"
            />
          </div>
        </div>

        {/* 5-Column Kanban Board Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang khởi chạy hệ thống KDS Bếp Trưởng...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {kanbanColumns.map((col) => {
              const colOrders = getOrdersByStatus(col.key);
              return (
                <div
                  key={col.key}
                  className={`rounded-3xl p-4 border shadow-sm space-y-4 min-h-[650px] flex flex-col ${col.color}`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-black/10">
                    <h3 className="text-xs font-bold font-serif uppercase tracking-wider">{col.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${col.badgeColor}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Column Order Cards List */}
                  <div className="space-y-4 flex-1">
                    {colOrders.length === 0 ? (
                      <div className="py-12 text-center text-[11px] text-gray-400 italic bg-white/60 rounded-2xl border border-dashed border-gray-300">
                        Chưa có đơn hàng
                      </div>
                    ) : (
                      colOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`bg-white rounded-2xl p-4 border shadow-md hover:shadow-xl transition-all duration-300 space-y-3 relative group ${
                            order.isNew ? 'ring-2 ring-red-500/80 animate-pulse' : 'border-gray-200'
                          }`}
                        >
                          {/* NEW Badge */}
                          {order.isNew && (
                            <span className="absolute -top-2.5 right-3 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1 animate-bounce">
                              <Sparkles className="w-2.5 h-2.5" /> NEW
                            </span>
                          )}

                          {/* Card Header */}
                          <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                            <div>
                              <span className="text-sm font-bold font-mono text-[#3A1C14]">ORDER #{order.id}</span>
                              <div className="text-[11px] font-bold text-[#D97706] flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {order.tableName || 'Mang về'}
                              </div>
                            </div>

                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Customer & Metadata */}
                          <div className="text-[11px] text-gray-600 space-y-0.5 font-sans">
                            <div>Khách: <strong className="text-[#3A1C14]">{order.customerName}</strong></div>
                            <div>Loại: <span className="font-semibold text-gray-700">{order.orderType}</span></div>
                          </div>

                          {/* Items Summary */}
                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-gray-200 space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedOrderDetail(order);
                                  setSelectedDishDetail(item);
                                }}
                                className="flex justify-between items-center text-xs font-bold text-[#3A1C14] hover:text-[#D97706] cursor-pointer"
                              >
                                <span className="line-clamp-1">{item.dishName}</span>
                                <span className="font-mono text-amber-800 ml-2">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 flex flex-col gap-2">
                            <button
                              onClick={() => setSelectedOrderDetail(order)}
                              className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-[11px] font-bold uppercase hover:bg-gray-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#3A1C14]" />
                              <span>Xem Chi Tiết</span>
                            </button>

                            {/* Sequential Step Button */}
                            {col.key === 'PENDING' && (
                              <button
                                onClick={() => handleOpenRecipeCheck(order)}
                                className="w-full bg-purple-700 text-white py-2 rounded-xl text-[11px] font-bold uppercase hover:bg-purple-800 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Package className="w-3.5 h-3.5 text-amber-200" />
                                <span>1. Bắt Đầu Chuẩn Bị (PREPARING)</span>
                              </button>
                            )}

                            {col.key === 'PREPARING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'COOKING')}
                                className="w-full bg-orange-600 text-white py-2 rounded-xl text-[11px] font-bold uppercase hover:bg-orange-700 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Flame className="w-3.5 h-3.5 text-yellow-200" />
                                <span>2. Bắt Đầu Nấu (COOKING)</span>
                              </button>
                            )}

                            {col.key === 'COOKING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                                className="w-full bg-emerald-600 text-white py-2 rounded-xl text-[11px] font-bold uppercase hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                <span>3. Sẵn Sàng (READY)</span>
                              </button>
                            )}

                            {col.key === 'READY' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                className="w-full bg-[#3A1C14] text-white py-2 rounded-xl text-[11px] font-bold uppercase hover:bg-[#5a2c20] shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>4. Hoàn Thành (COMPLETED)</span>
                              </button>
                            )}
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL 1: CHI TIẾT ORDER DÀNH CHO BẾP */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#3A1C14]/10 animate-scale-up space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-[#D97706]" />
                <h3 className="text-lg font-bold font-serif text-[#3A1C14]">
                  Chi Tiết Đơn Hàng #ORDER-{selectedOrderDetail.id}
                </h3>
              </div>
              <button onClick={() => setSelectedOrderDetail(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 text-xs">
              
              {/* Customer Metadata Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-gray-200 space-y-2 font-mono">
                <div className="font-bold text-[#3A1C14] text-xs uppercase tracking-wider font-sans border-b border-gray-300 pb-1 mb-2">
                  👤 Thông Tin Khách Hàng & Vị Trí
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Tên Khách: <strong className="text-[#3A1C14]">{selectedOrderDetail.customerName}</strong></div>
                  <div>SĐT: <strong className="text-[#3A1C14]">{selectedOrderDetail.customerPhone}</strong></div>
                  <div>Loại Đơn: <strong className="text-[#D97706]">{selectedOrderDetail.orderType}</strong></div>
                  <div>Số Bàn: <strong className="text-[#D97706]">{selectedOrderDetail.tableName}</strong></div>
                  <div className="col-span-2">Thời Gian Đặt: <span>{new Date(selectedOrderDetail.orderDate).toLocaleString('vi-VN')}</span></div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-bold text-[#3A1C14] uppercase tracking-wider text-[11px]">
                  Danh Sách Món Ăn (Bấm vào món để xem Công thức nguyên liệu):
                </div>
                {selectedOrderDetail.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedDishDetail(item)}
                    className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 hover:border-[#D97706] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80'} alt={item.dishName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div>
                        <h5 className="font-bold text-sm text-[#3A1C14] group-hover:text-[#D97706] transition-colors">{item.dishName}</h5>
                        <div className="font-mono text-gray-600 font-bold">Số lượng: x{item.quantity} • Thời gian chế biến: {item.prepTime || 15} phút</div>
                        {item.note && <p className="text-red-600 font-bold">"Ghi chú: {item.note}"</p>}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.cookingStatus === 'PREPARING' ? 'bg-purple-100 text-purple-800' :
                      item.cookingStatus === 'COOKING' ? 'bg-orange-100 text-orange-800' :
                      item.cookingStatus === 'READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {item.cookingStatus || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrderDetail(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase hover:bg-gray-200 transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CHI TIẾT MÓN ĂN & NGUYÊN LIỆU ĐỊNH LƯỢNG */}
      {selectedDishDetail && (
        <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#3A1C14]/10 animate-scale-up space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <h3 className="text-base font-bold font-serif text-[#3A1C14] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#D97706]" /> Chi Tiết Món Ăn & Định Lượng
              </h3>
              <button onClick={() => setSelectedDishDetail(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              
              <div className="flex gap-4 items-center bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200">
                <img src={selectedDishDetail.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80'} alt={selectedDishDetail.dishName} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                <div className="space-y-1 font-sans">
                  <h4 className="text-base font-bold text-[#3A1C14]">{selectedDishDetail.dishName}</h4>
                  <div className="text-gray-500 font-medium">Danh mục: {selectedDishDetail.categoryName || 'Món chính'}</div>
                  <div className="font-mono text-amber-800 font-bold">Số lượng đặt: x{selectedDishDetail.quantity} • Giá: {formatCurrency(selectedDishDetail.price)}</div>
                  <div className="text-gray-600 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" /> Thời gian chế biến: <strong>{selectedDishDetail.prepTime || 15} phút</strong>
                  </div>
                </div>
              </div>

              {/* Recipe Ingredients */}
              <div className="space-y-2">
                <div className="font-bold text-[#3A1C14] uppercase tracking-wider text-[11px]">
                  🥣 Công Thức & Định Lượng Nguyên Liệu Cần Chuẩn Bị:
                </div>
                {selectedDishDetail.recipes && selectedDishDetail.recipes.length > 0 ? (
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200 space-y-1.5 font-mono">
                    {selectedDishDetail.recipes.map((r, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-1 last:border-none">
                        <span className="font-bold text-[#3A1C14] font-sans">• {r.ingredientName}</span>
                        <span className="font-bold text-[#D97706]">{r.quantityRequired?.toFixed(3)} {r.unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200 text-gray-500 italic">
                    {selectedDishDetail.ingredients || '150g Thịt thăn bò Mỹ Wagyu, 20g Phô mai Gruyère, 50g Cà chua ngâm, 10g Sốt bơ thảo mộc.'}
                  </div>
                )}
              </div>

              {/* Customer Notes */}
              {selectedDishDetail.note && (
                <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-red-700 font-bold space-y-1">
                  <div>⚠️ Ghi Chú Đặc Biệt Của Khách Hàng:</div>
                  <p className="text-xs italic">"{selectedDishDetail.note}"</p>
                </div>
              )}

            </div>

            <button
              onClick={() => setSelectedDishDetail(null)}
              className="w-full bg-[#3A1C14] text-white py-3 rounded-2xl text-xs font-bold uppercase hover:bg-[#5a2c20] transition-all cursor-pointer"
            >
              Đã Hiểu
            </button>

          </div>
        </div>
      )}

      {/* MODAL 3: XÁC NHẬN NGUYÊN LIỆU KHO THEO CÔNG THỨC RECIPE CHECK */}
      {recipeCheckOrder && (
        <div className="fixed inset-0 z-[10002] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#3A1C14]/10 animate-scale-up space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-[#D97706]" />
                <h3 className="text-lg font-bold font-serif text-[#3A1C14]">
                  Xuất Kho Nguyên Liệu Cho Đơn #ORDER-{recipeCheckOrder.id}
                </h3>
              </div>
              <button onClick={() => setRecipeCheckOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Recipe Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 text-xs">
              
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-gray-700 space-y-1">
                <div className="font-bold text-[#3A1C14]">📋 Quy Trình Sơ Chế Bếp Trưởng (PREPARING):</div>
                <p>Bếp trưởng kiểm tra nguyên liệu &rarr; Bấm <strong>"⚡ Xác Nhận Xuất Kho & Chuẩn Bị"</strong>. Hệ thống tự động trừ tồn kho MySQL và chuyển trạng thái đơn sang <strong>PREPARING</strong> để Khách hàng theo dõi real-time!</p>
              </div>

              {loadingRecipe ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Đang tính toán định lượng nguyên liệu thô...
                </div>
              ) : recipeCheckList.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 font-semibold bg-[#FAF7F2] rounded-2xl border border-gray-200">
                  Đơn hàng sử dụng các món chế biến trực tiếp từ tủ bảo quản mát Bếp.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] uppercase text-gray-500 font-bold tracking-wider">
                        <th className="py-2 px-3">Tên Nguyên Liệu</th>
                        <th className="py-2 px-3">Định Lượng Cần</th>
                        <th className="py-2 px-3">Tồn Kho Hiện Tại</th>
                        <th className="py-2 px-3">Trạng Thái Kho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono text-xs">
                      {recipeCheckList.map((item) => (
                        <tr key={item.ingredientId} className="hover:bg-[#FAF7F2]">
                          <td className="py-3 px-3 font-bold text-[#3A1C14] font-sans">{item.ingredientName}</td>
                          <td className="py-3 px-3 font-bold text-[#D97706]">
                            {item.quantityRequired?.toFixed(3)} {item.unit}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {item.currentStockQuantity?.toFixed(2)} {item.unit}
                          </td>
                          <td className="py-3 px-3">
                            {item.isSufficient ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                                Đủ Hàng
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-bold uppercase">
                                Thiếu Kho
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

            {/* Modal Confirm Buttons */}
            <div className="pt-3 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setRecipeCheckOrder(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase hover:bg-gray-200 transition-all cursor-pointer"
              >
                Bỏ Qua
              </button>

              <button
                type="button"
                onClick={handleConfirmDeductIngredients}
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
