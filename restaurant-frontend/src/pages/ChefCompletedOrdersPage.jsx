import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  CheckCheck,
  Utensils,
  Clock,
  Search,
  CheckCircle2,
  MapPin,
  ChefHat,
  X,
  Eye,
  Package,
  Calendar,
  User,
  Phone,
  Receipt,
  Timer,
  Star,
  RefreshCw,
  FileText
} from 'lucide-react';

const formatCurrency = (val) =>
  `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val || 0)} VND`;

export default function ChefCompletedOrdersPage() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/chef/completed');
      if (res.data && res.data.success) {
        setCompletedOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = completedOrders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      String(o.id || '').includes(q) ||
      (o.tableName || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#1A0A05] font-sans">
      <ChefNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#1A0A05] via-[#3A1C14] to-[#1A0A05] text-white rounded-3xl px-8 py-7 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[4px] text-emerald-400">
              Lịch Sử Hoàn Thành
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Đơn Hàng Đã Chế Biến Xong
            </h1>
            <p className="text-[11px] text-white/50 font-light">
              Tổng hợp tất cả đơn bếp đã hoàn tất phục vụ. Bấm "Xem Chi Tiết" để xem thông tin đầy đủ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Tìm mã đơn, bàn, khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs rounded-2xl focus:outline-none focus:border-emerald-400 w-56"
              />
            </div>
            <button
              onClick={fetchCompletedOrders}
              className="p-2.5 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng Đơn Hoàn Thành</p>
            <p className="text-2xl font-black font-mono text-emerald-600 mt-1">{completedOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng Món Đã Nấu</p>
            <p className="text-2xl font-black font-mono text-[#D97706] mt-1">
              {completedOrders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đơn Mang Về</p>
            <p className="text-2xl font-black font-mono text-purple-600 mt-1">
              {completedOrders.filter(o => !o.tableName || o.tableName === 'Mang về').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đơn Tại Bàn</p>
            <p className="text-2xl font-black font-mono text-blue-600 mt-1">
              {completedOrders.filter(o => o.tableName && o.tableName !== 'Mang về').length}
            </p>
          </div>
        </div>

        {/* ── Order List ── */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Đang tải lịch sử đơn hoàn thành...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
            <CheckCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-xs text-gray-400 font-bold">Chưa có đơn nào hoàn thành.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-[#FAF7F2] border-b border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Mã Đơn</div>
              <div className="col-span-2">Khách Hàng</div>
              <div className="col-span-2">Vị Trí / Bàn</div>
              <div className="col-span-2">Món Ăn</div>
              <div className="col-span-2">Thời Gian</div>
              <div className="col-span-2 text-right">Thao Tác</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-[#FAF7F2] transition-colors items-center"
                >
                  {/* Mã Đơn */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black font-mono text-[#1A0A05]">ĐƠN #{order.id}</p>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Hoàn Thành</span>
                    </div>
                  </div>

                  {/* Khách Hàng */}
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-[#1A0A05]">{order.customerName || 'Khách vãng lai'}</p>
                    <p className="text-[10px] text-gray-400">{order.customerPhone || '—'}</p>
                  </div>

                  {/* Vị Trí */}
                  <div className="col-span-2 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                    <span>{order.tableName || 'Mang về'}</span>
                  </div>

                  {/* Món Ăn */}
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {(order.items || []).slice(0, 2).map((item, idx) => (
                        <span key={idx} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full line-clamp-1">
                          {item.dishName} ×{item.quantity}
                        </span>
                      ))}
                      {(order.items || []).length > 2 && (
                        <span className="text-[10px] font-bold text-[#D97706]">+{order.items.length - 2} món</span>
                      )}
                    </div>
                  </div>

                  {/* Thời Gian */}
                  <div className="col-span-2 flex items-center gap-1.5 text-[11px] font-mono text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                  </div>

                  {/* Thao Tác */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => setDetailOrder(order)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1A0A05] hover:bg-[#3A1C14] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem Chi Tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══ MODAL: Chi Tiết Đơn Hàng Hoàn Thành ══ */}
      {detailOrder && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-7 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Chi Tiết Đơn Hoàn Thành</p>
                  <h3 className="text-lg font-bold font-serif">ĐƠN #{detailOrder.id}</h3>
                </div>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="p-2 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-7 space-y-5">

              {/* Customer & Order Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tên Khách Hàng</p>
                    <p className="text-xs font-bold text-[#1A0A05] mt-0.5">{detailOrder.customerName || 'Khách vãng lai'}</p>
                  </div>
                </div>
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số Điện Thoại</p>
                    <p className="text-xs font-bold text-[#1A0A05] mt-0.5">{detailOrder.customerPhone || 'Không có'}</p>
                  </div>
                </div>
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vị Trí / Bàn</p>
                    <p className="text-xs font-bold text-[#1A0A05] mt-0.5">{detailOrder.tableName || 'Mang về'}</p>
                  </div>
                </div>
                <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loại Đơn Hàng</p>
                    <p className="text-xs font-bold text-[#1A0A05] mt-0.5">{detailOrder.orderType || 'Tại bàn'}</p>
                  </div>
                </div>
                <div className="col-span-2 bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thời Gian Đặt Món</p>
                    <p className="text-xs font-bold text-[#1A0A05] font-mono mt-0.5">{new Date(detailOrder.orderDate).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              {/* Dish List */}
              <div>
                <p className="text-[11px] font-black text-[#1A0A05] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#D97706]" />
                  Danh Sách Món Ăn Đã Chế Biến ({detailOrder.items?.length || 0} món)
                </p>
                <div className="space-y-2">
                  {(detailOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF7F2] border border-gray-200 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || item.dishImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&q=80'}
                          alt={item.dishName}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1A0A05]">{item.dishName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                            <span className="font-mono font-bold text-[#D97706]">×{item.quantity}</span>
                            <span>·</span>
                            <span className="font-mono">{formatCurrency(item.price)}</span>
                          </div>
                          {item.note && (
                            <p className="text-[10px] text-red-600 font-semibold italic mt-0.5">Ghi chú: "{item.note}"</p>
                          )}
                        </div>
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase border border-emerald-300 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Xong
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="bg-[#1A0A05] text-white p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70">Tổng Giá Trị Đơn</span>
                <span className="text-lg font-black font-mono text-[#D97706]">
                  {formatCurrency(detailOrder.totalAmount || (detailOrder.items || []).reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0))}
                </span>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Đơn Hàng Đã Hoàn Tất Chế Biến & Phục Vụ
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-7 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setDetailOrder(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
