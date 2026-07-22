import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WaiterNavbar from '../components/WaiterNavbar';
import { Users, Search, History, Phone, Mail, MapPin } from 'lucide-react';

export default function WaiterCustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/public/customers/search', { params: { search: search.trim() } });
      if (res.data && res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#222E21] font-sans">
      <WaiterNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-[#3B4A39]/10 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-[#708238] uppercase tracking-widest block mb-1">
              Guest Lookup & Order History
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#222E21]">
              Tra Cứu Khách Hàng Đang Dùng Bữa
            </h1>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Nhập tên, SĐT hoặc Email khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input text-xs py-2.5 w-full sm:w-64"
            />
            <button
              onClick={fetchCustomers}
              className="bg-[#3B4A39] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 hover:bg-[#222E21] cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Tìm
            </button>
          </div>
        </div>

        {/* Customer Cards List */}
        {loading ? (
          <div className="py-24 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải thông tin khách hàng...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl p-6 border border-[#3B4A39]/15 shadow-xl space-y-3">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="h-10 w-10 rounded-full bg-[#708238] text-white font-bold flex items-center justify-center text-sm font-serif">
                    {c.fullName ? c.fullName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#222E21]">{c.fullName}</h4>
                    <span className="text-[10px] text-[#708238] font-bold uppercase tracking-wider font-mono">
                      Khách Hàng Thân Thiết
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500 font-medium">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#708238]" /> SĐT: {c.phone || 'Chưa cập nhật'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#708238]" /> Email: {c.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#708238]" /> Địa chỉ: {c.address || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
