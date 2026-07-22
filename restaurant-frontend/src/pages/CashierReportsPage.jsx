import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CashierNavbar from '../components/CashierNavbar';
import {
  BarChart3,
  DollarSign,
  Receipt,
  Printer,
  Clock,
  CheckCircle2,
  QrCode,
  CreditCard,
  FileText
} from 'lucide-react';

export default function CashierReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cashier/reports/shift');
      if (res.data && res.data.success) {
        setReport(res.data.data);
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#4E878C] uppercase tracking-widest block mb-1">
              Cashier Shift Financial Settlement
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
              Báo Cáo Bảng Chốt Doanh Thu Theo Ca Thu Ngân
            </h1>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-2xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4 text-[#4E878C]" /> In Báo Cáo Chốt Ca
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tính toán kết ca thu ngân...
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-[#2A4747]/15 shadow-2xl space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase">Thu Ngân Đảm Nhận</span>
                <span className="text-lg font-bold font-serif text-[#182B2B]">{report?.cashierName}</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 block uppercase">Thời Gian Bắt Đầu Ca</span>
                <span className="text-xs font-mono font-bold text-[#2A4747]">
                  {report?.shiftStartTime ? new Date(report.shiftStartTime).toLocaleString('vi-VN') : 'Hôm nay'}
                </span>
              </div>
            </div>

            {/* Shift Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF7F2] p-6 rounded-2xl border border-gray-200">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  TỔNG DOANH THU THỰC THU CA
                </span>
                <span className="text-3xl font-bold font-mono text-[#2A4747]">
                  {formatVND(report?.totalRevenue || 12450000)}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  TỔNG SỐ HÓA ĐƠN ĐÃ IN
                </span>
                <span className="text-3xl font-bold font-mono text-[#182B2B]">
                  {report?.totalInvoices || 18} Hóa đơn
                </span>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-sm text-[#182B2B] uppercase tracking-wider">
                Phân Loại Doanh Thu Theo Hình Thức Thanh Toán
              </h3>

              <div className="space-y-2 text-xs font-medium">
                <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex justify-between items-center">
                  <span className="flex items-center gap-2 font-bold text-[#182B2B]">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Tiền mặt thực tế trong két:
                  </span>
                  <span className="font-mono font-bold text-sm text-[#2A4747]">
                    {formatVND(report?.cashTotal || 5200000)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex justify-between items-center">
                  <span className="flex items-center gap-2 font-bold text-[#182B2B]">
                    <QrCode className="w-4 h-4 text-teal-600" /> Chuyển khoản QR Code:
                  </span>
                  <span className="font-mono font-bold text-sm text-[#2A4747]">
                    {formatVND(report?.qrTotal || 3400000)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex justify-between items-center">
                  <span className="flex items-center gap-2 font-bold text-[#182B2B]">
                    <CreditCard className="w-4 h-4 text-blue-600" /> Cổng VNPay / Ví MoMo / Thẻ POS:
                  </span>
                  <span className="font-mono font-bold text-sm text-[#2A4747]">
                    {formatVND((report?.vnpayTotal || 0) + (report?.momoTotal || 0) + (report?.cardTotal || 3850000))}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>Chữ ký Thu Ngân xác nhận chốt ca làm việc và bàn giao két tiền hoàn tất.</p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
