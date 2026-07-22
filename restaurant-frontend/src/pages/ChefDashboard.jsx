import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  ChefHat,
  Flame,
  CheckCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  UtensilsCrossed,
  Bell
} from 'lucide-react';

export default function ChefDashboard() {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/chef/orders');
      if (res.data && res.data.success) {
        setKitchenOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const pendingOrders = kitchenOrders.filter(o => o.status === 'PENDING' || o.status === 'IN_SERVICE');
  const cookingOrders = kitchenOrders.filter(o => o.status === 'COOKING');
  const readyOrders = kitchenOrders.filter(o => o.status === 'READY');

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">
      <ChefNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md">
          <div>
            <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block mb-1">
              Kitchen Display Station (KDS)
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#3A1C14]">
              Bảng Điều Khiển Khu Vực Bếp
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/chef/queue"
              className="bg-[#7A2E1E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#3A1C14] transition-all shadow-md flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-[#D97706]" /> Màn Hình KDS Chế Biến
            </Link>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Stat 1: Đơn Chờ Nhận */}
          <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Đơn Chờ Nhận Món
              </span>
              <span className="text-3xl font-bold font-mono text-[#D97706]">
                {pendingOrders.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Cần đầu bếp tiếp nhận</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 2: Đơn Đang Nấu */}
          <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Đơn Đang Chế Biến
              </span>
              <span className="text-3xl font-bold font-mono text-[#7A2E1E]">
                {cookingOrders.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Đang đỏ lửa trên bếp</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-200 text-[#7A2E1E] flex items-center justify-center">
              <Flame className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 3: Đơn Hoàn Thành Sẵn Sàng */}
          <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Đã Hoàn Thành Báo Waiter
              </span>
              <span className="text-3xl font-bold font-mono text-emerald-700">
                {readyOrders.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Sẵn sàng phục vụ khách</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <CheckCheck className="w-7 h-7" />
            </div>
          </div>

        </div>

        {/* Section: Urgent Cooking Tickets */}
        <div className="bg-white rounded-3xl p-6 border border-[#7A2E1E]/10 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold font-serif text-lg text-[#3A1C14] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#D97706]" /> Danh Sách Phiếu Bếp Đang Nấu Gấp
            </h3>
            <Link to="/chef/queue" className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1">
              Mở Màn Hình KDS Kanban <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {kitchenOrders.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 font-semibold">
              Hiện tại không có đơn hàng nào cần chế biến. Bếp sẵn sàng đón đơn mới!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kitchenOrders.slice(0, 3).map((ord) => (
                <div key={ord.id} className="p-5 rounded-3xl bg-[#FAF7F2] border border-[#7A2E1E]/20 shadow-md space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-mono font-bold text-sm text-[#7A2E1E]">#ORD-{ord.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#3A1C14] text-[#FAF7F2] text-[10px] font-bold uppercase">
                      {ord.tableName}
                    </span>
                  </div>

                  {/* Item Details list */}
                  <div className="space-y-2 text-xs">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start bg-white p-2 rounded-xl border border-gray-200">
                        <div>
                          <span className="font-bold text-[#3A1C14] block">{item.dishName} x{item.quantity}</span>
                          {item.note && (
                            <span className="text-[10px] text-red-600 font-semibold italic block mt-0.5">
                              Ghi chú: {item.note}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {item.cookingStatus || 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/chef/queue"
                    className="block text-center w-full py-2 rounded-xl bg-[#7A2E1E] text-white text-xs font-bold hover:bg-[#3A1C14] transition-all"
                  >
                    Xem Chi Tiết KDS
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
