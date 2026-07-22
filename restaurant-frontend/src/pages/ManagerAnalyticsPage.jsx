import React, { useState } from 'react';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';

export default function ManagerAnalyticsPage() {
  const [activeChart, setActiveChart] = useState('REVENUE'); // REVENUE, PROFIT, FOOD, CUSTOMER

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const revenueData = [
    { day: 'T2', val: 14.5, profit: 5.0 },
    { day: 'T3', val: 16.2, profit: 5.6 },
    { day: 'T4', val: 18.9, profit: 6.6 },
    { day: 'T5', val: 15.4, profit: 5.3 },
    { day: 'T6', val: 24.8, profit: 8.6 },
    { day: 'T7', val: 31.2, profit: 10.9 },
    { day: 'CN', val: 28.5, profit: 9.9 }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Phân Tích Dữ Liệu & Doanh Số Nhà Hàng
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
            Phân Tích Biểu Đồ Doanh Thu, Đơn Hàng & Món Ăn
          </h1>
        </div>

        {/* Chart Switcher */}
        <div className="flex gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-[#1E2A38]/10 shadow-sm">
          {[
            { id: 'REVENUE', label: 'Biểu Đồ Doanh Thu', icon: LineChart },
            { id: 'ORDERS', label: 'Biểu Đồ Đơn Hàng', icon: TrendingUp },
            { id: 'FOOD', label: 'Biểu Đồ Món Ăn', icon: BarChart3 },
            { id: 'CUSTOMER', label: 'Thống Kê Thực Khách', icon: Users }
          ].map((c) => {
            const Icon = c.icon;
            const isSel = activeChart === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChart(c.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isSel
                    ? 'bg-[#1E2A38] text-white shadow-md border border-[#C5A059]/60'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? 'text-[#C5A059]' : 'text-gray-400'}`} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Chart Display Card */}
        <div className="bg-white p-8 rounded-3xl border border-[#1E2A38]/15 shadow-2xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <span className="font-serif font-bold text-xl text-[#0F172A]">
                {activeChart === 'REVENUE' && 'Biểu Đồ Biến Động Doanh Thu Tuần (Triệu VNĐ)'}
                {activeChart === 'ORDERS' && 'Biểu Đồ Tăng Trưởng Số Lượng Đơn Hàng Theo Ngày'}
                {activeChart === 'FOOD' && 'Biểu Đồ Phân Phối Doanh Thu Theo Món Ăn'}
                {activeChart === 'CUSTOMER' && 'Biểu Đồ Phân Hạng Khách Hàng VIP & Lượng Đặt Bàn'}
              </span>
              <p className="text-xs text-gray-500">Cập nhật dữ liệu thời gian thực</p>
            </div>
          </div>

          {/* Custom Visual Bar Chart UI */}
          <div className="pt-6 pb-2">
            <div className="h-64 flex items-end justify-between gap-3 px-4 border-b border-gray-200">
              {revenueData.map((d, idx) => {
                const heightPercent = (d.val / 35) * 100;
                const profitHeight = (d.profit / 35) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono font-bold text-[#1E2A38] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.val}M
                    </div>

                    <div className="w-full max-w-[48px] bg-gray-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full p-1 relative">
                      {/* Revenue Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          activeChart === 'PROFIT' ? 'bg-emerald-600' : 'bg-[#1E2A38]'
                        }`}
                      />
                    </div>

                    <span className="text-xs font-bold text-gray-600">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 text-xs font-bold pt-2">
            <span className="flex items-center gap-1.5 text-[#1E2A38]">
              <span className="h-3 w-3 rounded bg-[#1E2A38]" /> Doanh Thu (Triệu VNĐ)
            </span>
            <span className="flex items-center gap-1.5 text-[#C5A059]">
              <span className="h-3 w-3 rounded bg-[#C5A059]" /> Số Lượng Đơn Hàng
            </span>
          </div>

        </div>

      </main>
    </div>
  );
}
