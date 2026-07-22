import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  Flame,
  Clock,
  CheckCircle2,
  Bell,
  Play,
  Check,
  RefreshCw,
  ChefHat,
  Utensils,
  AlertTriangle
} from 'lucide-react';

export default function ChefCookingQueuePage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchQueue = async () => {
    try {
      const res = await api.get('/api/chef/orders');
      if (res.data && res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket('ws://localhost:8080/ws-kitchen');
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        if (event.data === 'REFRESH_KITCHEN_QUEUE') {
          fetchQueue();
          showToast('🔔 Cập nhật thực đơn bếp thời gian thực!');
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  };

  useEffect(() => {
    fetchQueue();
    connectWebSocket();

    const interval = setInterval(fetchQueue, 10000);
    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const handleUpdateItemStatus = async (orderItemId, dishName, newStatus) => {
    try {
      const res = await api.put(`/api/chef/items/${orderItemId}/status`, { cookingStatus: newStatus });
      if (res.data && res.data.success) {
        showToast(`✅ Đã chuyển món "${dishName}" sang trạng thái ${newStatus === 'COOKING' ? 'Đang nấu 🔥' : 'Nấu xong (Ready)'}`);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
      showToast('Cập nhật trạng thái chế biến thất bại.');
    }
  };

  const handleNotifyWaiter = async (orderId) => {
    try {
      const res = await api.post(`/api/chef/orders/${orderId}/notify-waiter`);
      if (res.data && res.data.success) {
        showToast(`🔔 Đã phát thông báo hoàn thành đơn ORDER-#${orderId} tới Phục Vụ!`);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
      showToast('Báo Phục vụ thất bại.');
    }
  };

  // Flatten items for KDS 3 Columns
  const pendingItems = [];
  const cookingItems = [];
  const readyItems = [];

  orders.forEach((ord) => {
    ord.items?.forEach((item) => {
      const enrichedItem = {
        ...item,
        orderId: ord.id,
        tableName: ord.tableName || 'Mang về',
        orderDate: ord.orderDate
      };
      const status = item.cookingStatus || 'PENDING';
      if (status === 'PENDING') pendingItems.push(enrichedItem);
      else if (status === 'COOKING') cookingItems.push(enrichedItem);
      else readyItems.push(enrichedItem);
    });
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans pb-12">
      <ChefNavbar />

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#4A121A] text-[#F5E6D3] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2.5">
          <ChefHat className="w-5 h-5 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Title & Status Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="pl-4 border-l-4 border-[#C5A059]">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A121A]">
                Bảng KDS Bếp - Chế Biến Món Ăn
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                  wsConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></span>
                {wsConnected ? 'Trực tuyến (Live WebSocket)' : 'Ngoại tuyến'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">
              Theo dõi tiến trình làm bếp theo 3 công đoạn: Chờ nhận &rarr; Đang nấu &rarr; Nấu xong (Ready).
            </p>
          </div>

          <button
            onClick={fetchQueue}
            className="px-4 py-2.5 rounded-2xl bg-[#4A121A] text-[#F5E6D3] hover:text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-[#C5A059]/30"
          >
            <RefreshCw className="w-4 h-4 text-[#C5A059]" /> Làm mới KDS
          </button>
        </div>

        {/* KDS 3-Column Kanban Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-white rounded-3xl border border-[#E8E2D9]">
            Đang tải hàng đợi KDS Bếp...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: PENDING (Chờ Nhận Món) */}
            <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-amber-200">
                <h3 className="font-extrabold font-serif text-amber-950 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-600" /> 1. Chờ Nhận Nấu
                </h3>
                <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-mono font-bold text-xs shadow-2xs">
                  {pendingItems.length} món
                </span>
              </div>

              {pendingItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-amber-800/60 font-semibold italic">
                  Không có món chờ chế biến.
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-[#4A121A]">ORDER-#{item.orderId}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#4A121A] text-[#F5E6D3] border border-[#C5A059]/30 text-[11px] font-extrabold uppercase">
                        {item.tableName}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold font-serif text-base text-gray-900 leading-snug">
                        {item.dishName}
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-md border border-amber-300 shrink-0">
                        x{item.quantity}
                      </span>
                    </div>

                    {item.note && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 font-semibold italic">
                        📝 Ghi chú: {item.note}
                      </div>
                    )}

                    <button
                      onClick={() => handleUpdateItemStatus(item.id, item.dishName, 'COOKING')}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" /> Nhận món & Bắt đầu nấu
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* COLUMN 2: COOKING (Đang Chế Biến) */}
            <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-indigo-200">
                <h3 className="font-extrabold font-serif text-indigo-950 flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-indigo-600 animate-pulse" /> 2. Đang Nấu (Đỏ Lửa 🔥)
                </h3>
                <span className="px-3 py-1 rounded-full bg-indigo-200 text-indigo-950 font-mono font-bold text-xs shadow-2xs">
                  {cookingItems.length} món
                </span>
              </div>

              {cookingItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-indigo-800/60 font-semibold italic">
                  Chưa có món nào đang nấu trên bếp.
                </div>
              ) : (
                cookingItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-[#4A121A]">ORDER-#{item.orderId}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#4A121A] text-[#F5E6D3] border border-[#C5A059]/30 text-[11px] font-extrabold uppercase">
                        {item.tableName}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold font-serif text-base text-gray-900 leading-snug">
                        {item.dishName}
                      </h4>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-extrabold text-xs rounded-md border border-indigo-300 shrink-0">
                        x{item.quantity}
                      </span>
                    </div>

                    {item.note && (
                      <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900 font-semibold italic">
                        📝 Ghi chú: {item.note}
                      </div>
                    )}

                    <button
                      onClick={() => handleUpdateItemStatus(item.id, item.dishName, 'READY')}
                      className="w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm animate-pulse"
                    >
                      <Check className="w-4 h-4" /> Báo nấu xong (Ready)
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* COLUMN 3: READY (Đã Chín - Báo Phục Vụ) */}
            <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-emerald-200">
                <h3 className="font-extrabold font-serif text-emerald-950 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 3. Nấu Xong (Chờ Bưng Món)
                </h3>
                <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-mono font-bold text-xs shadow-2xs">
                  {readyItems.length} món
                </span>
              </div>

              {readyItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-emerald-800/60 font-semibold italic">
                  Chưa có món chín chờ bưng.
                </div>
              ) : (
                readyItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-[#4A121A]">ORDER-#{item.orderId}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#4A121A] text-[#F5E6D3] border border-[#C5A059]/30 text-[11px] font-extrabold uppercase">
                        {item.tableName}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold font-serif text-base text-gray-900 leading-snug">
                        {item.dishName}
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-md border border-emerald-300 shrink-0">
                        x{item.quantity}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNotifyWaiter(item.orderId)}
                      className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Bell className="w-4 h-4" /> Báo Phục Vụ bưng món
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
