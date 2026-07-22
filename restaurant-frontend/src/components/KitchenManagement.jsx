import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function KitchenManagement() {
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('ACTIVE_QUEUE'); // 'ACTIVE_QUEUE', 'PENDING', 'COOKING', 'READY', 'COMPLETED'
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Toast Stack
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchKitchenQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/kitchen/queue');
      if (res.data && res.data.success) {
        setQueueItems(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi tải danh sách bếp chế biến.', 'error');
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
        console.log('Kitchen WebSocket connected.');
        setWsConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        if (event.data === 'REFRESH_KITCHEN_QUEUE') {
          api.get('/api/admin/kitchen/queue').then((res) => {
            if (res.data && res.data.success) {
              setQueueItems(res.data.data || []);
              showToast('🔔 Thực đơn bếp có đơn hàng mới!', 'success');
            }
          });
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  };

  useEffect(() => {
    fetchKitchenQueue();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const handleUpdateStatus = async (orderItemId, dishName, newStatus) => {
    try {
      const res = await api.put(`/api/admin/kitchen/items/${orderItemId}/status`, null, {
        params: { status: newStatus }
      });
      if (res.data && res.data.success) {
        let msg = '';
        if (newStatus === 'COOKING') msg = `🔥 Bắt đầu chế biến món: ${dishName}`;
        else if (newStatus === 'READY') msg = `✅ Món ${dishName} đã nấu xong, sẵn sàng bưng ra bàn!`;
        else if (newStatus === 'COMPLETED') msg = `🍽️ Đã phục vụ xong món: ${dishName}`;

        showToast(msg, 'success');
        fetchKitchenQueue();
      }
    } catch (err) {
      console.error(err);
      showToast('Đổi trạng thái món ăn thất bại.', 'error');
    }
  };

  // Filter items
  const getFilteredItems = () => {
    let items = queueItems;

    if (search.trim()) {
      const s = search.toLowerCase().trim();
      items = items.filter(
        (i) =>
          (i.dishName && i.dishName.toLowerCase().includes(s)) ||
          (i.tableNumber && i.tableNumber.toLowerCase().includes(s)) ||
          (i.orderId && String(i.orderId).includes(s))
      );
    }

    if (tableFilter !== 'All') {
      items = items.filter((i) => i.tableNumber === tableFilter);
    }

    if (activeTab === 'ACTIVE_QUEUE') {
      return items.filter((i) => i.cookingStatus !== 'COMPLETED');
    } else {
      return items.filter((i) => i.cookingStatus === activeTab);
    }
  };

  const getDistinctTables = () => {
    const tables = queueItems.map((i) => i.tableNumber);
    return [...new Set(tables)].filter(Boolean);
  };

  const filteredList = getFilteredItems();

  // Metrics
  const totalActive = queueItems.filter((i) => i.cookingStatus !== 'COMPLETED').length;
  const pendingCount = queueItems.filter((i) => i.cookingStatus === 'PENDING').length;
  const cookingCount = queueItems.filter((i) => i.cookingStatus === 'COOKING').length;
  const readyCount = queueItems.filter((i) => i.cookingStatus === 'READY').length;
  const completedCount = queueItems.filter((i) => i.cookingStatus === 'COMPLETED').length;

  return (
    <div className="relative">
      
      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl shadow-xl border text-sm max-w-sm transition-all duration-300 transform translate-x-0 ${
              t.type === 'success'
                ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]/30'
                : 'bg-red-800 text-white border-red-900'
            }`}
          >
            {t.type === 'success' ? (
              <svg className="h-5 w-5 shrink-0 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-semibold tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="pl-4 border-l-4 border-[#C5A059]">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold font-serif bg-gradient-to-r from-[#4A121A] via-[#6b1d28] to-[#C5A059] bg-clip-text text-transparent">
                Hàng Đợi Chế Biến (Bếp L'ÉCLAT)
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
                  wsConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></span>
                {wsConnected ? 'Bếp Thời Gian Thực (Live)' : 'Đang Kết Nối Lại...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
              Màn hình KDS Bếp - Quản lý tiến trình nấu ăn, báo xong món & bưng ra bàn cho thực khách.
            </p>
          </div>

          <button
            onClick={fetchKitchenQueue}
            className="py-2.5 px-4 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#4A121A] text-xs font-bold rounded-xl border border-[#E8E2D9] shadow-2xs transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới hàng đợi
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div
          onClick={() => setActiveTab('ACTIVE_QUEUE')}
          className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
            activeTab === 'ACTIVE_QUEUE'
              ? 'bg-gradient-to-br from-[#4A121A] to-[#6b1d28] text-white border-[#4A121A] shadow-md'
              : 'bg-white border-[#E8E2D9] hover:bg-[#FAF7F2]'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'ACTIVE_QUEUE' ? 'text-amber-200' : 'text-gray-400'}`}>
              Đang chờ nấu
            </span>
            <span className="text-xl font-extrabold font-serif">{totalActive}</span>
          </div>
          <span className={`text-[11px] mt-1 block font-medium ${activeTab === 'ACTIVE_QUEUE' ? 'text-amber-100/80' : 'text-gray-500'}`}>
            Món ăn chưa hoàn tất
          </span>
        </div>

        <div
          onClick={() => setActiveTab('PENDING')}
          className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/50'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'PENDING' ? 'text-amber-100' : 'text-amber-800'}`}>
              Chờ chế biến
            </span>
            <span className={`text-xl font-extrabold font-serif ${activeTab === 'PENDING' ? 'text-white' : 'text-amber-900'}`}>{pendingCount}</span>
          </div>
          <span className={`text-[11px] mt-1 block font-medium ${activeTab === 'PENDING' ? 'text-amber-100' : 'text-amber-700'}`}>
            Đơn mới chờ nhận
          </span>
        </div>

        <div
          onClick={() => setActiveTab('COOKING')}
          className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
            activeTab === 'COOKING'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
              : 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-100/50'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'COOKING' ? 'text-indigo-100' : 'text-indigo-800'}`}>
              Đang nấu 🔥
            </span>
            <span className={`text-xl font-extrabold font-serif ${activeTab === 'COOKING' ? 'text-white' : 'text-indigo-900'}`}>{cookingCount}</span>
          </div>
          <span className={`text-[11px] mt-1 block font-medium ${activeTab === 'COOKING' ? 'text-indigo-100' : 'text-indigo-700'}`}>
            Bếp đang thực hiện
          </span>
        </div>

        <div
          onClick={() => setActiveTab('READY')}
          className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
            activeTab === 'READY'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'READY' ? 'text-emerald-100' : 'text-emerald-800'}`}>
              Đã xong (Ready)
            </span>
            <span className={`text-xl font-extrabold font-serif ${activeTab === 'READY' ? 'text-white' : 'text-emerald-900'}`}>{readyCount}</span>
          </div>
          <span className={`text-[11px] mt-1 block font-medium ${activeTab === 'READY' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Chờ bồi bàn bưng
          </span>
        </div>

        <div
          onClick={() => setActiveTab('COMPLETED')}
          className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
            activeTab === 'COMPLETED'
              ? 'bg-slate-700 text-white border-slate-800 shadow-md'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'COMPLETED' ? 'text-slate-200' : 'text-slate-600'}`}>
              Đã phục vụ
            </span>
            <span className={`text-xl font-extrabold font-serif ${activeTab === 'COMPLETED' ? 'text-white' : 'text-slate-800'}`}>{completedCount}</span>
          </div>
          <span className={`text-[11px] mt-1 block font-medium ${activeTab === 'COMPLETED' ? 'text-slate-300' : 'text-slate-500'}`}>
            Đã hoàn thành ca
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center border border-[#E8E2D9] rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <svg className="absolute left-3.5 top-3 h-4 w-4 text-[#C5A059] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm theo tên món, mã đơn, số bàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            className="form-input py-2.5 pr-4 text-xs font-medium placeholder:text-gray-400 w-full bg-[#FAF7F2] border-[#E8E2D9] focus:border-[#4A121A] rounded-xl"
          />
        </div>

        {/* Table Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest shrink-0">Lọc theo Bàn:</span>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3.5 py-2 font-bold text-[#4A121A] focus:outline-none focus:border-[#4A121A] cursor-pointer shadow-2xs w-full md:w-auto"
          >
            <option value="All">Tất cả bàn ăn</option>
            {getDistinctTables().map((tb) => (
              <option key={tb} value={tb}>
                {tb}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Order Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-[#E8E2D9]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang cập nhật thực đơn bếp...</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D9] text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 text-[#C5A059]/60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm font-bold text-gray-600">Không có món ăn nào trong hàng đợi này.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
          {filteredList.map((item) => {
            const timeStr = item.orderTime
              ? new Date(item.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '---';

            const isPending = item.cookingStatus === 'PENDING';
            const isCooking = item.cookingStatus === 'COOKING';
            const isReady = item.cookingStatus === 'READY';
            const isCompleted = item.cookingStatus === 'COMPLETED';

            return (
              <div
                key={item.orderItemId}
                className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md hover:border-[#C5A059]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Table Badge & Time (No overlapping) */}
                  <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E8E2D9] flex justify-between items-center">
                    <span className="px-3 py-1 bg-[#4A121A] text-[#F5E6D3] text-xs font-extrabold rounded-lg border border-[#C5A059]/40 shadow-xs uppercase tracking-wider">
                      {item.tableNumber || 'Mang về'}
                    </span>

                    <span className="text-[11px] font-mono font-bold text-gray-600 bg-white px-2.5 py-1 rounded-md border border-[#E8E2D9]">
                      ⏰ {timeStr}
                    </span>
                  </div>

                  {/* Image & Main Info */}
                  <div className="p-4 flex gap-3.5 items-start">
                    {/* Dish Image Thumbnail */}
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      {item.dishImage ? (
                        <img
                          src={item.dishImage.startsWith('http') ? item.dishImage : `http://localhost:8080${item.dishImage}`}
                          alt={item.dishName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#4A121A] text-[#C5A059] flex items-center justify-center font-serif font-bold text-xs">
                          L'ÉCLAT
                        </div>
                      )}
                    </div>

                    {/* Dish Name & Quantity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-base font-extrabold font-serif text-[#4A121A] line-clamp-2 leading-snug">
                          {item.dishName}
                        </h4>
                        <span className="px-2.5 py-1 bg-[#4A121A]/10 text-[#4A121A] font-extrabold text-xs rounded-lg shrink-0 border border-[#4A121A]/20">
                          x{item.quantity}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-gray-400 block mt-1">
                        Mã đơn: <strong className="text-gray-700">ORDER-#{item.orderId}</strong>
                      </span>

                      {/* Customer Notes / Special Requests */}
                      {item.note && (
                        <div className="mt-2 p-2 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 font-semibold leading-tight">
                          📝 Ghi chú: {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3.5 bg-[#FAF7F2]/60 border-t border-[#E8E2D9] flex justify-between items-center">
                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${
                      isPending
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : isCooking
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300 animate-pulse'
                        : isReady
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}
                  >
                    {isPending ? 'Chờ nấu' : isCooking ? 'Đang nấu 🔥' : isReady ? 'Đã chín (Ready)' : 'Đã phục vụ'}
                  </span>

                  {/* Transition Button */}
                  {isPending && (
                    <button
                      onClick={() => handleUpdateStatus(item.orderItemId, item.dishName, 'COOKING')}
                      className="py-2 px-3.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Bắt đầu nấu
                    </button>
                  )}

                  {isCooking && (
                    <button
                      onClick={() => handleUpdateStatus(item.orderItemId, item.dishName, 'READY')}
                      className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 animate-bounce"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Báo chín (Ready)
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => handleUpdateStatus(item.orderItemId, item.dishName, 'COMPLETED')}
                      className="py-2 px-3.5 bg-[#4A121A] hover:bg-[#6b1d28] text-[#F5E6D3] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Báo bưng ra bàn
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
