import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Receipt,
  Ticket,
  Users,
  BarChart3,
  Bell,
  User
} from 'lucide-react';

export default function CashierNavbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/staff-notifications/unread-count', { params: { role: 'ROLE_CASHIER' } });
        if (res.data && res.data.data) {
          setUnreadCount(res.data.data.count || 0);
        }
      } catch (e) {
        // silent
      }
    };
    fetchUnreadCount();
  }, []);

  const navItems = [
    { path: '/cashier/dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { path: '/cashier/orders', label: 'Đơn Hàng', icon: ClipboardList },
    { path: '/cashier/payments', label: 'Thanh Toán', icon: CreditCard },
    { path: '/cashier/invoices', label: 'Hóa Đơn', icon: Receipt },
    { path: '/cashier/promotions', label: 'Khuyến Mãi', icon: Ticket },
    { path: '/cashier/customers', label: 'Thực Khách', icon: Users },
    { path: '/cashier/reports', label: 'Báo Cáo', icon: BarChart3 },
  ];

  return (
    <header className="bg-[#182B2B] text-[#FAF7F2] border-b border-[#4E878C]/30 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Cashier Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-9 w-9 rounded-xl object-cover border border-[#4E878C]/40 shadow-md shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold font-serif tracking-wide text-[#FAF7F2] leading-tight">
                L'ÉCLAT POS
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#4E878C] leading-tight">
                Cashier Checkout System
              </span>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2A4747] text-white shadow-md border border-[#4E878C]/50'
                      : 'text-[#FAF7F2]/80 hover:bg-[#2A4747]/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#4E878C]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions: Bell Icon Button & User Profile Card */}
          <div className="flex items-center gap-2.5">
            {/* Bell Icon Notification Button */}
            <Link
              to="/cashier/notifications"
              className="p-2 rounded-xl bg-[#2A4747] border border-[#4E878C]/40 hover:border-[#4E878C] hover:bg-[#2A4747]/80 transition-all cursor-pointer relative text-white flex items-center justify-center shrink-0"
              title="Thông Báo Chỉ Đạo"
            >
              <Bell className="w-4.5 h-4.5 text-[#4E878C]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Badge */}
            <Link
              to="/cashier/profile"
              className="p-1.5 rounded-xl bg-[#2A4747]/60 border border-[#4E878C]/30 hover:border-[#4E878C] hover:bg-[#2A4747] transition-all cursor-pointer shadow-sm group flex items-center justify-center shrink-0"
              title={`Hồ sơ: ${user?.fullName || 'Thu Ngân'}`}
            >
              <div className="h-7 w-7 rounded-lg bg-[#4E878C] group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>

        </div>

        {/* Sub-menu Mobile Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 gap-2 border-t border-[#4E878C]/20 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${
                  isActive ? 'bg-[#2A4747] text-white border border-[#4E878C]/50' : 'text-[#FAF7F2]/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#4E878C]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
