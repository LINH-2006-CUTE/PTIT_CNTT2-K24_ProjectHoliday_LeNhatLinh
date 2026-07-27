import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WaiterNavbar from '../components/WaiterNavbar';
import {
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  Send,
  Receipt,
  Search,
  CheckCircle2,
  Utensils,
  X,
  ChefHat,
  Sparkles,
  Clock
} from 'lucide-react';

export default function WaiterOrderManagement() {
  const [tables, setTables] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dishSearch, setDishSearch] = useState('');
  const [cartItems, setCartItems] = useState([]);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tRes, dRes, cRes, oRes] = await Promise.all([
        api.get('/api/waiter/tables'),
        api.get('/api/public/dishes'),
        api.get('/api/public/categories'),
        api.get('/api/waiter/orders')
      ]);

      if (tRes.data && tRes.data.success) setTables(tRes.data.data);
      if (dRes.data && dRes.data.success) setDishes(dRes.data.data);
      if (cRes.data && cRes.data.success) setCategories(cRes.data.data);
      if (oRes.data && oRes.data.success) setActiveOrders(oRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val) => {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val || 0)} VND`;
  };

  // Step 1: Confirm Order
  const handleConfirmOrder = async (orderId) => {
    try {
      const res = await api.put(`/api/waiter/orders/${orderId}/status`, null, {
        params: { status: 'CONFIRMED' }
      });
      if (res.data && res.data.success) {
        showToast('✅ Đã xác nhận đơn hàng!');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xác nhận đơn hàng.');
    }
  };

  // Step 2: Send to Kitchen
  const handleSendToKitchen = async (orderId) => {
    try {
      const res = await api.put(`/api/waiter/orders/${orderId}/status`, null, {
        params: { status: 'COOKING' }
      });
      if (res.data && res.data.success) {
        showToast('👨‍🍳 Đã gửi đơn hàng tới Bếp chế biến!');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi đơn hàng xuống Bếp.');
    }
  };

  // Step 3: Serve Dish to Table
  const handleServeOrder = async (orderId) => {
    try {
      const res = await api.put(`/api/waiter/orders/${orderId}/status`, null, {
        params: { status: 'SERVED' }
      });
      if (res.data && res.data.success) {
        showToast('🍽️ Đã phục vụ món ra bàn thành công!');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi cập nhật trạng thái phục vụ.');
    }
  };

  // Quick Order creation by Waiter at table
  const handleAddDishToTray = (dish) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(item => item.dish.id === dish.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { dish, quantity: 1, note: '' }];
    });
  };

  const handleCreateWaiterOrder = async () => {
    if (!selectedTableId) return showToast('Vui lòng chọn bàn ăn.');
    if (cartItems.length === 0) return showToast('Vui lòng chọn ít nhất 1 món ăn.');

    try {
      const payload = {
        diningTableId: Number(selectedTableId),
        items: cartItems.map(item => ({
          dishId: item.dish.id,
          quantity: item.quantity,
          note: item.note
        })),
        notes: 'Order được tạo trực tiếp bởi Nhân Viên Phục Vụ'
      };

      const res = await api.post('/api/waiter/orders', payload);
      if (res.data && res.data.success) {
        showToast('🎉 Tạo Order và gửi hệ thống thành công!');
        setCartItems([]);
        setSelectedTableId('');
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tạo order.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222E21] font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#3B4A39] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#708238]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#708238]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <WaiterNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#3B4A39]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
              Quy Trình Phục Vụ 3 Bước
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
              Quản Lý Phục Vụ & Đơn Hàng Tại Bàn
            </h1>
          </div>

          {/* 3 Step Workflow Legend */}
          <div className="flex flex-wrap items-center gap-2 bg-[#FAF7F2] p-3 rounded-2xl border border-[#3B4A39]/10 text-xs font-bold">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl">1. Xác Nhận Order</span>
            <span className="text-gray-400">→</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-xl">2. Gửi Bếp</span>
            <span className="text-gray-400">→</span>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl">3. Phục Vụ Món</span>
          </div>
        </div>

        {/* List Active Orders for 3 Step Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#3B4A39]/10 shadow-xl space-y-6">
          <h3 className="text-lg font-bold font-serif text-[#222E21] border-b border-gray-100 pb-3 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#708238]" />
            <span>Danh Sách Đơn Hàng Cần Xử Lý ({activeOrders.length})</span>
          </h3>

          {activeOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold bg-[#FAF7F2] rounded-2xl border border-gray-200">
              Chưa có đơn hàng nào cần phục vụ lúc này.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => {
                const tName = order.diningTable ? order.diningTable.tableName : 'Mang về';
                const itemsCount = order.orderDetails ? order.orderDetails.length : 0;
                const status = order.status || 'PENDING';

                return (
                  <div key={order.id} className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#3B4A39]/10 shadow-md flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                        <div>
                          <span className="text-xs font-bold text-[#8C3A27] font-mono block">#{order.orderCode}</span>
                          <h4 className="text-base font-bold text-[#222E21] flex items-center gap-1.5 mt-0.5">
                            <Utensils className="w-4 h-4 text-[#708238]" /> {tName}
                          </h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          status === 'COOKING' ? 'bg-indigo-100 text-indigo-800' :
                          status === 'READY' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {status === 'PENDING' ? 'Chờ xác nhận' :
                           status === 'CONFIRMED' ? 'Đã xác nhận' :
                           status === 'COOKING' ? 'Đang chế biến' :
                           status === 'READY' ? 'Bếp đã xong' : status}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1.5 text-xs text-gray-700 max-h-36 overflow-y-auto pr-1">
                        {(order.items || order.orderDetails || []).map((item, idx) => (
                          <div key={item.id || idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                              {item.image && <img src={item.image} alt={item.dishName || item.dish?.name} className="h-7 w-7 rounded-lg object-cover" />}
                              <span className="font-semibold text-[#222E21]">{item.dishName || item.dish?.name || 'Món ăn'}</span>
                            </div>
                            <span className="font-mono font-bold text-[#8C3A27]">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between items-center text-xs border-t border-gray-200 font-bold">
                        <span>Tổng thanh toán:</span>
                        <span className="font-mono text-[#8C3A27] text-sm">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* 3 Step Action Buttons */}
                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      {status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="w-full bg-amber-500 text-white py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-amber-600 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" /> 1. Xác Nhận Order
                        </button>
                      )}

                      {status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleSendToKitchen(order.id)}
                          className="w-full bg-blue-600 text-white py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <ChefHat className="w-4 h-4" /> 2. Gửi Bếp Chế Biến
                        </button>
                      )}

                      {status === 'COOKING' && (
                        <div className="w-full bg-indigo-50 border border-indigo-200 text-indigo-800 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-600 animate-spin" />
                          <span>👨‍🍳 Đang Nấu Tại Bếp...</span>
                        </div>
                      )}

                      {status === 'READY' && (
                        <button
                          onClick={() => handleServeOrder(order.id)}
                          className="w-full bg-emerald-600 text-white py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse active:scale-95"
                        >
                          <Utensils className="w-4 h-4" /> 3. Phục Vụ Rút Bàn
                        </button>
                      )}

                      {status === 'SERVED' && (
                        <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>🍽️ Đã Phục Vụ Ra Bàn</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
