import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WaiterNavbar from '../components/WaiterNavbar';
import {
  Utensils,
  ArrowRightLeft,
  Merge,
  Split,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  X,
  ChefHat,
  Sparkles,
  Brush
} from 'lucide-react';

export default function WaiterTableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'STATUS', 'MOVE', 'MERGE', 'SPLIT'
  const [selectedTable, setSelectedTable] = useState(null);
  const [targetTableId, setTargetTableId] = useState('');
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/waiter/tables');
      if (res.data && res.data.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableAction = async (actionType) => {
    if (!selectedTable) return;
    try {
      const body = {
        fromTableId: selectedTable.id,
        toTableId: targetTableId ? parseInt(targetTableId) : null,
        action: actionType,
        newStatus: newStatus
      };

      const res = await api.post('/api/waiter/tables/action', body);
      if (res.data && res.data.success) {
        showToast(`Thực hiện thao tác ${actionType} thành công cho bàn ${selectedTable.tableNumber}`);
        setActiveModal(null);
        setSelectedTable(null);
        setTargetTableId('');
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Thao tác không thành công.');
    }
  };

  const locations = ['ALL', ...new Set(tables.map(t => t.location).filter(Boolean))];

  const filteredTables = selectedLocation === 'ALL'
    ? tables
    : tables.filter(t => t.location === selectedLocation);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OCCUPIED': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'RESERVED': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CLEANING': return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickStatusChange = async (tableId, status) => {
    try {
      const res = await api.put(`/api/waiter/tables/${tableId}/status`, { status });
      if (res.data && res.data.success) {
        showToast(`Đã chuyển trạng thái bàn sang ${status}`);
        fetchTables();
      }
    } catch (err) {
      console.error(err);
      showToast('Cập nhật trạng thái thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222E21] font-sans">
      <WaiterNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#3B4A39] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#708238]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <span>✨ {toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title & Legend */}
        <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
              Floor Plan Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
              Sơ Đồ Bàn & Quản Lý Trạng Thái Phục Vụ
            </h1>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Bàn Trống (AVAILABLE)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Có Khách (OCCUPIED)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Đặt Trước (RESERVED)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-700 border border-gray-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> Dọn Dẹp (CLEANING)
            </span>
          </div>
        </div>

        {/* Location Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-[#3B4A39] text-white shadow-md'
                  : 'bg-white text-[#222E21] border border-gray-200 hover:border-[#3B4A39]'
              }`}
            >
              {loc === 'ALL' ? 'Tất Cả Khu Vực' : `Khu Vực ${loc}`}
            </button>
          ))}
        </div>

        {/* Interactive Floor Plan Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải sơ đồ bàn sảnh...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTables.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-[#3B4A39]/15 shadow-xl hover:shadow-2xl transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-serif font-bold text-xl text-[#222E21]">{t.tableNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500 font-medium mb-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#708238]" /> Khu vực: {t.location}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#708238]" /> Sức chứa: {t.capacity} người
                    </p>
                  </div>

                  {/* Feature 1: Kitchen Finish Badge for Occupied Tables */}
                  {t.status === 'OCCUPIED' && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                      <ChefHat className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Bếp sẵn sàng cung ứng món!</span>
                    </div>
                  )}

                  {/* Feature 2: 1-Touch Quick Cleaning Action */}
                  {t.status === 'OCCUPIED' && (
                    <button
                      onClick={() => handleQuickStatusChange(t.id, 'CLEANING')}
                      className="mt-2 w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Brush className="w-3.5 h-3.5" /> 1-Touch: Báo Dọn Bàn
                    </button>
                  )}

                  {t.status === 'CLEANING' && (
                    <button
                      onClick={() => handleQuickStatusChange(t.id, 'AVAILABLE')}
                      className="mt-2 w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm animate-bounce"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Dọn Xong ➔ Bàn Trống Sẵn Sàng
                    </button>
                  )}
                </div>

                {/* Table Quick Action Controls */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedTable(t);
                      setNewStatus(t.status);
                      setActiveModal('STATUS');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#FAF7F2] border border-gray-200 hover:bg-[#3B4A39] hover:text-white text-[11px] font-bold transition-all text-[#222E21] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-[#708238]" /> Đổi Trạng Thái
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTable(t);
                      setActiveModal('MOVE');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#FAF7F2] border border-gray-200 hover:bg-[#3B4A39] hover:text-white text-[11px] font-bold transition-all text-[#222E21] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-blue-600" /> Chuyển Bàn
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTable(t);
                      setActiveModal('MERGE');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#FAF7F2] border border-gray-200 hover:bg-[#3B4A39] hover:text-white text-[11px] font-bold transition-all text-[#222E21] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Merge className="w-3 h-3 text-purple-600" /> Ghép Bàn
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTable(t);
                      handleTableAction('SPLIT');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-[#FAF7F2] border border-gray-200 hover:bg-red-600 hover:text-white text-[11px] font-bold transition-all text-[#222E21] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Split className="w-3 h-3 text-red-600" /> Tách Bàn
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal: Change Status / Move / Merge */}
      {activeModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#3B4A39]/20 shadow-2xl space-y-5 relative">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif text-[#222E21]">
              {activeModal === 'STATUS' && `Đổi Trạng Thái Bàn ${selectedTable.tableNumber}`}
              {activeModal === 'MOVE' && `Chuyển Bàn ${selectedTable.tableNumber}`}
              {activeModal === 'MERGE' && `Ghép Bàn ${selectedTable.tableNumber}`}
            </h3>

            {activeModal === 'STATUS' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Chọn Trạng Thái Mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input text-xs py-2.5 w-full"
                >
                  <option value="AVAILABLE">AVAILABLE (Bàn Trống)</option>
                  <option value="OCCUPIED">OCCUPIED (Có Khách Ăn)</option>
                  <option value="RESERVED">RESERVED (Đã Đặt Trước)</option>
                  <option value="CLEANING">CLEANING (Đang Dọn Dẹp)</option>
                </select>

                <button
                  onClick={() => handleTableAction('CHANGE_STATUS')}
                  className="w-full py-3 rounded-2xl bg-[#3B4A39] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#222E21] transition-all cursor-pointer"
                >
                  Xác Nhận Cập Nhật
                </button>
              </div>
            )}

            {(activeModal === 'MOVE' || activeModal === 'MERGE') && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Chọn Bàn Đích ({activeModal === 'MOVE' ? 'Chuyển Đơn' : 'Ghép Cùng'})
                </label>

                <select
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                  className="form-input text-xs py-2.5 w-full"
                >
                  <option value="">-- Chọn Bàn --</option>
                  {tables.filter(t => t.id !== selectedTable.id).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} ({t.location} - {t.status})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleTableAction(activeModal)}
                  className="w-full py-3 rounded-2xl bg-[#3B4A39] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#222E21] transition-all cursor-pointer"
                >
                  Thực Hiện {activeModal === 'MOVE' ? 'Chuyển Bàn' : 'Ghép Bàn'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
