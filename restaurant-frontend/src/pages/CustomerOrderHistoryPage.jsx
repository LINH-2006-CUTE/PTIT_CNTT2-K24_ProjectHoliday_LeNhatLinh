import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import { Search, Receipt, Clock, ChefHat, MapPin, Eye, Sparkles, X } from 'lucide-react';

export default function CustomerOrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #ORD-${orderId}?`)) return;
    try {
      const res = await api.put(`/api/public/orders/${orderId}/cancel`);
      if (res.data && res.data.success) {
        showToast(`Đã hủy đơn hàng #ORD-${orderId} thành công.`);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Không thể hủy đơn hàng.');
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  // Status Progress Steps helper
  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'COOKING': return 3;
      case 'READY': return 4;
      case 'SERVING': return 5;
      case 'PAID':
      case 'COMPLETED': return 6;
      case 'CANCELLED': return -1;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            L'ÉCLAT Order Tracking
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#4A2810]">
            Nhật Ký & Tiến Trình Đơn Hàng
          </h1>
          <div className="h-1 w-16 bg-[#8C3A27] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-white p-6 rounded-3xl border border-[#4A2810]/10 shadow-lg space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {statusList.map((st) => (
                <button
                  key={st.key}
                  onClick={() => setSelectedStatus(st.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === st.key
                      ? 'bg-[#8C3A27] text-white shadow-md'
                      : 'bg-[#FAF7F2] text-[#4A2810] hover:border-[#8C3A27] border border-gray-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Tìm mã đơn #ORD-..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input text-xs py-2 w-full sm:w-60"
              />
              <button
                onClick={fetchOrders}
                className="bg-[#4A2810] text-white px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 hover:bg-[#63291B] transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" /> Tìm
              </button>
            </div>
          </div>
        </div>

        {/* Order Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải tiến trình đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-[#4A2810]/10 text-center text-xs text-gray-400 font-semibold shadow-md">
            Chưa có đơn hàng nào khớp với điều kiện tìm kiếm.
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {orders.map((ord) => {
              const stepIdx = getStatusStepIndex(ord.status);
              const isCancelled = ord.status === 'CANCELLED';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-[#4A2810]/10 shadow-xl space-y-5 animate-fade-in relative"
                >
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-[#8C3A27]">#ORD-{ord.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'PAID' || ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          ord.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          ord.status === 'COOKING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {ord.status === 'PAID' ? 'Đã Thanh Toán' :
                           ord.status === 'PENDING' ? 'Chờ Xác Nhận' :
                           ord.status === 'COOKING' ? 'Đang Nấu' :
                           ord.status === 'READY' ? 'Sẵn Sàng' :
                           ord.status === 'CANCELLED' ? 'Đã Hủy' : ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {new Date(ord.orderDate).toLocaleString('vi-VN')}
                        </span>
                        <span>|</span>
                        <span className="inline-flex items-center gap-1 text-[#8C3A27] font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" /> {ord.tableName}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg text-[#4A2810]">
                        {formatCurrency(ord.totalAmount)}
                      </span>

                      {/* Cancel Order Button */}
                      {ord.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Hủy Đơn Hàng
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Status Progress Bar (Timeline) */}
                  {!isCancelled && (
                    <div className="py-2 px-2 bg-[#FAF7F2] rounded-2xl border border-[#4A2810]/5">
                      <div className="grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 gap-1 relative">
                        
                        <div className={`py-1.5 rounded-xl ${stepIdx >= 1 ? 'bg-[#8C3A27] text-white shadow-xs' : ''}`}>
                          1. Tiếp Nhận
                        </div>
                        <div className={`py-1.5 rounded-xl ${stepIdx >= 2 ? 'bg-[#8C3A27] text-white shadow-xs' : ''}`}>
                          2. Xác Nhận
                        </div>
                        <div className={`py-1.5 rounded-xl ${stepIdx >= 3 ? 'bg-[#8C3A27] text-white shadow-xs' : ''}`}>
                          3. Đang Nấu
                        </div>
                        <div className={`py-1.5 rounded-xl ${stepIdx >= 4 ? 'bg-[#8C3A27] text-white shadow-xs' : ''}`}>
                          4. Sẵn Sàng
                        </div>
                        <div className={`py-1.5 rounded-xl ${stepIdx >= 6 ? 'bg-emerald-700 text-white shadow-xs' : ''}`}>
                          5. Hoàn Thành
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {ord.items && ord.items.map((item, idx) => (
                      <div key={idx} className="bg-[#FAF7F2] p-3 rounded-2xl flex gap-3 items-center border border-[#4A2810]/5">
                        <img src={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80"} alt={item.dishName} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 text-xs">
                          <h6 className="font-bold text-[#4A2810] line-clamp-1">{item.dishName}</h6>
                          <div className="text-gray-500 font-mono">x{item.quantity} - {formatCurrency(item.price)}</div>
                          {item.note && <span className="text-[10px] text-gray-400 italic">"Ghi chú: {item.note}"</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Invoice Button */}
                  {ord.invoice && (
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="bg-[#4A2810] text-[#FAF7F2] px-4 py-2 rounded-xl text-xs font-bold uppercase hover:border-[#E07A5F] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4 text-[#E07A5F]" />
                        <span>Xem Hóa Đơn Invoice (#{ord.invoice.invoiceNumber})</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

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

      <CustomerFooter />
    </div>
  );
}
