import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShoppingBag,
  UtensilsCrossed,
  Trash2,
  X,
  Ticket,
  CreditCard,
  Plus,
  Minus,
  Tag,
  MapPin,
  AlertCircle,
  Utensils,
  CheckCircle2
} from 'lucide-react';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    updateNote,
    voucherCode,
    applyVoucher,
    removeVoucher,
    subtotal,
    discountAmount,
    serviceFee,
    vatAmount,
    grandTotal,
    isCartOpen,
    setIsCartOpen,
    selectedTable,
    setSelectedTable
  } = useCart();

  const [inputVoucher, setInputVoucher] = useState('');
  const [voucherError, setVoucherError] = useState('');

  // Table Selection & Service Mode Dialog States
  const [showTableModal, setShowTableModal] = useState(false);
  const [showConfirmModeModal, setShowConfirmModeModal] = useState(false);
  const [tablesList, setTablesList] = useState([]);
  const [chosenTableId, setChosenTableId] = useState('');

  const fetchTables = async () => {
    try {
      const res = await api.get('/api/public/menu/tables');
      if (res.data && res.data.success) {
        setTablesList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setTablesList([
        { id: 1, tableName: 'Bàn 01 (Tầng 1 - Sảnh Chính)' },
        { id: 2, tableName: 'Bàn 02 (Tầng 1 - Sảnh Chính)' },
        { id: 3, tableName: 'Bàn 03 (Tầng 1 - VIP)' },
        { id: 4, tableName: 'Bàn 04 (Tầng 2 - Cửa Sổ)' },
        { id: 5, tableName: 'Bàn 05 (Tầng 2 - Ban Công)' }
      ]);
    }
  };

  const handleOpenTableSelection = () => {
    fetchTables();
    setShowTableModal(true);
  };

  const handleConfirmTableSelection = (e) => {
    e.preventDefault();
    if (!chosenTableId) return;

    const found = tablesList.find(t => t.id === Number(chosenTableId));
    const tableObj = found
      ? { id: found.id, tableName: found.tableName }
      : { id: Number(chosenTableId), tableName: `Bàn ${chosenTableId}` };

    setSelectedTable(tableObj);
    setShowTableModal(false);
    setShowConfirmModeModal(false);
  };

  const handleCheckoutClick = () => {
    if (selectedTable) {
      // Table is selected -> Proceed normally to checkout
      setIsCartOpen(false);
      navigate('/checkout');
    } else {
      // Table is NOT selected -> Show Service Mode Confirmation Modal (Takeaway vs Dining in)
      fetchTables();
      setShowConfirmModeModal(true);
    }
  };

  const handleConfirmTakeawayAndPay = () => {
    setSelectedTable(null);
    setShowConfirmModeModal(false);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  const handleApplyVoucherSubmit = (e) => {
    e.preventDefault();
    setVoucherError('');
    if (!inputVoucher.trim()) return setVoucherError('Vui lòng nhập mã voucher.');
    applyVoucher(inputVoucher.trim());
    setInputVoucher('');
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-[#E07A5F]/30 shadow-2xl h-full flex flex-col justify-between z-[10000] animate-slide-left">
          
        {/* Header */}
        <div>
          <div className="p-6 bg-[#4A2810] text-[#FAF7F2] flex items-center justify-between border-b border-[#E07A5F]/20">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#E07A5F]" />
              <h3 className="font-serif font-bold text-lg text-white">Giỏ Hàng Thưởng Thức</h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table Location Status Banner */}
          {selectedTable ? (
            <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ăn tại bàn: <strong>{selectedTable.tableName}</strong></span>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-[10px] text-red-600 underline font-semibold hover:text-red-800 cursor-pointer"
              >
                (Đổi bàn)
              </button>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 font-semibold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Chưa chọn bàn (Hệ thống sẽ gợi ý chọn bàn)</span>
              </div>
              <button
                onClick={handleOpenTableSelection}
                className="text-[10px] bg-[#8C3A27] text-white px-3 py-1 rounded-lg font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all cursor-pointer shrink-0 shadow-xs"
              >
                Chọn Bàn
              </button>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-400 font-semibold space-y-4">
              <UtensilsCrossed className="w-12 h-12 text-[#E07A5F]/50 mx-auto" />
              <p className="text-sm font-bold text-[#4A2810]">Giỏ hàng của bạn đang trống.</p>
              <Link
                to="/menu"
                onClick={() => setIsCartOpen(false)}
                className="inline-block bg-[#8C3A27] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all shadow-md cursor-pointer"
              >
                Khám phá Thực đơn
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#4A2810]/10 flex gap-3 relative hover:border-[#E07A5F]/30 transition-all"
              >
                <img
                  src={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80"}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover shrink-0 bg-[#4A2810]/5 border border-gray-200"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-[#4A2810] font-serif line-clamp-1">{item.name}</h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer ml-1"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Ghi chú (Ví dụ: Ít cay, Không hành)..."
                    value={item.note || ''}
                    onChange={(e) => updateNote(item.id, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#E07A5F] my-1"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold font-mono text-xs text-[#8C3A27]">
                      {formatCurrency(item.price)}
                    </span>

                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-500 hover:text-[#8C3A27] font-bold text-xs cursor-pointer px-1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-[#4A2810] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-500 hover:text-[#8C3A27] font-bold text-xs cursor-pointer px-1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Financial Summary */}
        {items.length > 0 && (
          <div className="p-6 bg-[#FAF7F2] border-t border-[#4A2810]/10 space-y-4">
            
            {/* Voucher Applied / Input */}
            <div>
              {voucherCode ? (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold font-mono">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    <span>MÃ: {voucherCode}</span>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-red-600 hover:underline font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucherSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nhập mã voucher..."
                      value={inputVoucher}
                      onChange={(e) => setInputVoucher(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl py-1.5 pl-8 pr-3 text-xs uppercase font-mono focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#4A2810] text-white px-4 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 hover:bg-[#3B1F0B] transition-all cursor-pointer"
                  >
                    Áp Dụng
                  </button>
                </form>
              )}
              {voucherError && <span className="text-[10px] text-red-600 font-medium block mt-1">{voucherError}</span>}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Tổng tiền món:</span>
                <span className="font-mono text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Giảm giá Voucher:</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí phục vụ (5%):</span>
                <span className="font-mono text-gray-900">{formatCurrency(serviceFee)}</span>
              </div>

              <div className="flex justify-between">
                <span>Thuế VAT (8%):</span>
                <span className="font-mono text-gray-900">{formatCurrency(vatAmount)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-sm text-[#4A2810]">
                <span>Tổng thanh toán:</span>
                <span className="font-mono text-lg text-[#8C3A27]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#8C3A27] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A3432D] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E07A5F]/30 active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>
                {selectedTable ? `Xác Nhận Đặt Món Cho ${selectedTable.tableName}` : 'Xác Nhận Đặt Món & Thanh Toán'}
              </span>
            </button>

          </div>
        )}

      </div>

      {/* TABLE SELECTION MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl p-6 animate-fade-in space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#4A2810] font-serif flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E07A5F]" /> Chọn Vị Trí Bàn Ăn
              </h3>
              <button onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Vui lòng chọn số bàn bạn đang ngồi tại nhà hàng để phục vụ & bếp chuyển đúng món ăn tới bàn của bạn.
            </p>

            <form onSubmit={handleConfirmTableSelection} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Danh sách bàn ăn *</label>
                <select
                  value={chosenTableId}
                  onChange={(e) => setChosenTableId(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs font-bold border border-gray-300 bg-[#FAF7F2] focus:outline-none focus:border-[#8C3A27] cursor-pointer"
                  required
                >
                  <option value="">-- Chọn số bàn đang ngồi --</option>
                  {tablesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableName || `Bàn ${t.tableNumber || t.id}`} ({t.area || 'Sảnh Chính'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#8C3A27] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Xác Nhận Chọn Bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODE CONFIRMATION MODAL (Takeaway vs Dining in) */}
      {showConfirmModeModal && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl p-6 animate-fade-in space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#4A2810] font-serif flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#E07A5F]" /> Xác Nhận Hình Thức Phục Vụ
              </h3>
              <button onClick={() => setShowConfirmModeModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed text-center font-medium">
              Bạn chưa chọn vị trí bàn. Vui lòng xác nhận hình thức bạn muốn thưởng thức món ăn:
            </p>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {/* Option A: Takeaway */}
              <button
                onClick={handleConfirmTakeawayAndPay}
                className="p-4 rounded-2xl border-2 border-[#8C3A27] bg-[#FAF7F2] hover:bg-[#8C3A27] hover:text-white transition-all text-left flex items-center gap-4 cursor-pointer group shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-[#8C3A27] text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#8C3A27]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm font-serif">1. Mua Mang Về (Takeaway)</h4>
                  <p className="text-[11px] opacity-80 mt-0.5">Xác nhận mang về & chuyển sang màn hình Thanh Toán Ngay.</p>
                </div>
              </button>

              {/* Option B: Dine In Table Selection */}
              <button
                onClick={() => {
                  setShowConfirmModeModal(false);
                  setShowTableModal(true);
                }}
                className="p-4 rounded-2xl border border-gray-300 hover:border-[#8C3A27] bg-white transition-all text-left flex items-center gap-4 cursor-pointer group shadow-xs"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#4A2810] font-serif">2. Ăn Tại Bàn (Dine-in)</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Chọn vị trí bàn đang ngồi tại nhà hàng để đầu bếp phục vụ tại bàn.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
