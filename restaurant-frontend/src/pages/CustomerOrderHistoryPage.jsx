import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import { Search, Receipt, Clock, ChefHat, MapPin, Eye, Sparkles, X, AlertTriangle, AlertCircle, Star, CheckCircle2, Package, UtensilsCrossed, Utensils, Send, PartyPopper } from 'lucide-react';

export default function CustomerOrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Completion Modal
  const [completedModal, setCompletedModal] = useState(null); // { order, countdown }
  const completedTimerRef = useRef(null);
  const shownCompletedOrders = useRef(new Set()); // Track which orders we've shown the modal for
  const initialLoadedRef = useRef(false);

  // Review form inside modal
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // Custom Order Cancel Modal State (Replaces window.confirm)
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const statusList = [
    { key: 'ALL', label: 'Tất Cả' },
    { key: 'PENDING', label: 'Chờ Xác Nhận' },
    { key: 'CONFIRMED', label: 'Đã Xác Nhận' },
    { key: 'COOKING', label: 'Đang Chế Biến' },
    { key: 'READY', label: 'Sẵn Sàng' },
    { key: 'PAID', label: 'Đã Thanh Toán' },
    { key: 'CANCELLED', label: 'Đã Hủy' }
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/api/public/orders/history', { params });
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  // Poll to detect newly COMPLETED orders (ONLY pops up when Kitchen finishes Step 5)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get('/api/public/orders/history', {});
        if (res.data && res.data.success) {
          const freshOrders = res.data.data || [];

          if (!initialLoadedRef.current) {
            // Seed shownCompletedOrders with all orders that are already COMPLETED when opening page
            freshOrders.forEach(o => {
              if (o.status === 'COMPLETED') {
                shownCompletedOrders.current.add(o.id);
              }
            });
            initialLoadedRef.current = true;
          } else {
            // Phương án B: Không cần đợi xác nhận biên lai - đơn tự động vào bếp
            // Detect newly completed order (only pops up when Bếp finishes Step 5)
            const newlyCompletedOrder = freshOrders.find(
              o => o.status === 'COMPLETED' && !shownCompletedOrders.current.has(o.id)
            );
            if (newlyCompletedOrder && !completedModal) {
              shownCompletedOrders.current.add(newlyCompletedOrder.id);
              setCompletedModal(newlyCompletedOrder);
              setReviewRating(5);
              setReviewComment('');
              setReviewDone(false);
            }
          }

          setOrders(freshOrders);
        }
      } catch (err) { /* silent */ }
    }, 3500);

    return () => {
      clearInterval(pollInterval);
      if (completedTimerRef.current) clearInterval(completedTimerRef.current);
    };
  }, [completedModal]);

  // Phương án B: Không cần xác nhận biên lai - đơn tự động gửi bếp

  // Customer confirms received → mark order COMPLETED on backend
  const handleConfirmReceived = async () => {
    if (!completedModal) return;
    try {
      await api.put(`/api/chef/orders/${completedModal.id}/status`, { status: 'COMPLETED' });
    } catch (e) {
      // Order may already be COMPLETED; ignore error
    }
    setCompletedModal(null);
    fetchOrders();
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      await api.post('/api/customer/reviews', {
        rating: reviewRating,
        comment: reviewComment.trim(),
        customerName: user?.fullName || 'Khách hàng',
        customerEmail: user?.email
      });
      setReviewDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const executeCancelOrder = async () => {
    if (!cancelConfirmOrder) return;
    const orderId = cancelConfirmOrder.id;
    try {
      const res = await api.put(`/api/public/orders/${orderId}/cancel`);
      if (res.data && res.data.success) {
        showToast(`Đã hủy đơn hàng #ORD-${orderId} thành công.`);
        setCancelConfirmOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Không thể hủy đơn hàng.');
      setCancelConfirmOrder(null);
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  const getCookingStepIndex = (itemCookingStatus, orderStatus) => {
    if (orderStatus === 'CANCELLED') return -1;
    if (orderStatus === 'COMPLETED') return 5;
    if (itemCookingStatus === 'READY' || orderStatus === 'READY') return 4;
    if (itemCookingStatus === 'COOKING' || orderStatus === 'COOKING') return 3;
    if (itemCookingStatus === 'PREPARING' || orderStatus === 'PREPARING') return 2;
    if (orderStatus === 'KITCHEN_CONFIRMED') return 1; // Phương án B: Đơn đã gửi bếp, chờ chế biến
    return 1; // PENDING, CONFIRMED, PAID
  };

  const getStepDescription = (stepIndex) => {
    switch(stepIndex) {
      case 1: return "Món vừa được tạo, chờ Bếp tiếp nhận...";
      case 2: return "Đầu bếp đang chuẩn bị nguyên liệu & sơ chế...";
      case 3: return "Món ăn đang được chế biến trên bếp...";
      case 4: return "Món ăn đã hoàn thành. Đang chờ nhân viên phục vụ...";
      case 5: return "Cảm ơn quý khách! Đơn hàng đã được phục vụ hoàn tất.";
      default: return "Đang xử lý...";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#4A2810] via-[#8C3A27] to-[#4A2810] text-[#FAF7F2] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E07A5F]">L'ÉCLAT Order Tracking</span>
            <h1 className="text-3xl font-bold font-serif">Lịch Sử Đặt Món & Tiến Độ Bếp</h1>
            <p className="text-xs text-gray-200 font-light">Theo dõi thời gian thực quy trình chế biến món ăn từ Bếp Trưởng L'ÉCLAT.</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn #ORD, SĐT, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          {statusList.map((st) => (
            <button
              key={st.key}
              onClick={() => setSelectedStatus(st.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === st.key
                  ? 'bg-[#8C3A27] text-white shadow-md'
                  : 'bg-white text-[#4A2810] border border-gray-200 hover:border-[#8C3A27]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải thông tin đơn hàng & tiến độ bếp...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <Receipt className="w-12 h-12 text-[#E07A5F]/50 mx-auto" />
            <p className="text-sm font-bold text-[#4A2810]">Chưa tìm thấy đơn hàng nào trong lịch sử.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const displayItems = order.items && order.items.length > 0 ? order.items : (order.orderDetails || []);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2810]/10 shadow-xl space-y-6 animate-fade-in"
                >
                  {/* Order Header Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold font-mono text-[#8C3A27]">#ORD-{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          (order.status === 'PENDING' || order.status === 'KITCHEN_CONFIRMED') ? 'bg-amber-100 text-amber-800' :
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          (order.status === 'COOKING' || order.status === 'PREPARING') ? 'bg-orange-100 text-orange-800' :
                          order.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'COMPLETED' || order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(order.status === 'PENDING' || order.status === 'KITCHEN_CONFIRMED') ? '🔥 Đã Gửi Bếp' :
                           order.status === 'CONFIRMED' ? 'Đã Xác Nhận' :
                           (order.status === 'COOKING' || order.status === 'PREPARING') ? 'Đang Chế Biến' :
                           order.status === 'READY' ? 'Sẵn Sàng Phục Vụ' :
                           order.status === 'PAID' || order.status === 'COMPLETED' ? 'Đã Thanh Toán' :
                           'Đã Hủy'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center gap-4">
                        <span>🕒 {new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                        {order.tableName && <span>📍 <strong>{order.tableName}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-mono">Tổng giá trị đơn:</span>
                        <span className="text-base font-bold font-mono text-[#8C3A27]">{formatCurrency(order.totalAmount)}</span>
                      </div>

                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => setCancelConfirmOrder(order)}
                          className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Hủy Đơn Món
                        </button>
                      )}

                      {order.invoice && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-amber-50 border border-amber-200 text-[#8C3A27] rounded-xl text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Hóa Đơn</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cancelled Banner */}
                  {order.status === 'CANCELLED' && (
                    <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Đơn hàng #ORD-{order.id} này đã được hủy thành công.</span>
                    </div>
                  )}

                  {/* Real-time Cooking Tracker - show completed banner OR 5-step bar */}
                  {order.status === 'COMPLETED' ? (
                    <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-5 rounded-2xl border border-emerald-200 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-[#3A1C14] text-sm">Đơn Hàng Đã Hoàn Tất!</div>
                        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                          Cảm ơn quý khách đã sử dụng dịch vụ tại L'ÉCLAT. Chúc quý khách dùng bữa thật ngon miệng!
                        </p>
                        <span className="text-[10px] font-mono text-gray-400">Hoàn tất lúc: {new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  ) : order.status !== 'CANCELLED' && (
                    <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#4A2810]/10 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-[#4A2810] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-[#8C3A27]" />
                          <span>Tiến Độ Chế Biến KDS Bếp Trưởng</span>
                        </div>
                        <span className="text-emerald-700 font-sans normal-case italic font-semibold">
                          "{getStepDescription(getCookingStepIndex(null, order.status))}"
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                        {['1. PENDING', '2. PREPARING', '3. COOKING', '4. READY', '5. COMPLETED'].map((stepName, idx) => {
                          const stepNumber = idx + 1;
                          const currentStep = getCookingStepIndex(null, order.status);
                          const isActive = currentStep >= stepNumber;
                          const isCurrent = currentStep === stepNumber;

                          return (
                            <div
                              key={stepName}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isCurrent
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300 animate-pulse'
                                  : isActive
                                  ? 'bg-[#8C3A27] text-white border-[#8C3A27]'
                                  : 'bg-white text-gray-400 border-gray-200'
                              }`}
                            >
                              {stepName}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dishes Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {displayItems.map((item, idx) => (
                      <div key={idx} className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 flex items-center gap-3">
                        <img
                          src={item.dishImage || item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=200'}
                          alt={item.dishName || item.name}
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <h5 className="font-bold text-[#4A2810] text-xs line-clamp-1">{item.dishName || item.name}</h5>
                          <div className="text-[11px] text-gray-500 font-mono">
                            x{item.quantity} - {formatCurrency(item.price)}
                          </div>
                          {item.note && <p className="text-[10px] text-gray-400 italic">"Ghi chú: {item.note}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* CUSTOM CONFIRMATION MODAL CHO HỦY ĐƠN HÀNG (Replaces window.confirm) */}
      {cancelConfirmOrder && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-100 text-center space-y-5 animate-scale-up">
            
            <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-8 h-8 animate-bounce text-red-600" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xl font-bold font-serif text-[#4A2810]">Xác Nhận Hủy Đơn Món?</h4>
              <p className="text-xs text-gray-500">
                Bạn có chắc chắn muốn hủy đơn hàng <strong className="text-red-600 font-mono">#ORD-{cancelConfirmOrder.id}</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-gray-200 text-left text-xs font-mono space-y-1">
              <div>Khách hàng: <strong>{cancelConfirmOrder.customerName || user?.fullName}</strong></div>
              <div>Mã đơn hàng: <strong>#ORD-{cancelConfirmOrder.id}</strong></div>
              <div>Tổng tiền: <strong>{formatCurrency(cancelConfirmOrder.totalAmount)}</strong></div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelConfirmOrder(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all cursor-pointer"
              >
                Giữ Lại Đơn
              </button>

              <button
                type="button"
                onClick={executeCancelOrder}
                className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-md transition-all cursor-pointer"
              >
                Xác Nhận Hủy Đơn
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedOrder && selectedOrder.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E07A5F]/30 shadow-2xl p-7 animate-fade-in relative text-center">
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-bold font-serif text-[#4A2810] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#E07A5F]" /> Hóa Đơn Invoice #{selectedOrder.invoice.invoiceNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-left text-xs space-y-2 font-mono p-4 bg-[#FAF7F2] rounded-2xl border border-[#4A2810]/10 mb-5">
              <div className="flex justify-between"><span>Khách hàng:</span> <b>{selectedOrder.invoice.customerName}</b></div>
              <div className="flex justify-between"><span>Mã đơn:</span> <b>#ORD-{selectedOrder.id}</b></div>
              <div className="flex justify-between"><span>Phương thức:</span> <b>{selectedOrder.invoice.paymentMethod}</b></div>
              <div className="flex justify-between"><span>Thời gian xuất:</span> <b>{new Date(selectedOrder.invoice.issuedAt).toLocaleString('vi-VN')}</b></div>
              <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-bold text-[#8C3A27]">
                <span>Tổng Thanh Toán:</span>
                <span>{formatCurrency(selectedOrder.invoice.grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="bg-[#8C3A27] text-white px-8 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}


      {/* ======= ORDER COMPLETED MODAL ======= */}
      {completedModal && (() => {
        const isTakeaway = !completedModal.tableName || completedModal.tableName === 'Mang về';
        return (
          <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`bg-white rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-2xl border-2 animate-scale-up space-y-5 text-center relative overflow-hidden ${
              isTakeaway ? 'border-amber-400' : 'border-emerald-400'
            }`}>

              {/* Sparkle bg decoration */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: isTakeaway ? '#D97706' : '#059669' }} />

              {/* Close */}
              <button
                onClick={() => setCompletedModal(null)}
                className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto border-4 shadow-lg ${
                isTakeaway ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              }`}>
                {isTakeaway
                  ? <Package className="w-10 h-10 animate-bounce" />
                  : <UtensilsCrossed className="w-10 h-10 animate-bounce" />
                }
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold font-serif text-[#3A1C14] flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#D97706]" />
                  Đơn Hàng Đã Xong!
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  <strong className="text-[#8C3A27]">#ORD-{completedModal.id}</strong>
                  {completedModal.customerName && ` · ${completedModal.customerName}`}
                </p>
              </div>

              {/* Type-specific message */}
              {isTakeaway ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <p className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-600 shrink-0" />
                    Đơn Mang Về Của Bạn Đã Sẵn Sàng!
                  </p>
                  <p className="text-xs text-amber-700">
                    Đầu bếp đã hoàn tất chuẩn bị. Vui lòng ra quầy để <strong>nhận đơn</strong> của bạn.
                  </p>
                  <button
                    onClick={handleConfirmReceived}
                    className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Đã Nhận Đơn - Cảm Ơn!</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                    <p className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-emerald-600 shrink-0" />
                      Món Ăn Tại Bàn Của Bạn Đã Sẵn Sàng!
                    </p>
                    <p className="text-xs text-emerald-700">
                      Nhân viên đang mang món ăn đến bàn <strong>{completedModal.tableName}</strong> của bạn. Chúc quý khách dùng bữa ngon miệng!
                    </p>
                    <button
                      onClick={handleConfirmReceived}
                      className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã Nhận Món - Cảm Ơn!</span>
                    </button>
                  </div>

                  {/* Review Section (dine-in only) */}
                  <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
                    <p className="text-xs font-bold text-[#3A1C14] uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Đánh Giá Trải Nghiệm Của Bạn
                    </p>

                    {reviewDone ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-800 text-sm font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Cảm ơn đánh giá của bạn! Chúng tôi rất trân trọng!
                      </div>
                    ) : (
                      <>
                        {/* Star Rating */}
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-7 h-7 cursor-pointer transition-all ${
                                (reviewHover || reviewRating) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                              onMouseEnter={() => setReviewHover(star)}
                              onMouseLeave={() => setReviewHover(0)}
                              onClick={() => setReviewRating(star)}
                            />
                          ))}
                        </div>

                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Bạn có cảm nhận gì về món ăn và dịch vụ tại L'ÉCLAT?"
                          rows={3}
                          className="w-full border border-gray-200 bg-[#FAF7F2] rounded-2xl px-3.5 py-2.5 text-xs text-[#3A1C14] focus:outline-none focus:border-amber-400 resize-none"
                        />

                        <button
                          onClick={handleSubmitReview}
                          disabled={reviewSubmitting || !reviewComment.trim()}
                          className="w-full bg-[#8C3A27] disabled:opacity-50 hover:bg-[#A3432D] text-white py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>{reviewSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}
    </div>

  );
}
