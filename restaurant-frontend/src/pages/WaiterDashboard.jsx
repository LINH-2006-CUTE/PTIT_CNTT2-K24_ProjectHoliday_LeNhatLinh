import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import WaiterNavbar from '../components/WaiterNavbar';
import {
  Utensils,
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  Users
} from 'lucide-react';

export default function WaiterDashboard() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [tRes, oRes, rRes] = await Promise.all([
        api.get('/api/waiter/tables'),
        api.get('/api/waiter/orders'),
        api.get('/api/public/reservations')
      ]);

      if (tRes.data && tRes.data.success) setTables(tRes.data.data);
      if (oRes.data && oRes.data.success) setOrders(oRes.data.data);
      if (rRes.data && rRes.data.success) setReservations(rRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED');
  const availableTables = tables.filter(t => t.status === 'AVAILABLE');
  const reservedTables = tables.filter(t => t.status === 'RESERVED');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222E21] font-sans">
      <WaiterNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md">
          <div>
            <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
              Bàn Giao Ca & Phục Vụ Sảnh
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
              Bảng Điều Khiển Nhân Viên Phục Vụ
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/waiter/tables"
              className="bg-[#3B4A39] text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#222E21] transition-all shadow-md flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-[#708238]" /> Sơ Đồ Bàn
            </Link>
            <Link
              to="/waiter/orders"
              className="bg-[#708238] text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#5a6a2d] transition-all shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Tạo Order Mới
            </Link>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Stat 1: Bàn Đang Phục Vụ */}
          <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Bàn Đang Phục Vụ
              </span>
              <span className="text-3xl font-bold font-mono text-[#8C3A27]">
                {occupiedTables.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Bàn có khách ăn</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#8C3A27] flex items-center justify-center">
              <Utensils className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 2: Bàn Trống */}
          <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Bàn Trống Sẵn Sàng
              </span>
              <span className="text-3xl font-bold font-mono text-[#708238]">
                {availableTables.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Sẵn sàng nhận khách</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#708238] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 3: Order Hôm Nay */}
          <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Đơn Hàng Hôm Nay
              </span>
              <span className="text-3xl font-bold font-mono text-[#3B4A39]">
                {orders.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Đơn đang xử lý</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#3B4A39] flex items-center justify-center">
              <ClipboardList className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 4: Reservation Hôm Nay */}
          <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Lịch Đặt Bàn Hôm Nay
              </span>
              <span className="text-3xl font-bold font-mono text-purple-700">
                {reservations.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Khách đặt trước</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
              <CalendarCheck className="w-7 h-7" />
            </div>
          </div>

        </div>

        {/* Section: Floor Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Tables Overview */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#3B4A39]/10 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold font-serif text-lg text-[#222E21] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#708238]" /> Danh Sách Bàn Đang Phục Vụ
              </h3>
              <Link to="/waiter/tables" className="text-xs font-bold text-[#708238] hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {occupiedTables.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                Hiện tại chưa có bàn nào đang có khách ăn.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {occupiedTables.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#3B4A39]/20 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm font-serif text-[#222E21]">{t.tableNumber}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>Vị trí: {t.location}</span>
                      <span>Sức chứa: {t.capacity} người</span>
                    </div>
                    <Link
                      to="/waiter/orders"
                      className="block text-center w-full py-1.5 rounded-xl bg-[#3B4A39] text-white text-xs font-bold hover:bg-[#222E21] transition-all"
                    >
                      Gọi Món / Thêm Đơn
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Active Orders List */}
          <div className="bg-white rounded-3xl p-6 border border-[#3B4A39]/10 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold font-serif text-lg text-[#222E21] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#708238]" /> Đơn Hàng Mới Nhất
              </h3>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-gray-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-[#222E21]">
                      <span>#ORD-{ord.id} ({ord.tableName})</span>
                      <span className="text-[#8C3A27]">{formatCurrency(ord.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Khách: {ord.customerName}</span>
                      <span className="font-semibold text-blue-700">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
