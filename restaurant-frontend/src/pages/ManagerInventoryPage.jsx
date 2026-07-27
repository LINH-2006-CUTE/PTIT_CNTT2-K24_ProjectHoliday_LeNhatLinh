import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  Package,
  AlertTriangle,
  Search,
  CheckCircle2,
  Send,
  RefreshCw
} from 'lucide-react';

export default function ManagerInventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/manager/inventory');
      if (res.data && res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendRequestToAdmin = async () => {
    try {
      const lowItems = items.filter(i => i.status === 'LOW' || i.stock <= i.minThreshold);
      const count = lowItems.length > 0 ? lowItems.length : 3;
      const res = await api.post('/api/staff-notifications/send', {
        title: `Yêu Cầu Duyệt Nhập Hàng Gấp (${count} Mặt Hàng Sắp Hết Kho)`,
        message: `Quản lý đề xuất Admin phê duyệt đơn nhập kho khẩn cấp cho ${count} mặt hàng nguyên liệu dưới định mức tồn tối thiểu.`,
        targetRole: 'ROLE_ADMIN',
        senderName: user?.fullName || 'Trần Hoàng Nam (Quản Lý)',
        senderRole: 'ROLE_MANAGER'
      });

      if (res.data && res.data.success) {
        setRequestSent(true);
        showToast('Đã gửi yêu cầu đề xuất duyệt nhập hàng tới Admin thành công!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
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
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
              Inventory Control & Stock Alerts
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
              Theo Dõi Tồn Kho & Cảnh Báo Nhập Hàng
            </h1>
          </div>

          <button
            onClick={handleSendRequestToAdmin}
            disabled={requestSent}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border ${
              requestSent
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-[#1E2A38] text-white hover:bg-[#0F172A] border-[#C5A059]/40'
            }`}
          >
            {requestSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã Gửi Yêu Cầu Tới Admin
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#C5A059]" /> Gửi Yêu Cầu Duyệt Nhập Hàng Tới Admin
              </>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#1E2A38]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên nguyên liệu hoặc danh mục kho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]"
            />
          </div>
        </div>

        {/* Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-6 border border-[#1E2A38]/15 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
                  <span className="font-bold text-base text-[#0F172A]">{item.name}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-gray-200 text-[10px] font-bold text-gray-500">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Tồn kho hiện tại:</span>
                    <strong className="text-[#0F172A]">{item.stock} {item.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Định mức tối thiểu:</span>
                    <span className="text-gray-500">{item.minThreshold} {item.unit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.status === 'LOW'
                    ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {item.status === 'LOW' ? '⚠️ Ổn định - Cần Nhập' : '✓ An Toàn'}
                </span>

                <button
                  onClick={handleSendRequestToAdmin}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-gray-100 text-[#0F172A] text-[10px] font-bold border border-gray-200 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3 text-[#C5A059]" /> Đề Xuất
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
