import React, { useState } from 'react';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  Ticket,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ManagerPromotionsPage() {
  const [promotions, setPromotions] = useState([
    { code: 'VIP10', name: 'Giảm 10% Khách VIP', discount: '10%', status: 'ACTIVE' },
    { code: 'DISCOUNT50K', name: 'Giảm 50K Đơn >300K', discount: '50.000 ₫', status: 'ACTIVE' }
  ]);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const validateForm = () => {
    const errors = {};
    if (!code.trim()) {
      errors.code = 'Vui lòng nhập Mã Voucher Code (ví dụ: SUMMER30).';
    } else if (code.trim().length < 3) {
      errors.code = 'Mã Voucher Code phải có ít nhất 3 ký tự.';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(code.trim())) {
      errors.code = 'Mã Voucher Code chỉ được gồm chữ cái, chữ số (không dấu, không khoảng trắng).';
    }

    if (!name.trim()) {
      errors.name = 'Vui lòng nhập Tên Chương Trình (ví dụ: Khuyến Mãi Hè 2026).';
    } else if (name.trim().length < 5) {
      errors.name = 'Tên Chương Trình phải từ 5 ký tự trở lên.';
    }

    if (!discount.trim()) {
      errors.discount = 'Vui lòng nhập Mức Giảm Giá (ví dụ: 15% hoặc 100.000 VNĐ).';
    }

    return errors;
  };

  const handleCreatePromo = (e) => {
    e.preventDefault();
    setToastMessage(null);

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Only highlight red on input fields directly, no popups!
    }

    const upperCode = code.trim().toUpperCase();
    if (promotions.some(p => p.code === upperCode)) {
      setFieldErrors({ code: 'Mã Voucher Code này đã tồn tại trong hệ thống.' });
      return;
    }

    setPromotions([...promotions, { code: upperCode, name: name.trim(), discount: discount.trim(), status: 'ACTIVE' }]);
    showToast(`Đã khởi tạo thành công chương trình khuyến mãi ${upperCode}!`);
    setCode('');
    setName('');
    setDiscount('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      {/* Toast Success */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#1E2A38] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Marketing & Loyalty Campaigns
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
            Tạo & Quản Lý Chương Trình Khuyến Mãi
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Form Create Promotion */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-xl space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#0F172A] border-b pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C5A059]" /> Tạo Mã Khuyến Mãi Mới
            </h3>

            <form onSubmit={handleCreatePromo} noValidate className="space-y-4">
              
              {/* Code */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Mã Voucher Code *</label>
                <input
                  type="text"
                  placeholder="VD: SUMMER30"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (fieldErrors.code) setFieldErrors({ ...fieldErrors, code: null });
                  }}
                  className={`w-full p-3 rounded-xl uppercase font-mono font-bold text-xs transition-all ${
                    fieldErrors.code
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]'
                  }`}
                />
                {fieldErrors.code && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.code}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Tên Chương Trình *</label>
                <input
                  type="text"
                  placeholder="VD: Khuyến mãi chào Hè 2026"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.name
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]'
                  }`}
                />
                {fieldErrors.name && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.name}
                  </span>
                )}
              </div>

              {/* Discount */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Mức Giảm Giá *</label>
                <input
                  type="text"
                  placeholder="VD: 15% hoặc 100.000 VNĐ"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value);
                    if (fieldErrors.discount) setFieldErrors({ ...fieldErrors, discount: null });
                  }}
                  className={`w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    fieldErrors.discount
                      ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                      : 'bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]'
                  }`}
                />
                {fieldErrors.discount && (
                  <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.discount}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#1E2A38] text-white text-xs font-bold hover:bg-[#0F172A] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 border border-[#C5A059]/40"
              >
                Phát Hành Mã Khuyến Mãi
              </button>
            </form>
          </div>

          {/* List Promotions */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#0F172A]">Chương Trình Đang Áp Dụng</h3>

            <div className="space-y-3">
              {promotions.map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-[#1E2A38]/15 shadow-md flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-base text-[#1E2A38] bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        {p.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {p.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 block">{p.name}</span>
                  </div>

                  <span className="font-mono font-bold text-base text-emerald-700">{p.discount}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
