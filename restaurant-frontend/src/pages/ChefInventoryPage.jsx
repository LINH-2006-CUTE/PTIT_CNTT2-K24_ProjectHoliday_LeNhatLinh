import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChefNavbar from '../components/ChefNavbar';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Send,
  Trash2,
  Eye,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Layers,
  Flame,
  Utensils
} from 'lucide-react';

export default function ChefInventoryPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, LOW, OK

  // Modals
  const [requestModal, setRequestModal] = useState(null); // { ingredient }
  const [spoilageModal, setSpoilageModal] = useState(null); // { ingredient }
  const [dishesModal, setDishesModal] = useState(null); // { ingredient, dishes: [] }

  // Form states
  const [requestQty, setRequestQty] = useState('');
  const [requestPriority, setRequestPriority] = useState('HIGH');
  const [requestNote, setRequestNote] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  const [spoilageQty, setSpoilageQty] = useState('');
  const [spoilageReason, setSpoilageReason] = useState('Hỏng do bảo quản');
  const [spoilageSubmitting, setSpoilageSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/inventory/ingredients');
      if (res.data && res.data.success) {
        setIngredients(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách nguyên liệu kho.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered ingredients
  const filtered = ingredients.filter((ing) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const match =
        (ing.name || '').toLowerCase().includes(q) ||
        (ing.code || '').toLowerCase().includes(q) ||
        (ing.category || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    const stock = ing.stockQuantity ?? ing.quantity ?? 0;
    const minStock = ing.minStockThreshold ?? ing.minQuantity ?? 5;
    const isLow = stock <= minStock;
    if (statusFilter === 'LOW') return isLow;
    if (statusFilter === 'OK') return !isLow;
    return true;
  });

  const lowStockCount = ingredients.filter(i => {
    const s = i.stockQuantity ?? i.quantity ?? 0;
    const m = i.minStockThreshold ?? i.minQuantity ?? 5;
    return s <= m;
  }).length;
  const okStockCount = ingredients.length - lowStockCount;

  // Submit Restock Request to Admin / Manager
  const handleSendRestockRequest = async (e) => {
    e.preventDefault();
    if (!requestModal || !requestQty || Number(requestQty) <= 0) {
      showToast('Vui lòng nhập số lượng yêu cầu hợp lệ.');
      return;
    }
    setRequestSubmitting(true);
    try {
      const ing = requestModal;
      const res = await api.post('/api/staff-notifications/send', {
        senderName: 'Bếp Trưởng (Chef KDS)',
        senderRole: 'ROLE_CHEF',
        targetRole: 'ROLE_ADMIN',
        title: `⚠️ BẾP YÊU CẦU NHẬP KHO: ${ing.name.toUpperCase()}`,
        message: `Bếp trưởng yêu cầu nhập thêm ${requestQty} ${ing.unit || 'kg'} nguyên liệu ${ing.name} (Mã: ${ing.code || 'N/A'}).\n• Tồn kho hiện tại: ${ing.quantity} ${ing.unit || 'kg'}\n• Mức ưu tiên: ${requestPriority}\n• Ghi chú bếp: "${requestNote || 'Không có'}"`,
        urgent: requestPriority === 'URGENT' || requestPriority === 'HIGH',
      });

      if (res.data && res.data.success) {
        showToast(`✅ Đã gửi yêu cầu nhập kho nguyên liệu "${ing.name}" tới Quản Lý & Admin!`);
        setRequestModal(null);
        setRequestQty('');
        setRequestNote('');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi gửi yêu cầu nhập kho.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Submit Spoilage Stock Out
  const handleSpoilageStockOut = async (e) => {
    e.preventDefault();
    if (!spoilageModal || !spoilageQty || Number(spoilageQty) <= 0) {
      showToast('Vui lòng nhập số lượng báo hỏng hợp lệ.');
      return;
    }
    setSpoilageSubmitting(true);
    try {
      const ing = spoilageModal;
      const res = await api.post(`/api/inventory/ingredients/${ing.id}/stock-out`, {
        quantity: Number(spoilageQty),
        reason: `Bếp báo hỏng: ${spoilageReason}`,
        note: `Báo hỏng nguyên liệu bếp bởi Chef`,
      });

      if (res.data && res.data.success) {
        showToast(`⚡ Đã xuất hủy ${spoilageQty} ${ing.unit || 'kg'} "${ing.name}" hỏng thành công!`);
        setSpoilageModal(null);
        setSpoilageQty('');
        fetchIngredients();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Lỗi xuất hủy nguyên liệu hỏng.');
    } finally {
      setSpoilageSubmitting(false);
    }
  };

  // Fetch Dishes Using Ingredient
  const handleOpenDishesModal = async (ing) => {
    try {
      const res = await api.get(`/api/inventory/ingredients/${ing.id}/dishes`);
      if (res.data && res.data.success) {
        setDishesModal({ ingredient: ing, dishes: res.data.data || [] });
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể lấy danh sách món ăn liên quan.');
    }
  };

  const formatCurrency = (v) =>
    `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v || 0)} VND`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A0A05]">
      <ChefNavbar />

      {/* Toast Notice */}
      {toast && (
        <div className="fixed top-20 right-6 z-[30000] bg-[#3A1C14] text-[#FAF7F2] border border-[#D97706]/40 px-5 py-3.5 rounded-2xl shadow-2xl font-bold text-xs animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header ── */}
        <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold font-serif text-[#3A1C14] tracking-tight">
                  Quản Lý Tồn Kho Nguyên Liệu Bếp
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Theo dõi tồn kho thực tế, xuất hủy nguyên liệu hỏng & gửi yêu cầu nhập kho khẩn cho Quản Lý
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchIngredients}
              className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-gray-200 border border-gray-300 rounded-2xl text-xs font-bold text-gray-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm Mới Kho</span>
            </button>
          </div>
        </div>

        {/* ── Summary Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tổng Nguyên Liệu</p>
              <p className="text-3xl font-black font-mono text-[#3A1C14] mt-1">{loading ? '–' : ingredients.length}</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-1">Danh mục trong kho bếp</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'LOW' ? 'ALL' : 'LOW')}
            className={`bg-red-50 p-5 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
              statusFilter === 'LOW' ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div>
              <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Cần Nhập Thêm (Tồn Thấp)</p>
              <p className="text-3xl font-black font-mono text-red-700 mt-1">{loading ? '–' : lowStockCount}</p>
              <p className="text-[10px] text-red-600 font-semibold mt-1">Click để lọc danh sách cần nhập</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'OK' ? 'ALL' : 'OK')}
            className={`bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between cursor-pointer transition-all ${
              statusFilter === 'OK' ? 'ring-2 ring-emerald-500' : ''
            }`}
          >
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Đủ Hàng Cho Chế Biến</p>
              <p className="text-3xl font-black font-mono text-emerald-800 mt-1">{loading ? '–' : okStockCount}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">Click để xem nguyên liệu sẵn sàng</p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── Search & Filter Bar ── */}
        <div className="bg-white border border-[#E8E2D9] p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nguyên liệu, mã code..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-gray-200 rounded-2xl text-xs font-bold text-[#1A0A05] focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-[#3A1C14] text-white shadow-md' : 'bg-[#FAF7F2] text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất Cả ({ingredients.length})
            </button>
            <button
              onClick={() => setStatusFilter('LOW')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'LOW' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Cần Nhập Thêm ({lowStockCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('OK')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'OK' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đủ Hàng ({okStockCount})</span>
            </button>
          </div>
        </div>

        {/* ── Main Ingredients Grid ── */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Đang kiểm tra tồn kho nguyên liệu bếp...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-300 text-center text-gray-400 space-y-2">
            <Package className="w-12 h-12 text-[#D97706] mx-auto opacity-40" />
            <p className="text-sm font-bold text-gray-600">Không tìm thấy nguyên liệu nào khớp với tìm kiếm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((ing) => {
              const stockVal = ing.stockQuantity ?? ing.quantity ?? 0;
              const minStockVal = ing.minStockThreshold ?? ing.minQuantity ?? 5;
              const isLow = stockVal <= minStockVal;

              return (
                <div
                  key={ing.id}
                  className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between space-y-4 ${
                    isLow ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 bg-[#FAF7F2] border border-gray-200 rounded-xl flex items-center justify-center shrink-0 text-amber-700">
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#1A0A05] font-serif leading-tight">{ing.name}</h3>
                          <span className="text-[10px] font-mono text-gray-400">{ing.code || `ING-${ing.id}`}</span>
                        </div>
                      </div>

                      {isLow ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-red-300 shrink-0">
                          <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" /> Sắp Hết
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-emerald-300 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Đủ Hàng
                        </span>
                      )}
                    </div>

                    {/* Stock Details */}
                    <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-gray-200/80 space-y-1.5 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-500">Tồn Kho Hiện Tại:</span>
                        <span className={`text-base font-black font-mono ${isLow ? 'text-red-600' : 'text-[#3A1C14]'}`}>
                          {stockVal} {ing.unit || 'kg'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-400">
                        <span>Định mức tối thiểu:</span>
                        <span className="font-mono font-bold text-gray-600">{minStockVal} {ing.unit || 'kg'}</span>
                      </div>
                      {ing.category && (
                        <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1 border-t border-gray-200">
                          <span>Phân loại kho:</span>
                          <span className="font-bold text-amber-800">{ing.category}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setRequestModal(ing)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Yêu Cầu Nhập Kho</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSpoilageModal(ing)}
                        className="py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Báo Hỏng</span>
                      </button>

                      <button
                        onClick={() => handleOpenDishesModal(ing)}
                        className="py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Utensils className="w-3 h-3 text-gray-500" />
                        <span>Món Dùng</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ MODAL 1: Gửi Yêu Cầu Nhập Kho ══ */}
      {requestModal && (
        <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-400 space-y-5 animate-scale-up relative">
            <button
              onClick={() => setRequestModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 border-b border-gray-100 pb-4">
              <div className="h-14 w-14 bg-amber-50 border border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-700 shadow-inner">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#3A1C14]">Yêu Cầu Nhập Kho Nguyên Liệu</h3>
              <p className="text-xs text-amber-800 font-bold">{requestModal.name} (Tồn: {requestModal.stockQuantity ?? requestModal.quantity ?? 0} {requestModal.unit})</p>
            </div>

            <form onSubmit={handleSendRestockRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-bold uppercase mb-1">Số Lượng Cần Nhập ({requestModal.unit}):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  placeholder="Ví dụ: 10"
                  className="w-full p-3 bg-[#FAF7F2] border border-gray-300 rounded-2xl font-bold font-mono text-sm text-[#1A0A05] focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold uppercase mb-1">Mức Độ Ưu Tiên:</label>
                <select
                  value={requestPriority}
                  onChange={(e) => setRequestPriority(e.target.value)}
                  className="w-full p-3 bg-[#FAF7F2] border border-gray-300 rounded-2xl font-bold text-xs text-[#1A0A05] focus:border-amber-600 focus:outline-none"
                >
                  <option value="HIGH">⚠️ Ưu tiên Cao (Cần cho ca tối)</option>
                  <option value="URGENT">🔥 Khẩn cấp (Sắp hết ngay)</option>
                  <option value="NORMAL">Bình thường</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold uppercase mb-1">Ghi Chú Cho Quản Lý / Admin:</label>
                <textarea
                  rows="3"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Nhập lý do hoặc chi tiết loại nguyên liệu cần nhập..."
                  className="w-full p-3 bg-[#FAF7F2] border border-gray-300 rounded-2xl text-xs text-[#1A0A05] focus:border-amber-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={requestSubmitting}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{requestSubmitting ? 'Đang gửi...' : 'GỬI YÊU CẦU CHO QUẢN LÝ ➔'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL 2: Báo Hỏng / Xuất Hủy Nguyên Liệu ══ */}
      {spoilageModal && (
        <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-400 space-y-5 animate-scale-up relative">
            <button
              onClick={() => setSpoilageModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 border-b border-gray-100 pb-4">
              <div className="h-14 w-14 bg-red-50 border border-red-300 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-inner">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-red-700">Báo Hỏng & Xuất Hủy Kho Bếp</h3>
              <p className="text-xs text-red-600 font-bold">{spoilageModal.name} (Tồn hiện tại: {spoilageModal.stockQuantity ?? spoilageModal.quantity ?? 0} {spoilageModal.unit})</p>
            </div>

            <form onSubmit={handleSpoilageStockOut} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-bold uppercase mb-1">Số Lượng Hỏng / Xuất Hủy ({spoilageModal.unit}):</label>
                <input
                  type="number"
                  step="0.1"
                  max={spoilageModal.stockQuantity ?? spoilageModal.quantity ?? 100}
                  required
                  value={spoilageQty}
                  onChange={(e) => setSpoilageQty(e.target.value)}
                  placeholder="Ví dụ: 0.5"
                  className="w-full p-3 bg-red-50/50 border border-red-200 rounded-2xl font-bold font-mono text-sm text-red-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold uppercase mb-1">Lý Do Xuất Hủy Hỏng:</label>
                <select
                  value={spoilageReason}
                  onChange={(e) => setSpoilageReason(e.target.value)}
                  className="w-full p-3 bg-[#FAF7F2] border border-gray-300 rounded-2xl font-bold text-xs text-[#1A0A05] focus:border-red-600 focus:outline-none"
                >
                  <option value="Hỏng do bảo quản">Hỏng do bảo quản / nhiệt độ</option>
                  <option value="Hết hạn sử dụng">Hết hạn sử dụng</option>
                  <option value="Đốm mốc / biến chất">Đốm mốc / biến chất</option>
                  <option value="Rách bao bì / đổ vỡ">Rách bao bì / đổ vỡ</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={spoilageSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{spoilageSubmitting ? 'Đang trừ kho...' : 'XÁC NHẬN TRỪ KHO HỎNG ➔'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL 3: Danh Sách Món Sử Dụng Nguyên Liệu ══ */}
      {dishesModal && (
        <div className="fixed inset-0 z-[20000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 space-y-5 animate-scale-up relative">
            <button
              onClick={() => setDishesModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 border-b border-gray-100 pb-4">
              <div className="h-14 w-14 bg-amber-50 border border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-700 shadow-inner">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#3A1C14]">Các Món Ăn Sử Dụng Nguyên Liệu</h3>
              <p className="text-xs text-amber-800 font-bold">{dishesModal.ingredient.name}</p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {dishesModal.dishes && dishesModal.dishes.length > 0 ? (
                dishesModal.dishes.map((dish) => (
                  <div key={dish.id} className="p-3 bg-[#FAF7F2] rounded-2xl border border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-[#1A0A05]">{dish.name}</span>
                    <span className="font-mono text-amber-800 font-bold">{formatCurrency(dish.price)}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 italic py-6">Chưa có món ăn nào khai báo nguyên liệu này trong công thức.</p>
              )}
            </div>

            <button
              onClick={() => setDishesModal(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
