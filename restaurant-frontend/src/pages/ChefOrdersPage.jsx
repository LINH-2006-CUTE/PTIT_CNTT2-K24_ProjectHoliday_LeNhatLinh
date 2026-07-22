import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  ChefHat,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

export default function ChefOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/chef/orders');
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toString().includes(search) ||
      o.tableName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">
      <ChefNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block mb-1">
              Kitchen Orders Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#3A1C14]">
              Danh Sách Phiếu Order Cần Chế Biến
            </h1>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-2xl bg-[#7A2E1E] text-white text-xs font-bold transition-all hover:bg-[#3A1C14] shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#D97706]" /> Tải Lại Danh Sách
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#7A2E1E]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo số đơn #ORD, bàn hoặc tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#7A2E1E]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'PENDING', 'COOKING', 'READY'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#7A2E1E] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' && 'Tất Cả'}
                {st === 'PENDING' && 'Chờ Tiếp Nhận'}
                {st === 'COOKING' && 'Đang Chế Biến'}
                {st === 'READY' && 'Đã Hoàn Thành'}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải phiếu chế biến bếp...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-white rounded-3xl border border-gray-200">
            Không tìm thấy phiếu Order nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 border border-[#7A2E1E]/20 shadow-xl space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  {/* Header info */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                    <span className="font-serif font-bold text-xl text-[#7A2E1E]">#ORD-{ord.id}</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3A1C14] text-[#FAF7F2]">
                      {ord.tableName}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-medium mb-3">
                    Khách hàng: <span className="font-bold text-[#3A1C14]">{ord.customerName}</span>
                  </p>

                  {/* Item List */}
                  <div className="space-y-2">
                    {ord.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-xs text-[#3A1C14] block">
                            {item.dishName} x{item.quantity}
                          </span>
                          {item.note && (
                            <span className="text-[10px] text-red-600 italic font-semibold flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-red-500" /> {item.note}
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {item.cookingStatus || 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 text-right">
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                    Trạng Thái Đơn: {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
