import React, { useState } from 'react';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  CalendarCheck,
  Search,
  Clock,
  Users,
  CheckCircle2,
  Phone
} from 'lucide-react';

export default function ManagerReservationsPage() {
  const [reservations] = useState([
    { id: 1, customerName: 'David Beckham', phone: '+84 987654321', guestCount: 4, tableNumber: 'Bàn VIP 1', time: '19:00 Hôm Nay', status: 'CONFIRMED' },
    { id: 2, customerName: 'Victoria Beckham', phone: '+84 987654322', guestCount: 2, tableNumber: 'Bàn 102', time: '20:30 Hôm Nay', status: 'CONFIRMED' },
    { id: 3, customerName: 'Trần Văn An', phone: '+84 912345678', guestCount: 6, tableNumber: 'Bàn Sảnh 5', time: '18:30 Ngày Mai', status: 'PENDING' }
  ]);

  const [search, setSearch] = useState('');

  const filtered = reservations.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    r.tableNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Table Floor & Booking Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
            Quản Lý Sơ Đồ Bàn Ăn & Lịch Đặt Bàn Khách Hàng
          </h1>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#1E2A38]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên khách, số điện thoại hoặc bàn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]"
            />
          </div>
        </div>

        {/* Reservation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <div key={res.id} className="bg-white rounded-3xl p-6 border border-[#1E2A38]/15 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
                  <span className="font-bold text-[#0F172A] text-base">{res.customerName}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {res.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600 font-medium">
                  <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#C5A059]" /> SĐT: <strong>{res.phone}</strong></p>
                  <p className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#C5A059]" /> Số khách: <strong>{res.guestCount} người</strong></p>
                  <p className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#C5A059]" /> Giờ hẹn: <strong>{res.time}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold font-mono text-sm text-[#1E2A38]">{res.tableNumber}</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  Đã Xếp Bàn
                </span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
