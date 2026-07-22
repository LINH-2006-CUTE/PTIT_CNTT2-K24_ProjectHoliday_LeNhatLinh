import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CashierNavbar from '../components/CashierNavbar';
import {
  ClipboardList,
  Search,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Clock,
  MessageSquare
} from 'lucide-react';

export default function CashierOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cashier/orders');
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredOrders = orders.filter((o) => {
    return (
      o.id.toString().includes(search) ||
      o.tableName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#182B2B] font-sans">
      <CashierNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#4E878C] uppercase tracking-widest block mb-1">
              Cashier Orders Queue
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
              Danh Sách Đơn Hàng Chờ Tính Tiền
            </h1>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-2xl bg-[#2A4747] text-white text-xs font-bold transition-all hover:bg-[#182B2B] shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#4E878C]" /> Tải Lại Danh Sách
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#2A4747]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo số đơn #ORD, bàn ăn hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#2A4747]"
            />
          </div>
        </div>

        {/* Order Ticket Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải danh sách đơn chờ thu ngân...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-white rounded-3xl border border-gray-200">
            Không tìm thấy đơn hàng nào chờ thanh toán.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 border border-[#2A4747]/20 shadow-xl space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                    <span className="font-mono font-bold text-xl text-[#2A4747]">#ORD-{ord.id}</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#182B2B] text-[#FAF7F2]">
                      {ord.tableName}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-medium mb-3">
                    Khách hàng: <span className="font-bold text-[#182B2B]">{ord.customerName}</span>
                  </p>

                  <div className="space-y-2">
                    {ord.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-[#182B2B]">
                          {item.dishName} x{item.quantity}
                        </span>
                        <span className="font-mono font-bold text-[#2A4747]">
                          {formatVND(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Tổng tạm tính</span>
                    <span className="font-mono font-bold text-base text-[#2A4747]">{formatVND(ord.totalAmount)}</span>
                  </div>

                  <Link
                    to="/cashier/payments"
                    className="px-4 py-2 rounded-xl bg-[#2A4747] hover:bg-[#182B2B] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#4E878C]" /> Tính Tiền POS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
