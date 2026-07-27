import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import {
  User,
  Phone,
  Utensils,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Receipt,
  ArrowLeft,
  Ticket,
  AlertCircle,
  X,
  ChefHat,
  FileCheck
} from 'lucide-react';

export default function CustomerCheckoutPage() {
  const {
    items,
    voucherCode,
    applyVoucher,
    removeVoucher,
    subtotal,
    discountAmount,
    serviceFee,
    vatAmount,
    grandTotal,
    clearCart,
    selectedTable,
    setSelectedTable
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  
  // Delivery Type: If selectedTable exists -> DINE_IN, otherwise -> TAKEAWAY
  const [deliveryType, setDeliveryType] = useState(() => (selectedTable ? 'DINE_IN' : 'TAKEAWAY'));
  const [notes, setNotes] = useState('');

  const [inputVoucher, setInputVoucher] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modals & Final Invoice States
  const [showReceiptPreviewModal, setShowReceiptPreviewModal] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // Auto-sync logged-in user profile info
  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (selectedTable) {
      setDeliveryType('DINE_IN');
    } else {
      setDeliveryType('TAKEAWAY');
    }
  }, [selectedTable]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  const handleVoucherSubmit = (e) => {
    e.preventDefault();
    if (!inputVoucher.trim()) return;
    applyVoucher(inputVoucher.trim());
    setInputVoucher('');
  };

  const validateCheckoutForm = () => {
    const errors = {};

    if (!customerName.trim()) {
      errors.customerName = 'Vui lòng nhập Họ và tên khách hàng.';
    } else if (customerName.trim().length < 2) {
      errors.customerName = 'Họ và tên phải gồm ít nhất 2 ký tự.';
    }

    const normalizedPhone = customerPhone.replace(/[\s.-]/g, '');
    if (!customerPhone.trim()) {
      errors.customerPhone = 'Vui lòng nhập Số điện thoại liên hệ.';
    } else if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
      errors.customerPhone = 'Số điện thoại không hợp lệ (Phải gồm 10 chữ số đầu 03, 05, 07, 08, 09 hoặc +84).';
    }

    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.customerEmail = 'Định dạng Email không hợp lệ.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 1: Click "Xác Nhận Đặt Món" -> Validate and Open Receipt Preview Modal
  const handleOpenReceiptPreview = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      return setErrorMsg('Giỏ hàng của bạn đang trống.');
    }

    if (!validateCheckoutForm()) {
      return setErrorMsg('Vui lòng kiểm tra các ô thông tin bị báo đỏ bên dưới.');
    }

    // Open Receipt Preview Modal so customer reviews full breakdown & payment QR before final submit!
    setShowReceiptPreviewModal(true);
  };

  // Step 2: Final Confirm from Receipt Preview Modal -> Execute Backend API (Phương án B: chỉ đặt món, thu tiền sau)
  const confirmFinalPayment = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // Tạo đơn hàng - tự động gửi xuống Bếp (Phương án B: không thanh toán trước)
      const orderPayload = {
        items: items.map(i => ({ dishId: i.id, quantity: i.quantity, note: i.note })),
        voucherCode: voucherCode ? voucherCode : null,
        diningTableId: deliveryType === 'DINE_IN' && selectedTable ? selectedTable.id : null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() ? customerEmail.trim() : null,
        notes: notes.trim() ? notes.trim() : null
      };

      const orderRes = await api.post('/api/public/orders', orderPayload);
      if (!orderRes.data || !orderRes.data.success) {
        throw new Error(orderRes.data?.message || 'Tạo đơn đặt món thất bại');
      }

      // Đơn đã được gửi xuống Bếp ngay - không cần thanh toán trước
      setShowReceiptPreviewModal(false);
      clearCart();
      // Redirect đến trang theo dõi tiến độ bếp
      navigate('/orders');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Xảy ra lỗi khi đặt món.');
      setShowReceiptPreviewModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans">
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header Banner */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-[#4A2810]/10 shadow-md">
          <div className="flex items-center gap-3">
            <Link to="/menu" className="p-2 bg-[#FAF7F2] rounded-xl hover:bg-gray-200 text-[#4A2810]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#4A2810]">Xác Nhận Đơn Hàng & Thanh Toán</h1>
              <p className="text-xs text-gray-500">Xem lại hóa đơn biên lai và xác nhận thanh toán trực tiếp.</p>
            </div>
          </div>
        </div>

        {createdInvoice ? (
          /* OFFICIAL E-INVOICE RECEIPT SCREEN (AFTER CONFIRMED PAYMENT) */
          <div id="print-area" className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Đặt Món Thành Công! Đơn Đã Gửi Xuống Bếp!
              </span>
              <h2 className="text-2xl font-bold font-serif text-[#4A2810]">Theo Dõi Tiến Độ Chế Biến</h2>
              <p className="text-xs text-gray-500 mt-1">Bếp Trưởng L'ÉCLAT đã nhận đơn và bắt đầu chuẩn bị món ăn. Thu ngân sẽ thu tiền sau khi bạn dùng xong.</p>
            </div>

            {/* Official Invoice Receipt Card */}
            <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-emerald-200 text-left space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-gray-200 pb-2 font-sans font-bold text-sm">
                <span>Khách hàng:</span>
                <span className="text-[#8C3A27]">{createdInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Số điện thoại:</span>
                <span>{createdInvoice.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Hình thức phục vụ:</span>
                <span className="font-bold text-[#8C3A27]">
                  {selectedTable ? `Ăn tại ${selectedTable.tableName}` : 'Mua mang về'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <span className="font-bold text-emerald-700">{createdInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian lập hóa đơn:</span>
                <span>{new Date(createdInvoice.issuedAt).toLocaleString('vi-VN')}</span>
              </div>

              {/* Items List in Invoice */}
              <div className="border-t border-b border-gray-200 py-3 space-y-2 font-sans">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Chi tiết món ăn:</div>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs font-mono">
                    <span>{item.name} (x{item.quantity})</span>
                    <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 font-sans pt-1">
                <div className="flex justify-between text-xs">
                  <span>Tạm tính:</span>
                  <span className="font-mono">{formatCurrency(createdInvoice.subtotal)}</span>
                </div>
                {createdInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Chiết khấu Voucher:</span>
                    <span className="font-mono">-{formatCurrency(createdInvoice.discountAmount)}</span>
                  </div>
                )}
                {createdInvoice.vatAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Thuế VAT (8%):</span>
                    <span className="font-mono">+{formatCurrency(createdInvoice.vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#4A2810] pt-2 border-t border-gray-200">
                  <span>Tổng tiền đã thanh toán:</span>
                  <span className="font-mono text-[#8C3A27] text-lg">{formatCurrency(createdInvoice.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="flex justify-center pt-2">
              <Link
                to="/orders"
                className="flex-1 bg-[#8C3A27] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ChefHat className="w-4 h-4 text-[#E07A5F]" />
                <span>Theo Dõi Bếp Chế Biến</span>
              </Link>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM SCREEN */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Customer Info & Payment Selector Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2810]/10 shadow-xl space-y-6">
              
              <h3 className="text-lg font-bold font-serif text-[#4A2810] border-b border-gray-100 pb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E07A5F]" />
                <span>Thông Tin Đặt Món & Liên Hệ</span>
              </h3>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleOpenReceiptPreview} noValidate className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A..."
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.customerName) setFieldErrors(prev => ({ ...prev, customerName: null }));
                      }}
                      className={`form-input text-xs py-2.5 transition-all ${
                        fieldErrors.customerName ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.customerName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      placeholder="0901234567..."
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (fieldErrors.customerPhone) setFieldErrors(prev => ({ ...prev, customerPhone: null }));
                      }}
                      className={`form-input text-xs py-2.5 font-mono transition-all ${
                        fieldErrors.customerPhone ? 'border-red-500 bg-red-50 focus:border-red-600 ring-2 ring-red-500/20' : ''
                      }`}
                    />
                    {fieldErrors.customerPhone && (
                      <span className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        {fieldErrors.customerPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email nhận Hóa đơn Invoice</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input text-xs py-2.5 font-mono"
                  />
                </div>

                {/* Delivery Option */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hình thức phục vụ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DINE_IN')}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        deliveryType === 'DINE_IN'
                          ? 'bg-[#8C3A27] text-white border-[#8C3A27] shadow-sm'
                          : 'bg-[#FAF7F2] text-[#4A2810] border-gray-200'
                      }`}
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Phục Vụ Tại Bàn {selectedTable ? `(${selectedTable.tableName})` : ''}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryType('TAKEAWAY');
                        setSelectedTable(null);
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        deliveryType === 'TAKEAWAY'
                          ? 'bg-[#8C3A27] text-white border-[#8C3A27] shadow-sm'
                          : 'bg-[#FAF7F2] text-[#4A2810] border-gray-200'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Mua Mang Về</span>
                    </button>
                  </div>
                </div>

                {/* Thông báo Phương án B: Thu tiền sau khi ăn xong */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-2xl shrink-0">💳</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800 mb-1">Thanh Toán Sau Khi Dùng Xong</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Đơn của bạn sẽ được gửi xuống Bếp ngay lập tức. Thu ngân sẽ lập hóa đơn và thu tiền 
                      (Tiền mặt / QR / Thẻ) sau khi quý khách dùng bữa xong.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ghi chú cho Bếp / Phục vụ</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Ít cay, nhiều phô mai, xin thêm sốt..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-2"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#8C3A27] text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-[#A3432D] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-4 h-4 text-[#E07A5F]" />
                    <span>Xem Lại Đơn & Gửi Bếp</span>
                  </button>
                </div>

              </form>

            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2810]/10 shadow-xl space-y-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#4A2810] border-b border-gray-100 pb-3 flex items-center justify-between">
                  <span>Tóm Tắt Đơn Món ({items.length})</span>
                  <Receipt className="w-5 h-5 text-[#E07A5F]" />
                </h3>

                {/* Items List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-gray-200 text-xs">
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-bold text-[#4A2810] line-clamp-1">{item.name}</h5>
                        <div className="text-gray-500 font-mono mt-0.5">
                          {item.quantity} x {formatCurrency(item.price)}
                        </div>
                        {item.note && <p className="text-[10px] text-gray-400 italic">"Ghi chú: {item.note}"</p>}
                      </div>
                      <span className="font-mono font-bold text-[#8C3A27] text-xs">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-4 border-t border-gray-200 space-y-2 text-xs font-mono text-gray-600">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Giảm giá Voucher:</span>
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

                  <div className="flex justify-between text-[#4A2810] font-sans font-bold text-sm pt-2 border-t border-gray-200">
                    <span>Tổng thanh toán:</span>
                    <span className="text-[#8C3A27] font-mono text-base">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* MODAL Xem Trước Đơn Món - Phương án B: Chỉ xác nhận đơn, không thanh toán trước */}
      {showReceiptPreviewModal && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-[#4A2810]/20 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-[#8C3A27]" />
                <h3 className="text-lg font-bold font-serif text-[#4A2810]">Xác Nhận Đơn Món</h3>
              </div>
              <button
                onClick={() => setShowReceiptPreviewModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-4">
              
              {/* Receipt Summary Breakdown */}
              <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#4A2810]/15 space-y-4 text-xs font-mono">
                <div className="text-center font-serif text-sm font-bold text-[#4A2810] border-b border-gray-200 pb-2">
                  L'ÉCLAT FINE DINING RESTAURANT
                  <span className="block text-[10px] font-sans font-normal text-gray-500">Hóa Đơn Biên Lai Đặt Món</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Khách hàng:</span>
                    <span className="font-bold text-[#4A2810]">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span>{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phục vụ:</span>
                    <span className="font-bold text-[#8C3A27]">
                      {deliveryType === 'DINE_IN' && selectedTable ? `Tại ${selectedTable.tableName}` : 'Mua mang về'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thanh toán:</span>
                    <span className="font-bold text-amber-700">💳 Thu ngân thu tiền sau khi dùng xong</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between text-gray-500 italic">
                      <span>Ghi chú:</span>
                      <span>"{notes}"</span>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="border-t border-b border-gray-200 py-3 space-y-2 font-sans">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Món đã chọn:</div>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs font-mono">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Financial Totals */}
                <div className="space-y-1 font-sans">
                  <div className="flex justify-between text-xs">
                    <span>Tạm tính:</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-700">
                      <span>Giảm giá Voucher:</span>
                      <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {vatAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Thuế VAT (8%):</span>
                      <span className="font-mono">+{formatCurrency(vatAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-[#4A2810] pt-2 border-t border-gray-200">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="font-mono text-[#8C3A27] text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

                {/* Thông báo Phương án B */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                  <span className="text-2xl shrink-0">🔥</span>
                  <div>
                    <p className="font-bold text-amber-800 mb-0.5">Đơn Sẽ Gửi Xuống Bếp Ngay Lập Tức!</p>
                    <p className="text-amber-700 leading-relaxed">
                      Sau khi xác nhận, Bếp Trưởng sẽ nhận đơn và bắt đầu chế biến. 
                      Thu ngân sẽ lập hóa đơn và thu tiền (Tiền mặt / QR / Thẻ) 
                      sau khi quý khách dùng bữa xong.
                    </p>
                  </div>
                </div>

            </div>

            {/* Modal Buttons (Fixed at bottom) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowReceiptPreviewModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all cursor-pointer"
              >
                Chỉnh Sửa Đơn Món
              </button>

              <button
                type="button"
                onClick={confirmFinalPayment}
                disabled={loading}
                className="flex-1 bg-[#8C3A27] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ChefHat className="w-4 h-4 text-[#E07A5F]" />
                <span>{loading ? 'Đang Gửi Bếp...' : 'Xác Nhận & Gửi Bếp'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <CustomerFooter />
    </div>
  );
}
