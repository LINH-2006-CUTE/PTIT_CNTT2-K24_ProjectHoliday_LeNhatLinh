import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  CheckCheck,
  Calendar,
  Clock,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function ChefCompletedOrdersPage() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/chef/orders');
      if (res.data && res.data.success) {
        // Filter orders that are READY or COMPLETED
        setCompletedOrders(res.data.data.filter(o => o.status === 'READY' || o.status === 'PAID'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3A1C14] font-sans">
      <ChefNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#7A2E1E]/10 shadow-md">
          <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block mb-1">
            Completed Kitchen Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#3A1C14]">
            Lịch Sử Đơn Hàng Đã Hoàn Thành Chế Biến
          </h1>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải nhật ký đơn bếp...
          </div>
        ) : completedOrders.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-white rounded-3xl border border-gray-200">
            Chưa có lịch sử đơn hoàn thành nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedOrders.map((ord) => (
              <div key={ord.id} className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-lg space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="font-mono font-bold text-sm text-emerald-800">#ORD-{ord.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {ord.tableName}
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-medium">Khách hàng: {ord.customerName}</p>

                <div className="space-y-1 text-xs pt-1">
                  {ord.items?.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{i.dishName} x{i.quantity}</span>
                      <span className="font-bold text-emerald-700">✓ Hoàn thành</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D97706]" /> Thời gian hoàn tất
                  </span>
                  <span className="text-emerald-700 font-bold">READY FOR SERVING</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
