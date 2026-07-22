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
  Mail,
  Utensils,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  CheckCircle2,
  MapPin,
  Receipt,
  ArrowLeft,
  Ticket,
  AlertCircle
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
  const [paymentMethod, setPaymentMethod] = useState('QR_BANKING'); // CASH, QR_BANKING, CARD

  const [inputVoucher, setInputVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState(null);

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

  const handleCheckoutAndPay = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      return setErrorMsg('Giỏ hàng của bạn đang trống.');
    }

    if (!customerName.trim()) return setErrorMsg('Vui lòng nhập họ và tên khách hàng.');
    const normalizedPhone = customerPhone.replace(/[\s.-]/g, '');
    if (!normalizedPhone || !/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(normalizedPhone)) {
      return setErrorMsg('Số điện thoại không hợp lệ (Phải gồm 10 chữ số đầu 03, 05, 07, 08, 09 hoặc +84).');
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      return setErrorMsg('Email không hợp lệ.');
    }

    setLoading(true);
    try {
      // 1. Create Order (Status PENDING)
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
        throw new Error(orderRes.data?.message || 'Không thể khởi tạo đơn hàng.');
      }

      const createdOrder = orderRes.data.data;

      // 2. Process Payment & Generate Invoice
      const payPayload = {
        orderId: createdOrder.id,
        paymentMethod,
        voucherCode: voucherCode ? voucherCode : null,
        notes: notes.trim() ? notes.trim() : null
      };

      const payRes = await api.post('/api/public/payments/process', payPayload);
      if (payRes.data && payRes.data.success) {
        setCreatedInvoice(payRes.data.data);
        clearCart();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Quick VietQR generator URL
  const qrUrl = `https://img.vietqr.io/image/970422-0901234567-compact2.png?amount=${Math.round(grandTotal)}&addInfo=LECLAT%20THANH%20TOAN&accountName=NHA%20HANG%20LECLAT`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans">
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            L'ÉCLAT Fine Dining Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#4A2810]">
            Xác Nhận Đơn Hàng & Thanh Toán
          </h1>
          <div className="h-1 w-16 bg-[#8C3A27] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Invoice Success Screen */}
        {createdInvoice ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-emerald-300 shadow-2xl animate-fade-in text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-serif text-[#4A2810]">Thanh Toán Đơn Hàng Thành Công!</h2>
              <p className="text-xs text-gray-500">Mã hóa đơn: <strong className="font-mono text-[#8C3A27]">{createdInvoice.invoiceNumber}</strong></p>
              <p className="text-xs text-emerald-700 font-semibold">Đơn hàng của bạn đã được tiếp nhận và chuyển tới bộ phận Bếp chế biến.</p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#4A2810]/10 text-left text-xs font-mono space-y-2 max-w-md mx-auto">
              <div className="flex justify-between"><span>Khách hàng:</span> <b>{createdInvoice.customerName}</b></div>
              <div className="flex justify-between"><span>Số điện thoại:</span> <b>{createdInvoice.customerPhone}</b></div>
              <div className="flex justify-between"><span>Phương thức:</span> <b>{createdInvoice.paymentMethod}</b></div>
              <div className="flex justify-between"><span>Thời gian:</span> <b>{new Date(createdInvoice.issuedAt).toLocaleString('vi-VN')}</b></div>
              <div className="flex justify-between pt-2 border-t border-gray-300 font-bold text-sm text-[#8C3A27]">
                <span>Tổng Thanh Toán:</span>
                <span>{formatCurrency(createdInvoice.grandTotal)}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/customer/orders"
                className="bg-[#8C3A27] text-white px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Xem Tiến Trình Đơn Hàng</span>
              </Link>
              <Link
                to="/menu"
                className="bg-[#FAF7F2] border border-[#4A2810]/20 text-[#4A2810] px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Về Thực Đơn</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Customer Info & Payment Selector Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2810]/10 shadow-xl space-y-6">
              
              <h3 className="text-lg font-bold font-serif text-[#4A2810] border-b border-gray-100 pb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#E07A5F]" />
                <span>Thông Tin Đặt Món</span>
              </h3>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCheckoutAndPay} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="form-input text-xs py-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Điện Thoại *</label>
                    <input
                      type="tel"
                      placeholder="0901234567..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="form-input text-xs py-2.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email nhận Hóa đơn Invoice</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input text-xs py-2.5"
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
                      <span>Phục Vụ Tại Bàn</span>
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
                      <span>Mang Về</span>
                    </button>
                  </div>

                  {deliveryType === 'DINE_IN' && selectedTable && (
                    <div className="mt-2.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Vị trí bàn ăn: <strong>{selectedTable.tableName}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTable(null)}
                        className="text-[10px] text-red-600 underline font-bold"
                      >
                        (Bỏ chọn)
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ghi chú cho Bếp / Phục vụ</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú tổng thể đơn hàng..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                {/* Payment Methods */}
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-[#4A2810] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#E07A5F]" />
                    <span>Chọn Phương Thức Thanh Toán *</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QR_BANKING')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                        paymentMethod === 'QR_BANKING'
                          ? 'bg-[#FAF7F2] border-[#8C3A27] text-[#8C3A27] ring-2 ring-[#8C3A27]/20 font-bold'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-[#8C3A27] shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Chuyển Khoản QR</div>
                        <div className="text-[10px] text-gray-400">Quét mã VietQR tự động</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                        paymentMethod === 'CASH'
                          ? 'bg-[#FAF7F2] border-[#8C3A27] text-[#8C3A27] ring-2 ring-[#8C3A27]/20 font-bold'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-[#8C3A27] shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Tiền Mặt</div>
                        <div className="text-[10px] text-gray-400">Thanh toán tại bàn</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                        paymentMethod === 'CARD'
                          ? 'bg-[#FAF7F2] border-[#8C3A27] text-[#8C3A27] ring-2 ring-[#8C3A27]/20 font-bold'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-[#8C3A27] shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Thẻ Ngân Hàng / VISA</div>
                        <div className="text-[10px] text-gray-400">Quẹt thẻ ATM / Quốc tế</div>
                      </div>
                    </button>

                  </div>

                  {/* QR Banking Code Preview */}
                  {paymentMethod === 'QR_BANKING' && (
                    <div className="mt-4 p-4 bg-[#FAF7F2] rounded-2xl border border-[#4A2810]/10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
                      <img src={qrUrl} alt="VietQR Code" className="h-32 w-32 rounded-xl object-contain bg-white p-2 border border-gray-200" />
                      <div className="text-xs space-y-1 text-gray-600">
                        <span className="font-bold text-[#4A2810] block">Mã QR VietQR Tự Động:</span>
                        <div>Ngân hàng: MBBank (Nội địa)</div>
                        <div>STK: <b>0901234567</b></div>
                        <div>Số tiền: <b className="text-[#8C3A27] font-mono">{formatCurrency(grandTotal)}</b></div>
                        <div className="text-[10px] text-emerald-700 italic font-semibold">Tự động đối soát và kích hoạt đơn hàng sau khi quét.</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#8C3A27] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-[#A3432D] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{loading ? 'Đang Xử Lý Thanh Toán...' : 'Xác Nhận Đặt Món & Thanh Toán'}</span>
                  </button>
                </div>

              </form>

            </div>

            {/* Right: Cart Summary Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#4A2810]/10 shadow-xl space-y-4">
              
              <h3 className="text-base font-bold font-serif text-[#4A2810] border-b border-gray-100 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#E07A5F]" /> Tóm Tắt Đơn Hàng
                </span>
                <span className="text-xs font-normal text-gray-400 font-mono">({items.length} món)</span>
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center text-xs pb-3 border-b border-gray-100">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover shrink-0 bg-gray-100" />
                    <div className="flex-1">
                      <h5 className="font-bold text-[#4A2810] line-clamp-1">{item.name}</h5>
                      <span className="text-gray-400 font-mono">x{item.quantity}</span>
                      {item.note && <p className="text-[10px] text-gray-400 italic">"Ghi chú: {item.note}"</p>}
                    </div>
                    <span className="font-bold font-mono text-[#8C3A27]">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Voucher Apply Form */}
              <div className="pt-2">
                {voucherCode ? (
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                    <span className="font-bold text-emerald-800 font-mono flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-emerald-600" /> Mã {voucherCode} (-{formatCurrency(discountAmount)})
                    </span>
                    <button onClick={removeVoucher} className="text-xs text-red-600 font-bold hover:underline cursor-pointer">Xóa</button>
                  </div>
                ) : (
                  <form onSubmit={handleVoucherSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mã voucher..."
                      value={inputVoucher}
                      onChange={(e) => setInputVoucher(e.target.value)}
                      className="form-input text-xs py-1.5 uppercase font-mono"
                    />
                    <button type="submit" className="bg-[#4A2810] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer">
                      Áp Dụng
                    </button>
                  </form>
                )}
              </div>

              {/* Summary Calculations */}
              <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
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

                <div className="flex justify-between pt-3 border-t border-gray-300 font-bold text-sm text-[#4A2810]">
                  <span>Tổng Thanh Toán:</span>
                  <span className="font-mono text-xl text-[#8C3A27]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <CustomerFooter />
    </div>
  );
}
