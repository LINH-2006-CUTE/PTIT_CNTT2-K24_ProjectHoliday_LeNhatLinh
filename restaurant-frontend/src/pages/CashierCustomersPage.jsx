import React, { useState } from 'react';
import CashierNavbar from '../components/CashierNavbar';
import api from '../services/api';
import {
  Users,
  Search,
  PlusCircle,
  MinusCircle,
  Crown,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function CashierCustomersPage() {
  const [customerEmail, setCustomerEmail] = useState('customer1@gmail.com');
  const [pointsInput, setPointsInput] = useState(10);
  const [action, setAction] = useState('ADD'); // ADD or REDEEM
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const customers = [
    {
      name: 'David Beckham',
      email: 'customer1@gmail.com',
      phone: '+84 987654321',
      rank: 'GOLD',
      points: 150
    },
    {
      name: 'Victoria Beckham',
      email: 'customer2@gmail.com',
      phone: '+84 987654322',
      rank: 'PLATINUM',
      points: 320
    }
  ];

  const handleProcessPoints = async (e) => {
    e.preventDefault();
    setResultMessage(null);
    setErrorMessage(null);

    if (!customerEmail.trim() || pointsInput <= 0) {
      setErrorMessage('Vui lòng điền thông tin email và số điểm hợp lệ.');
      return;
    }

    try {
      const res = await api.post('/api/cashier/customers/points', {
        customerEmail: customerEmail.trim(),
        points: pointsInput,
        action
      });
      if (res.data && res.data.success) {
        setResultMessage(res.data.data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Thao tác quy đổi điểm thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#182B2B] font-sans">
      <CashierNavbar />

      {/* Floating Red Error Toast (Nổi bật góc phải) */}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#8C3A27] text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-red-400 text-xs font-bold uppercase tracking-wider animate-bounce flex items-center gap-3 max-w-md">
          <AlertCircle className="w-6 h-6 text-yellow-300 shrink-0" />
          <div className="flex-1">
            <span className="block font-black text-xs text-yellow-300 mb-0.5">LỖI XỬ LÝ ĐIỂM THƯỞNG</span>
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
            Customer Loyalty & Points System
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
            Quản Lý Điểm Thưởng & Thẻ Thành Viên
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT 5 COLS: Points Management Form */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-xl space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#182B2B] flex items-center gap-2 border-b border-gray-100 pb-3">
              <Crown className="w-5 h-5 text-[#4E878C]" /> Thao Tác Cộng / Đổi Điểm Thu Ngân
            </h3>

            {resultMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {resultMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 border border-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {errorMessage}
              </div>
            )}

            <form onSubmit={handleProcessPoints} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Email Khách Hàng *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  placeholder="VD: customer1@gmail.com"
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-gray-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Hành Động Điểm *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAction('ADD')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      action === 'ADD'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" /> Cộng Điểm
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction('REDEEM')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      action === 'REDEEM'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" /> Quy Đổi Điểm
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Số Điểm (1 điểm = 1.000 VNĐ) *</label>
                <input
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(parseInt(e.target.value) || 0)}
                  min="1"
                  required
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-gray-200 font-mono font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                Xác Nhận Cập Nhật Điểm
              </button>
            </form>
          </div>

          {/* RIGHT 7 COLS: Customer List */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-bold font-serif text-lg text-[#182B2B] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4E878C]" /> Danh Sách Khách Hàng Thành Viên
            </h3>

            <div className="space-y-4">
              {customers.map((c, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-[#2A4747]/15 shadow-md flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#182B2B]">{c.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {c.rank} MEMBER
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{c.email} • {c.phone}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Điểm Tích Lũy</span>
                    <span className="text-2xl font-bold font-mono text-[#2A4747]">{c.points} đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
