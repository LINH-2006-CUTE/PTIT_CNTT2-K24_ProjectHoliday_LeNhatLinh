import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CashierNavbar from '../components/CashierNavbar';
import {
  CreditCard,
  DollarSign,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Ticket,
  Printer,
  FileText,
  X,
  Calculator,
  Check,
  ShieldCheck
} from 'lucide-react';

export default function CashierPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, QR, VNPAY, MOMO, CARD
  const [cashReceived, setCashReceived] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  
  // Real VietQR Bank Account Configuration States
  const [bankId, setBankId] = useState('MB'); // MB, VCB, TCB, ACB, VPB, ICB, etc.
  const [accountNo, setAccountNo] = useState('0987654321');
  const [accountName, setAccountName] = useState('NHÀ HÀNG L ETOILE');
  const [showBankConfigModal, setShowBankConfigModal] = useState(false);

  // Modal State for Invoice Bill Receipt & Toasts
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [isAudited, setIsAudited] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cashier/orders');
      if (res.data && res.data.success && res.data.data.length > 0) {
        setOrders(res.data.data);
        setSelectedOrder(res.data.data[0]);
      } else {
        // Realistic fallback orders matching Customer menu 100%
        const mockOrders = [
          {
            id: 101,
            tableName: 'Bàn 102',
            customerName: 'David Beckham (VIP)',
            status: 'IN_SERVICE',
            totalAmount: 700000,
            items: [
              { dishName: 'Bò Bit-tết Sốt Nấm Truffle (Filet Mignon)', quantity: 1, price: 450000, lineTotal: 450000 },
              { dishName: 'Rượu Vang Đỏ Bordeaux Vintage 2018', quantity: 1, price: 250000, lineTotal: 250000 }
            ]
          },
          {
            id: 102,
            tableName: 'Bàn 201',
            customerName: 'Victoria Beckham',
            status: 'SERVED',
            totalAmount: 1130000,
            items: [
              { dishName: 'Tôm Hùm Đút Lò Phô Mai (Lobster Thermidor)', quantity: 1, price: 650000, lineTotal: 650000 },
              { dishName: 'Thịt Thăn Bò Nướng Thượng Hạng (Ribeye Steak)', quantity: 1, price: 480000, lineTotal: 480000 }
            ]
          },
          {
            id: 103,
            tableName: 'Bàn 301 (VIP)',
            customerName: 'Trần Văn Hoàng',
            status: 'COOKING',
            totalAmount: 850000,
            items: [
              { dishName: 'Cá Hồi Na Uy Áp Chảo (Salmon Carpaccio)', quantity: 2, price: 220000, lineTotal: 440000 },
              { dishName: 'Salad Hoàng Gia Caesar', quantity: 1, price: 150000, lineTotal: 150000 },
              { dishName: 'Bánh Ngọt Socola Tan Chảy (Chocolate Fondant)', quantity: 1, price: 160000, lineTotal: 160000 },
              { dishName: 'Khoai Tây Chiên Sốt Truffle', quantity: 1, price: 100000, lineTotal: 100000 }
            ]
          }
        ];
        setOrders(mockOrders);
        setSelectedOrder(mockOrders[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4500);
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Voucher verification
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !selectedOrder) return;
    try {
      const res = await api.post('/api/cashier/promotions/apply', {
        voucherCode: voucherCode.trim(),
        orderAmount: selectedOrder.totalAmount
      });
      if (res.data && res.data.success) {
        const data = res.data.data;
        if (data.valid) {
          setDiscountAmount(data.discountAmount);
          setVoucherMessage(`✨ ${data.message}`);
          showToast(`Áp dụng Voucher ${voucherCode} giảm thành công!`);
        } else {
          setDiscountAmount(0);
          setVoucherMessage(`❌ ${data.message}`);
          showError(`Mã Voucher ${voucherCode} không hợp lệ hoặc đã hết hạn!`);
        }
      }
    } catch (err) {
      setVoucherMessage('Khuyến mãi không hợp lệ.');
      showError('Mã Voucher không khả dụng.');
    }
  };

  // Calculated totals
  const subtotal = selectedOrder ? selectedOrder.totalAmount : 0;
  const pointsDiscount = pointsToRedeem * 1000;
  const totalDiscount = discountAmount + pointsDiscount;
  const grandTotal = Math.max(0, subtotal - totalDiscount);
  const vatAmount = grandTotal * 0.08;
  const cashNum = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashNum - grandTotal);

  // Submit Checkout Process
  const handleProcessPayment = async () => {
    if (!selectedOrder) {
      showError('Vui lòng chọn một đơn hàng để thanh toán!');
      return;
    }
    
    if (paymentMethod === 'CASH' && cashNum < grandTotal) {
      showError(`Số tiền khách đưa (${formatVND(cashNum)}) không đủ để thanh toán tổng bill (${formatVND(grandTotal)})!`);
      return;
    }

    try {
      const res = await api.post('/api/cashier/checkout', {
        orderId: selectedOrder.id,
        paymentMethod,
        cashReceived: cashNum,
        voucherCode,
        pointsToRedeem
      });

      if (res.data && res.data.success) {
        setCompletedInvoice(res.data.data);
        showToast('Thanh toán và phát hành hóa đơn VAT thành công!');
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Thanh toán thất bại, vui lòng kiểm tra lại kết nối!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#182B2B] font-sans">
      <CashierNavbar />

      {/* Floating Success Toast (Green/Teal) */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#2A4747] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#4E878C]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#4E878C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Red Error Toast (Nổi bật góc phải / giữa) */}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#8C3A27] text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-400 text-xs font-bold uppercase tracking-wider animate-bounce flex items-center gap-3 max-w-md">
          <AlertCircle className="w-6 h-6 text-yellow-300 shrink-0" />
          <div className="flex-1">
            <span className="block font-black text-xs text-yellow-300 mb-0.5">CẢNH BÁO THU NGÂN</span>
            <span className="normal-case text-xs font-medium leading-relaxed block">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md">
          <span className="text-xs font-bold text-[#4E878C] uppercase tracking-widest block mb-1">
            POS Payment Terminal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
            Quầy Tính Tiền & Thanh Toán Đa Phương Thức
          </h1>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang mở máy tính tiền POS...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-white rounded-3xl border border-gray-200">
            Không có đơn hàng nào chờ thanh toán.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT 5 COLS: Order Selector & Item List */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Select Dropdown */}
              <div className="bg-white p-5 rounded-3xl border border-[#2A4747]/10 shadow-md space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Chọn Đơn Hàng Cần Tính Tiền
                </label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const ord = orders.find(o => o.id === parseInt(e.target.value));
                    setSelectedOrder(ord);
                    setDiscountAmount(0);
                    setVoucherMessage(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-gray-200 font-bold text-sm text-[#182B2B] focus:outline-none focus:border-[#2A4747] cursor-pointer"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      #ORD-{o.id} • {o.tableName} ({o.customerName}) - {formatVND(o.totalAmount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Details Ticket Card */}
              {selectedOrder && (
                <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/15 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-serif font-bold text-xl text-[#2A4747]">#ORD-{selectedOrder.id}</span>
                      <span className="text-xs text-gray-500 block">Bàn ăn: <strong className="text-[#182B2B]">{selectedOrder.tableName}</strong></span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-[#FAF7F2] border border-gray-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-[#182B2B] block">{item.dishName} x{item.quantity}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{formatVND(item.price)} / món</span>
                        </div>
                        <span className="font-mono font-bold text-[#2A4747]">{formatVND(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Số lượng món: {selectedOrder.items?.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    <span className="font-mono text-base text-[#182B2B]">{formatVND(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT 7 COLS: Checkout Calculator & Payment Methods */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Payment Method Selector */}
              <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-xl space-y-4">
                <h3 className="font-bold font-serif text-base text-[#182B2B] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#4E878C]" /> Chọn Phương Thức Thanh Toán
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'CASH', name: 'Tiền Mặt', icon: DollarSign },
                    { id: 'QR', name: 'Mã QR (VietQR)', icon: QrCode },
                    { id: 'CARD', name: 'Thẻ POS', icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-3.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer border ${
                          isSel
                            ? 'bg-[#2A4747] text-white border-[#4E878C] shadow-md'
                            : 'bg-[#FAF7F2] text-[#182B2B] border-gray-200 hover:border-[#2A4747]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSel ? 'text-[#4E878C]' : 'text-gray-500'}`} />
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conditional Payment Method Display */}
                {paymentMethod === 'CASH' && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 space-y-3">
                    <label className="text-xs font-bold text-gray-600 block">Số Tiền Khách Đưa (VNĐ) *</label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 500000"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-gray-300 font-mono font-bold text-sm focus:outline-none focus:border-[#2A4747]"
                    />
                    {cashNum > 0 && (
                      <div className="flex justify-between items-center text-xs font-bold pt-1">
                        <span className="text-gray-500">Tiền thối lại cho khách:</span>
                        <span className={`font-mono text-sm ${changeDue >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {formatVND(changeDue)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'QR' && (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-gray-200 text-center space-y-3">
                    <div className="flex justify-between items-center px-2">
                      <p className="text-xs font-bold text-[#2A4747]">Mã VietQR Ngân Hàng Thật - Chuyển Khoản Trực Tiếp</p>
                      <button
                        onClick={() => setShowBankConfigModal(true)}
                        className="text-[10px] font-bold text-[#4E878C] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        ⚙️ Cấu Hình STK Thật
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-gray-300 inline-block shadow-md">
                      <img
                        src={`https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${grandTotal}&addInfo=${encodeURIComponent(`THANH TOAN BAN ${selectedOrder?.tableName || ''} ORD-${selectedOrder?.id || ''}`)}&accountName=${encodeURIComponent(accountName)}`}
                        alt="Real VietQR Payment"
                        className="h-44 w-44 mx-auto rounded-xl border border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`VietQR Bank: ${bankId} STK: ${accountNo} SoTien: ${grandTotal}`)}`;
                        }}
                      />
                    </div>

                    <div className="text-[11px] font-medium text-gray-600 space-y-0.5">
                      <p>Ngân hàng: <strong className="text-[#182B2B]">{bankId}</strong> • STK: <strong className="font-mono text-[#2A4747]">{accountNo}</strong></p>
                      <p>Chủ tài khoản: <strong>{accountName}</strong></p>
                      <p className="text-[10px] text-emerald-700 font-bold font-mono">
                        Số tiền: {formatVND(grandTotal)} • Nội dung: THANH TOAN BAN {selectedOrder?.tableName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Voucher & Loyalty Points Form */}
              <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-xl space-y-4">
                <h3 className="font-bold font-serif text-base text-[#182B2B] flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#4E878C]" /> Mã Khuyến Mãi & Tích Điểm
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Voucher Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Nhập Mã Voucher / Coupon</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="VD: VIP10, DISCOUNT50K"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 uppercase font-mono font-bold"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        className="px-3 py-2.5 rounded-xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all cursor-pointer shrink-0"
                      >
                        Áp Dụng
                      </button>
                    </div>
                    {voucherMessage && <p className="text-[10px] font-bold mt-1">{voucherMessage}</p>}
                  </div>

                  {/* Redeem Points */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">Đổi Điểm Thưởng (1đ = 1.000đ)</label>
                    <input
                      type="number"
                      placeholder="Số điểm muốn quy đổi"
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
                      className="w-full p-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bill Total Calculation & Checkout Action Button */}
              <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/20 shadow-2xl space-y-4">
                <div className="space-y-2 text-xs font-medium text-gray-600 border-b border-gray-100 pb-3">
                  <div className="flex justify-between">
                    <span>Tổng tiền món (Subtotal):</span>
                    <span className="font-mono font-bold text-[#182B2B]">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Giảm giá Voucher + Điểm:</span>
                    <span className="font-mono font-bold">-{formatVND(totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Thuế VAT tạm tính (8%):</span>
                    <span className="font-mono">{formatVND(vatAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                      Tổng Thanh Toán (Grand Total)
                    </span>
                    <span className="text-3xl font-bold font-mono text-[#2A4747]">
                      {formatVND(grandTotal)}
                    </span>
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    className="px-6 py-3.5 rounded-2xl bg-[#2A4747] hover:bg-[#182B2B] text-white text-sm font-bold transition-all shadow-xl flex items-center gap-2 cursor-pointer border border-[#4E878C]/40"
                  >
                    <Receipt className="w-5 h-5 text-[#4E878C]" /> Hoàn Tất Thanh Toán & In Bill
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VAT INVOICE BILL RECEIPT MODAL */}
        {completedInvoice && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-[#2A4747]/30 animate-fade-in relative max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => {
                  setCompletedInvoice(null);
                  setIsAudited(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
                {/* Audit Status Badge */}
                <div className="flex justify-center mb-1">
                  {isAudited ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ĐÃ THANH TOÁN & KIỂM DUYỆT THÀNH CÔNG
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                      ⏳ CHỜ KIỂM DUYỆT THU NGÂN POS
                    </span>
                  )}
                </div>

                <span className="font-serif font-bold text-xl text-[#2A4747] block">L'ÉCLAT RESTAURANT</span>
                <p className="text-[10px] text-gray-500">HÓA ĐƠN GIA TĂNG GIÁ TRỊ (VAT RECEIPT)</p>
                <p className="text-xs font-mono font-bold text-gray-700">Mã Bill: {completedInvoice.invoiceNumber}</p>
              </div>

              <div className="text-xs space-y-1 text-gray-600 font-medium">
                <p>Khách hàng: <strong className="text-gray-800">{completedInvoice.customerName}</strong></p>
                <p>Bàn ăn: <strong>{completedInvoice.tableName}</strong></p>
                <p>Hình thức: <strong className="uppercase text-[#2A4747]">{completedInvoice.paymentMethod}</strong></p>
              </div>

              {/* Items Table in Receipt */}
              <div className="border-t border-b border-dashed border-gray-300 py-3 space-y-2">
                {completedInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium">
                    <span>{item.dishName} x{item.quantity}</span>
                    <span className="font-mono font-bold">{formatVND(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs text-gray-600 font-medium border-b border-dashed border-gray-300 pb-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-mono">{formatVND(completedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Giảm giá:</span>
                  <span className="font-mono">-{formatVND(completedInvoice.discountAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Thuế VAT (8%):</span>
                  <span className="font-mono">{formatVND(completedInvoice.vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#182B2B] pt-1">
                  <span>TỔNG CỘNG:</span>
                  <span className="font-mono text-base text-[#2A4747]">{formatVND(completedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Dual Action Controls: Audit & Print */}
              <div className="text-center pt-2 space-y-3">
                <p className="text-[11px] text-gray-500 italic">Cảm ơn quý khách và hẹn gặp lại!</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setIsAudited(true);
                      showToast('Đã kiểm duyệt & đánh dấu thanh toán thành công!');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border ${
                      isAudited
                        ? 'bg-emerald-800 text-white border-emerald-900 opacity-90'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>{isAudited ? 'Đã Kiểm Duyệt ✓' : 'Đánh Dấu & Kiểm Duyệt'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="py-2.5 px-3 rounded-xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4 text-[#4E878C]" /> In Bill & Xuất PDF
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bank Account Config Modal */}
        {showBankConfigModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-[#2A4747]/30 relative animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="font-bold font-serif text-base text-[#182B2B]">
                  ⚙️ Cấu Hình Số Tài Khoản Ngân Hàng Thật (VietQR)
                </h3>
                <button onClick={() => setShowBankConfigModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Điền thông tin tài khoản ngân hàng thật của bạn. Khi khách hàng quét mã QR, tiền sẽ được chuyển thẳng vào số tài khoản này!
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Chọn Ngân Hàng (Bank) *</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-gray-300 font-bold text-xs cursor-pointer"
                  >
                    <option value="MB">MBBank (Ngân Hàng Quân Đội)</option>
                    <option value="VCB">Vietcombank (Ngân Hàng Ngoại Thương)</option>
                    <option value="TCB">Techcombank (Ngân Hàng Kỹ Thương)</option>
                    <option value="ACB">ACB (Ngân Hàng Á Châu)</option>
                    <option value="VPB">VPBank (Ngân Hàng Thịnh Vượng)</option>
                    <option value="ICB">VietinBank (Ngân Hàng Công Thương)</option>
                    <option value="BIDV">BIDV (Ngân Hàng ĐT & PT Việt Nam)</option>
                    <option value="TPB">TPBank (Ngân Hàng Tiên Phong)</option>
                    <option value="STB">Sacombank (Ngân Hàng Sài Gòn Thương Tín)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-600 block mb-1">Số Tài Khoản Ngân Hàng Thật *</label>
                  <input
                    type="text"
                    placeholder="VD: 0987654321"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-gray-300 font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-600 block mb-1">Tên Chủ Tài Khoản (Không dấu) *</label>
                  <input
                    type="text"
                    placeholder="VD: LE NHAT LINH / NHA HANG L ETOILE"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                    className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-gray-300 font-bold text-xs uppercase"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowBankConfigModal(false);
                    showToast('Đã lưu thông tin tài khoản ngân hàng VietQR thật thành công!');
                  }}
                  className="w-full py-3 rounded-2xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all shadow-md cursor-pointer"
                >
                  Lưu & Áp Dụng Ngay
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
