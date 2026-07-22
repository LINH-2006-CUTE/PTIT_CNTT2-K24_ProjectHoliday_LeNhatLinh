import React, { useState } from 'react';
import CashierNavbar from '../components/CashierNavbar';
import api from '../services/api';
import {
  Ticket,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Gift,
  X
} from 'lucide-react';

export default function CashierPromotionsPage() {
  const [promotions] = useState([
    { code: 'VIP10', name: 'Giảm 10% Khách VIP', discount: '10%', status: 'ACTIVE', validUntil: '2026-12-31' },
    { code: 'DISCOUNT50K', name: 'Giảm 50K Đơn >300K', discount: '50.000 ₫', status: 'ACTIVE', validUntil: '2026-12-31' },
    { code: 'WELCOME2026', name: 'Chào Mừng 2026', discount: '20%', status: 'EXPIRED', validUntil: '2026-01-01' }
  ]);

  const [testCode, setTestCode] = useState('');
  const [orderTotal, setOrderTotal] = useState(500000);
  const [fieldErrors, setFieldErrors] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4500);
  };

  const handleTestVoucher = (e) => {
    e.preventDefault();
    setTestResult(null);
    setErrorMessage(null);
    const errors = {};

    if (!testCode.trim()) {
      errors.testCode = 'Vui lòng nhập Mã Khuyến Mãi cần kiểm tra (ví dụ: VIP10 hoặc DISCOUNT50K).';
    }
    if (!orderTotal || orderTotal <= 0) {
      errors.orderTotal = 'Vui lòng nhập Giá Trị Đơn Hàng hợp lệ (> 0 VNĐ).';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showError('Vui lòng kiểm tra và điền đầy đủ các thông tin cần thiết.');
      return;
    }

    const found = promotions.find(p => p.code.toUpperCase() === testCode.trim().toUpperCase());
    if (!found) {
      setTestResult({ success: false, message: `Mã [${testCode.trim().toUpperCase()}] không tồn tại trong hệ thống.` });
      return;
    }

    if (found.status === 'EXPIRED') {
      setTestResult({ success: false, message: `Mã [${found.code}] đã hết hạn sử dụng (${found.validUntil}).` });
      return;
    }

    let discountAmt = 0;
    if (found.discount.includes('%')) {
      const pct = parseFloat(found.discount.replace('%', ''));
      discountAmt = (orderTotal * pct) / 100;
    } else {
      discountAmt = 50000;
    }

    setTestResult({
      success: true,
      code: found.code,
      name: found.name,
      discountText: found.discount,
      discountAmount: discountAmt,
      finalTotal: Math.max(0, orderTotal - discountAmt),
      message: `Áp dụng thành công voucher [${found.code}]!`
    });
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <CashierNavbar />

      {/* Floating Red Error Banner */}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#8C3A27] text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-400 text-xs font-bold uppercase tracking-wider animate-bounce flex items-center gap-3 max-w-md">
          <AlertCircle className="w-6 h-6 text-yellow-300 shrink-0" />
          <div className="flex-1">
            <span className="block font-black text-xs text-yellow-300 mb-0.5">CẢNH BÁO DỮ LIỆU</span>
            <span className="normal-case text-xs font-medium leading-relaxed block">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md">
          <span className="text-xs font-bold text-[#4E878C] uppercase tracking-widest block mb-1">
            Voucher & Discount Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
            Quản Lý & Kiểm Tra Mã Khuyến Mãi (Promotions)
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Form Check Voucher */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-xl space-y-5">
            <h3 className="font-bold font-serif text-lg text-[#182B2B] border-b pb-2 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#4E878C]" /> Kiểm Tra Hiệu Lực Mã Voucher
            </h3>

            <form onSubmit={handleTestVoucher} noValidate className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Nhập Mã Voucher Code *</label>
                <input
                  type="text"
                  placeholder="VD: VIP10"
                  value={testCode}
                  onChange={(e) => {
                    setTestCode(e.target.value);
                    if (fieldErrors.testCode) setFieldErrors({ ...fieldErrors, testCode: null });
                  }}
                  className={`w-full p-3 rounded-xl uppercase font-mono font-bold text-xs transition-all ${
                    fieldErrors.testCode
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#2A4747]'
                  }`}
                />
                {fieldErrors.testCode && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.testCode}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Giá Trị Đơn Hàng Thử Nghệ (VNĐ) *</label>
                <input
                  type="number"
                  placeholder="VD: 500000"
                  value={orderTotal}
                  onChange={(e) => {
                    setOrderTotal(Number(e.target.value));
                    if (fieldErrors.orderTotal) setFieldErrors({ ...fieldErrors, orderTotal: null });
                  }}
                  className={`w-full p-3 rounded-xl font-mono font-bold text-xs transition-all ${
                    fieldErrors.orderTotal
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#2A4747]'
                  }`}
                />
                {fieldErrors.orderTotal && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.orderTotal}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#4E878C]" /> Kiểm Tra Mã
              </button>
            </form>

            {/* Test Result Display */}
            {testResult && (
              <div className={`p-4 rounded-2xl border text-xs font-medium space-y-2 animate-fade-in ${
                testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                  <span>{testResult.message}</span>
                </div>

                {testResult.success && (
                  <div className="pt-2 border-t border-emerald-200 font-mono space-y-1">
                    <p>Chương trình: <strong>{testResult.name}</strong></p>
                    <p>Mức giảm: <strong className="text-emerald-700">{testResult.discountText}</strong> (-{formatVND(testResult.discountAmount)})</p>
                    <p className="text-sm font-bold text-[#182B2B]">Thành tiền sau giảm: {formatVND(testResult.finalTotal)}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* List Promotions */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#182B2B]">Danh Sách Mã Giảm Giá Hệ Thống</h3>

            <div className="space-y-3">
              {promotions.map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-[#2A4747]/10 shadow-md flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-base text-[#2A4747] bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                        {p.code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 block">{p.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Hạn dùng: {p.validUntil}</span>
                  </div>

                  <span className="font-mono font-bold text-base text-[#4E878C]">{p.discount}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
