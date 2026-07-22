import React, { useState } from 'react';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  Crown,
  Search,
  Star,
  Users
} from 'lucide-react';

export default function ManagerCustomersPage() {
  const [customers] = useState([
    { name: 'David Beckham', email: 'customer1@gmail.com', phone: '+84 987654321', rank: 'GOLD', points: 150, totalSpent: 18500000 },
    { name: 'Victoria Beckham', email: 'customer2@gmail.com', phone: '+84 987654322', rank: 'PLATINUM', points: 320, totalSpent: 42000000 }
  ]);

  const [search, setSearch] = useState('');

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            VIP Guest Directory & Loyalty
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
            Quản Lý Khách Hàng VIP & Điểm Tích Lũy
          </h1>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#1E2A38]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm tên khách VIP hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]"
            />
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((c, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-[#1E2A38]/15 shadow-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-bold text-lg font-serif text-[#0F172A]">{c.name}</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#C5A059]" /> {c.rank} MEMBER
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-600 font-medium">
                <p>Email: <strong className="text-gray-800">{c.email}</strong></p>
                <p>SĐT: <strong>{c.phone}</strong></p>
                <p>Tổng chi tiêu tích lũy: <strong className="text-[#1E2A38] font-mono text-sm">{formatVND(c.totalSpent)}</strong></p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs font-bold">
                <span className="text-gray-400 uppercase">Số điểm khả dụng</span>
                <span className="font-mono text-lg text-[#C5A059]">{c.points} điểm</span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
