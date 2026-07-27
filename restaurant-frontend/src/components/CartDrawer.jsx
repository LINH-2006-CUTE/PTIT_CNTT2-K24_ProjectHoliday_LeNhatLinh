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
  CheckCircle2,
  Receipt,
  Clock,
  Flame,
  ChevronRight
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

  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const fetchActiveOrders = async () => {
    try {
      const res = await api.get('/api/public/orders/history');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const active = res.data.data.filter(
          o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
        );
        setActiveOrdersCount(active.length);
      } else {
        setActiveOrdersCount(0);
      }
    } catch (err) {
      setActiveOrdersCount(0);
    }
  };

  useEffect(() => {
    if (isCartOpen) {
      fetchActiveOrders();
    }
  }, [isCartOpen]);

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
    setShowConfirmModeModal(false);
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
    setIsCartOpen(false);
    navigate('/checkout');
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
    setSelectedTable(null); // Clear table for Takeaway
    setShowConfirmModeModal(false);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleApplyVoucherSubmit = async (e) => {
    e.preventDefault();
    setVoucherError('');
    if (!inputVoucher.trim()) return;

    const res = await applyVoucher(inputVoucher.trim());
    if (!res.success) {
      setVoucherError(res.message);
    } else {
      setInputVoucher('');
    }
  };

  const formatCurrency = (val) => {
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val || 0)} VND`;
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="bg-[#3A1C14] text-[#FAF7F2]">
            <div className="p-5 flex justify-between items-center border-b border-[#D97706]/30">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-bold font-serif text-base tracking-wide">Giỏ Hàng Thưởng Thức</h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct Link to Order History */}
                <Link
                  to="/orders"
                  onClick={() => setIsCartOpen(false)}
                  className="px-3 py-1 bg-[#7A2E1E] border border-[#D97706]/40 hover:bg-[#D97706] hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Xem lịch sử đơn hàng & tiến độ Bếp"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Lịch Sử Đơn</span>
                </Link>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-[#FAF7F2]/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Order Tracking Shortcut Banner (ONLY SHOWN WHEN CUSTOMER HAS ACTIVE ORDERS) */}
            {activeOrdersCount > 0 && (
              <Link
                to="/orders"
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2.5 bg-[#8C3A27] hover:bg-[#A3432D] border-b border-[#E07A5F]/30 flex justify-between items-center text-xs font-bold text-white transition-all cursor-pointer shadow-inner animate-fade-in"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Đang Chế Biến ({activeOrdersCount} đơn) - Theo Dõi Tiến Độ Bếp Real-Time</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </Link>
            )}

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
              <div className="py-16 text-center text-xs text-gray-400 font-semibold space-y-4">
                <UtensilsCrossed className="w-12 h-12 text-[#E07A5F]/50 mx-auto" />
                <p className="text-sm font-bold text-[#4A2810]">Giỏ hàng của bạn đang trống.</p>
                
                <div className="flex flex-col gap-2.5 items-center justify-center pt-2">
                  <Link
                    to="/menu"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-block bg-[#8C3A27] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all shadow-md cursor-pointer w-full sm:w-auto"
                  >
                    Khám phá Thực đơn
                  </Link>

                  {/* Prominent Order History Button when Cart is Empty */}
                  <Link
                    to="/orders"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center justify-center gap-2 bg-amber-50 border border-amber-300 text-[#8C3A27] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
                  >
                    <Receipt className="w-4 h-4 text-[#D97706]" />
                    <span>Lịch Sử Đặt Món & Tiến Độ Bếp</span>
                  </Link>
                </div>
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
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>Mã: <strong>{voucherCode}</strong></span>
                      <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-mono">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                    <button
                      onClick={removeVoucher}
                      className="text-gray-400 hover:text-red-600 text-xs font-bold cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyVoucherSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Nhập mã ưu đãi (Ví dụ: HELLO2026)..."
                        value={inputVoucher}
                        onChange={(e) => setInputVoucher(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#E07A5F]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#4A2810] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#8C3A27] transition-all cursor-pointer shrink-0"
                    >
                      Áp Dụng
                    </button>
                  </form>
                )}
                {voucherError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {voucherError}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 border-t border-[#4A2810]/10 pt-3 font-mono">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-[#4A2810]">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Chiết khấu mã giảm giá:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {serviceFee > 0 && (
                  <div className="flex justify-between">
                    <span>Phí phục vụ (5%):</span>
                    <span>+{formatCurrency(serviceFee)}</span>
                  </div>
                )}

                {vatAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Thuế VAT (8%):</span>
                    <span>+{formatCurrency(vatAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold font-sans text-[#4A2810] pt-2 border-t border-gray-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-[#8C3A27] font-mono text-base">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full bg-[#8C3A27] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A3432D] transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-98"
              >
                <CreditCard className="w-4 h-4 text-[#E07A5F] group-hover:scale-110 transition-transform" />
                <span>Thanh Toán Đặt Món</span>
              </button>

            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: SELECT TABLE DIALOG */}
      {showTableModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#4A2810]/10 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="text-base font-bold font-serif text-[#4A2810] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#8C3A27]" /> Chọn Bàn Thưởng Thức
              </h4>
              <button onClick={() => setShowTableModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Vui lòng chọn vị trí bàn bạn đang ngồi để nhân viên nhà hàng phục vụ món ăn tận nơi.
            </p>

            <form onSubmit={handleConfirmTableSelection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A2810] uppercase tracking-wider mb-1">
                  Danh Sách Bàn Ăn *
                </label>
                <select
                  value={chosenTableId}
                  onChange={(e) => setChosenTableId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl p-3 text-xs font-bold text-[#4A2810] focus:outline-none focus:border-[#8C3A27]"
                  required
                >
                  <option value="">-- Chọn vị trí bàn ăn --</option>
                  {tablesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Bỏ Qua
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8C3A27] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-md transition-all cursor-pointer"
                >
                  Xác Nhận Chọn Bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SERVICE MODE CONFIRMATION (Dine-in vs Takeaway Choice) */}
      {showConfirmModeModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#4A2810]/10 space-y-6 text-center animate-scale-up">
            <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-[#8C3A27] border border-amber-200">
              <Utensils className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold font-serif text-[#4A2810]">Bạn Muốn Phục Vụ Nào?</h4>
              <p className="text-xs text-gray-500 mt-1">
                Hệ thống nhận thấy bạn chưa chọn bàn. Bạn ăn tại bàn hay muốn mang về?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleOpenTableSelection}
                className="w-full bg-[#8C3A27] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#A3432D] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4 text-[#E07A5F]" />
                <span>Chọn Bàn Ăn Tại Quán</span>
              </button>

              <button
                onClick={handleConfirmTakeawayAndPay}
                className="w-full bg-[#FAF7F2] border border-[#4A2810]/20 text-[#4A2810] py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#8C3A27]" />
                <span>Mua Mang Về (Không Chọn Bàn)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
