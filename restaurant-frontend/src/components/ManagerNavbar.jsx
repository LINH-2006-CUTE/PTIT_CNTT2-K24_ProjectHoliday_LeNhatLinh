import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  Package,
  Truck,
  Ticket,
  Crown,
  FileSpreadsheet,
  LineChart,
  Bell,
  User
} from 'lucide-react';

export default function ManagerNavbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/staff-notifications/unread-count', { params: { role: 'ROLE_MANAGER' } });
        if (res.data && res.data.data) {
          setUnreadCount(res.data.data.count || 0);
        }
      } catch (e) {
        // silent catch
      }
    };
    fetchUnreadCount();
  }, []);

  const navItems = [
    { path: '/manager/dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { path: '/manager/employees', label: 'Nhân Viên', icon: Users },
    { path: '/manager/orders', label: 'Đơn Hàng', icon: ClipboardList },
    { path: '/manager/reservations', label: 'Đặt Bàn', icon: CalendarCheck },
    { path: '/manager/inventory', label: 'Kho Hàng', icon: Package },
    { path: '/manager/promotions', label: 'Khuyến Mãi', icon: Ticket },
    { path: '/manager/customers', label: 'Thực Khách', icon: Crown },
    { path: '/manager/reports', label: 'Báo Cáo', icon: FileSpreadsheet },
    { path: '/manager/analytics', label: 'Thống Kê', icon: LineChart },
  ];

  return (
    <header className="bg-[#0F172A] text-[#FAF7F2] border-b border-[#C5A059]/30 sticky top-0 z-50 shadow-2xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* 1. Brand Logo & Manager Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-9 w-9 rounded-xl object-cover border border-[#C5A059]/50 shadow-lg shrink-0" />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-sm font-bold font-serif tracking-wide text-[#FAF7F2] leading-tight whitespace-nowrap">
                L'ÉCLAT Executive
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059] leading-tight whitespace-nowrap">
                Operations Portal
              </span>
            </div>
          </div>

          {/* 2. Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#1E2A38] text-white shadow-md border border-[#C5A059]/60'
                      : 'text-[#FAF7F2]/80 hover:bg-[#1E2A38]/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right Header Actions: Bell Notification Icon & User Profile Card */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bell Icon Notification Button */}
            <Link
              to="/manager/notifications"
              className="p-2 rounded-xl bg-[#1E2A38] border border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#1E2A38]/90 transition-all cursor-pointer relative text-white flex items-center justify-center shrink-0"
              title="Thông Báo Chỉ Đạo"
            >
              <Bell className="w-4.5 h-4.5 text-[#C5A059]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Badge with Unified Lucide User Icon */}
            <Link
              to="/manager/profile"
              className="p-1.5 rounded-xl bg-[#1E2A38] border border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#1E2A38]/90 transition-all cursor-pointer shadow-sm group shrink-0 flex items-center justify-center"
              title={`Hồ sơ: ${user?.fullName || 'Quản Lý'}`}
            >
              <div className="h-7 w-7 rounded-lg bg-[#C5A059] group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-[#0F172A] text-xs shrink-0 shadow-xs">
                <User className="w-4 h-4 text-[#0F172A]" />
              </div>
            </Link>
          </div>

        </div>

        {/* 4. Sub-menu Mobile Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1.5 border-t border-[#C5A059]/20 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 shrink-0 ${
                  isActive ? 'bg-[#1E2A38] text-white border border-[#C5A059]/50' : 'text-[#FAF7F2]/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
