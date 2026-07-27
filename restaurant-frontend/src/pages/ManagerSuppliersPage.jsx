import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ManagerNavbar from '../components/ManagerNavbar';
import {
  Truck,
  Search,
  Phone,
  Mail,
  MapPin,
  UserCheck
} from 'lucide-react';

export default function ManagerSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/manager/suppliers');
      if (res.data && res.data.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#1E2A38]/10 shadow-md">
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Supplier Relations & Purchasing
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#0F172A]">
            Danh Mục Nhà Cung Cấp Nguyên Liệu
          </h1>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#1E2A38]/10 shadow-sm flex justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên đối tác nhà cung cấp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-200 focus:outline-none focus:border-[#1E2A38]"
            />
          </div>
        </div>

        {/* Supplier List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSuppliers.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl p-6 border border-[#1E2A38]/15 shadow-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-bold text-lg font-serif text-[#0F172A]">{s.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ĐỐI TÁC CHÍNH THỨC
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                <p className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-[#C5A059]" /> Người liên hệ: <strong className="text-[#0F172A]">{s.contactPerson}</strong></p>
                <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[#C5A059]" /> Điện thoại: <strong>{s.phone}</strong></p>
                <p className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-[#C5A059]" /> Email: <strong>{s.email}</strong></p>
                <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#C5A059]" /> Địa chỉ: <strong>{s.address}</strong></p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
