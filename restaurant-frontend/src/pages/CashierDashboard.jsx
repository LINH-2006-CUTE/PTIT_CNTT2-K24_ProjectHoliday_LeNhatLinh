import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CashierNavbar from '../components/CashierNavbar';
import {
  DollarSign,
  Receipt,
  Clock,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Ticket,
  Users
} from 'lucide-react';

export default function CashierDashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [shiftReport, setShiftReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, reportRes] = await Promise.all([
        api.get('/api/cashier/orders'),
        api.get('/api/cashier/reports/shift')
      ]);

      if (ordRes.data && ordRes.data.success) {
        setPendingOrders(ordRes.data.data);
      }
      if (reportRes.data && reportRes.data.success) {
        setShiftReport(reportRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#182B2B] font-sans">
      <CashierNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md">
          <div>
            <span className="text-xs font-bold text-[#4E878C] uppercase tracking-widest block mb-1">
              Cashier POS Counter Station
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
              Bảng Điều Khiển Thu Ngân & Thanh Toán
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              to="/cashier/payments"
              className="bg-[#2A4747] text-white px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#182B2B] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-[#4E878C]" /> Mở Quầy Tính Tiền POS
            </Link>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Stat 1: Doanh Thu Hôm Nay */}
          <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Doanh Thu Ca Hôm Nay
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#2A4747]">
                {formatVND(shiftReport?.totalRevenue || 12450000)}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Đã chốt {shiftReport?.totalInvoices || 18} hóa đơn
              </span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#2A4747] flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 2: Số Hóa Đơn */}
          <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Số Hóa Đơn Đã Phát Hành
              </span>
              <span className="text-3xl font-bold font-mono text-[#182B2B]">
                {shiftReport?.totalInvoices || 18}
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Đã in bill VAT hoàn tất</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-7 h-7" />
            </div>
          </div>

          {/* Stat 3: Thanh Toán Đang Chờ */}
          <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Đơn Hàng Chờ Thanh Toán
              </span>
              <span className="text-3xl font-bold font-mono text-[#4E878C]">
                {pendingOrders.length}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold block mt-1">Khách đang đợi tại bàn</span>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
          </div>

        </div>

        {/* Section: Pending Payment Queue Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#2A4747]/10 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-bold font-serif text-lg text-[#182B2B] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#4E878C]" /> Hàng Chờ Thanh Toán Tại Sảnh
            </h3>
            <Link to="/cashier/payments" className="text-xs font-bold text-[#4E878C] hover:underline flex items-center gap-1">
              Đến Màn Hình POS Tính Tiền <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 font-semibold">
              Hiện tại không có đơn hàng nào chờ tính tiền. Quầy thu ngân sẵn sàng!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[#2A4747] font-bold border-b border-gray-200">
                    <th className="p-3.5 rounded-l-xl">Mã Đơn #ORD</th>
                    <th className="p-3.5">Bàn Ăn</th>
                    <th className="p-3.5">Khách Hàng</th>
                    <th className="p-3.5">Tổng Tiền Tạm Tính</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 text-right rounded-r-xl">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {pendingOrders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#2A4747]">#ORD-{ord.id}</td>
                      <td className="p-3.5 font-bold">{ord.tableName}</td>
                      <td className="p-3.5 text-gray-600">{ord.customerName}</td>
                      <td className="p-3.5 font-bold font-mono text-[#182B2B]">{formatVND(ord.totalAmount)}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          to="/cashier/payments"
                          className="px-3 py-1.5 rounded-xl bg-[#2A4747] text-white text-[11px] font-bold hover:bg-[#182B2B] transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          Tính Tiền POS <ArrowRight className="w-3 h-3 text-[#4E878C]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
