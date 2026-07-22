import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CashierNavbar from '../components/ChefNavbar'; // fallback or import CashierNavbar
import CashierNav from '../components/CashierNavbar';
import {
  Receipt,
  Search,
  Printer,
  FileText,
  Clock,
  Eye,
  X
} from 'lucide-react';

export default function CashierInvoicesPage() {
  const [invoices, setInvoices] = useState([
    {
      id: 101,
      invoiceNumber: 'INV-882910',
      customerName: 'David Beckham',
      customerPhone: '+84 987654321',
      tableName: 'Bàn 102',
      subtotal: 1250000,
      discountAmount: 125000,
      vatAmount: 90000,
      totalAmount: 1215000,
      paymentMethod: 'CASH',
      issuedAt: '2026-07-22 12:30'
    },
    {
      id: 102,
      invoiceNumber: 'INV-882911',
      customerName: 'Victoria Beckham',
      customerPhone: '+84 987654322',
      tableName: 'Bàn VIP 1',
      subtotal: 3400000,
      discountAmount: 50000,
      vatAmount: 268000,
      totalAmount: 3618000,
      paymentMethod: 'VNPAY',
      issuedAt: '2026-07-22 13:15'
    }
  ]);

  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const formatVND = (val) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.tableName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#182B2B] font-sans">
      <CashierNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#2A4747]/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#4E878C] uppercase tracking-widest block mb-1">
              Invoice History & Tax Receipts
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#182B2B]">
              Quản Lý Hóa Đơn VAT Đã Phát Hành
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#2A4747]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo số Hóa đơn INV, tên khách hoặc bàn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#2A4747]"
            />
          </div>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-3xl p-6 border border-[#2A4747]/15 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
                  <span className="font-mono font-bold text-sm text-[#2A4747]">{inv.invoiceNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#182B2B] text-[#FAF7F2]">
                    {inv.paymentMethod}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600 font-medium">
                  <p>Khách hàng: <strong className="text-[#182B2B]">{inv.customerName}</strong></p>
                  <p>Bàn ăn: <strong>{inv.tableName}</strong></p>
                  <p className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3 text-[#4E878C]" /> {inv.issuedAt}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Thực Thu</span>
                  <span className="font-mono font-bold text-base text-[#2A4747]">{formatVND(inv.totalAmount)}</span>
                </div>

                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="px-3.5 py-2 rounded-xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Eye className="w-3.5 h-3.5 text-[#4E878C]" /> Xem Bill
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Invoice Preview Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-[#2A4747]/30 animate-fade-in relative">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
                <span className="font-serif font-bold text-xl text-[#2A4747] block">L'ÉCLAT RESTAURANT</span>
                <p className="text-xs font-mono font-bold text-gray-700">Mã Bill: {selectedInvoice.invoiceNumber}</p>
              </div>

              <div className="text-xs space-y-1 text-gray-600 font-medium">
                <p>Khách hàng: <strong className="text-gray-800">{selectedInvoice.customerName}</strong></p>
                <p>Bàn ăn: <strong>{selectedInvoice.tableName}</strong></p>
                <p>Hình thức: <strong className="uppercase text-[#2A4747]">{selectedInvoice.paymentMethod}</strong></p>
                <p>Thời gian: <strong>{selectedInvoice.issuedAt}</strong></p>
              </div>

              <div className="space-y-1 text-xs text-gray-600 font-medium border-t border-b border-dashed border-gray-300 py-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-mono">{formatVND(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Giảm giá:</span>
                  <span className="font-mono">-{formatVND(selectedInvoice.discountAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Thuế VAT (8%):</span>
                  <span className="font-mono">{formatVND(selectedInvoice.vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#182B2B] pt-1">
                  <span>TỔNG THỰC THU:</span>
                  <span className="font-mono text-base text-[#2A4747]">{formatVND(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-[#2A4747] text-white text-xs font-bold hover:bg-[#182B2B] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-[#4E878C]" /> In Hóa Đơn & Xuất PDF
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
