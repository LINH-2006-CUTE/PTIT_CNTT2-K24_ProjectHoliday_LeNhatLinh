import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  ClipboardList,
  Search,
  XCircle,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/manager/dashboard-stats');
      // Mock list of orders for Manager tracking
      setOrders([
        { id: 1001, tableName: 'Bàn 102', customerName: 'David Beckham', totalAmount: 1250000, status: 'COOKING', orderDate: '2026-07-22 12:45' },
        { id: 1002, tableName: 'Bàn VIP 1', customerName: 'Victoria Beckham', totalAmount: 3400000, status: 'READY', orderDate: '2026-07-22 13:00' },
        { id: 1003, tableName: 'Bàn 105', customerName: 'Khách Lẻ', totalAmount: 850000, status: 'PENDING', orderDate: '2026-07-22 13:10' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleConfirmCancelOrder = () => {
    if (!cancelModalOrder) return;
    setOrders(orders.map(o => o.id === cancelModalOrder.id ? { ...o, status: 'CANCELLED' } : o));
    showToast(`Đã duyệt hủy đơn hàng #ORD-${cancelModalOrder.id} thành công!`);
    setCancelModalOrder(null);
  };

  const filteredOrders = orders.filter(o =>
    o.id.toString().includes(search) ||
    o.tableName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#1E2A38] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Executive Order Monitoring
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
            Theo Dõi, Điều Chỉnh & Duyệt Hủy Đơn Hàng
          </h1>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#1E2A38]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo số đơn #ORD, bàn ăn hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#1E2A38]/15 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] text-[#1E2A38] font-bold border-b border-gray-200">
                  <th className="p-3.5 rounded-l-xl">Mã Đơn #ORD</th>
                  <th className="p-3.5">Bàn Ăn</th>
                  <th className="p-3.5">Khách Hàng</th>
                  <th className="p-3.5">Tổng Tiền</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5 text-right rounded-r-xl">Thao Tác Quản Lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#1E2A38]">#ORD-{ord.id}</td>
                    <td className="p-3.5 font-bold">{ord.tableName}</td>
                    <td className="p-3.5 text-gray-600">{ord.customerName}</td>
                    <td className="p-3.5 font-bold font-mono text-[#0F172A]">{formatVND(ord.totalAmount)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400 font-mono">{ord.orderDate}</td>
                    <td className="p-3.5 text-right space-x-2">
                      {ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => setCancelModalOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Duyệt Hủy Đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-[#1E2A38]/30 relative animate-fade-in text-center">
              <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="font-bold font-serif text-lg text-[#0F172A]">
                Xác Nhận Hủy Đơn Hàng #ORD-{cancelModalOrder.id}
              </h3>
              <p className="text-xs text-gray-600">
                Bạn có chắc chắn muốn duyệt hủy đơn hàng bàn <strong className="text-[#0F172A]">{cancelModalOrder.tableName}</strong>? Thao tác này sẽ cập nhật lại kho và hóa đơn.
              </p>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Bỏ Qua
                </button>
                <button
                  onClick={handleConfirmCancelOrder}
                  className="w-full py-2.5 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-all cursor-pointer shadow-md"
                >
                  Xác Nhận Hủy Đơn
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
