import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  CalendarCheck,
  Users,
  Bell,
  User,
  LogOut
} from 'lucide-react';

export default function WaiterNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/staff-notifications/unread-count', { params: { role: 'ROLE_WAITER' } });
        if (res.data && res.data.data) {
          setUnreadCount(res.data.data.count || 0);
        }
      } catch (e) {
        // silent
      }
    };
    fetchUnreadCount();
  }, []);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/waiter/dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { path: '/waiter/tables', label: 'Sơ Đồ Bàn', icon: Utensils },
    { path: '/waiter/orders', label: 'Đơn Hàng', icon: ClipboardList },
    { path: '/waiter/reservations', label: 'Lịch Đặt Bàn', icon: CalendarCheck },
    { path: '/waiter/customers', label: 'Thực Khách', icon: Users },
  ];

  return (
    <header className="bg-[#222E21] text-[#FAF7F2] border-b border-[#708238]/30 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Waiter Role Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-9 w-9 rounded-xl object-cover border border-[#708238]/40 shadow-md shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold font-serif tracking-wide text-[#FAF7F2] leading-tight">
                L'ÉCLAT POS
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#708238] leading-tight">
                Waiter Portal
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
                      ? 'bg-[#3B4A39] text-white shadow-md border border-[#708238]/50'
                      : 'text-[#FAF7F2]/80 hover:bg-[#3B4A39]/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#708238]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions: Bell Icon Button, User Profile & Logout Button */}
          <div className="flex items-center gap-2.5">
            {/* Bell Icon Notification Button */}
            <Link
              to="/waiter/notifications"
              className="p-2 rounded-xl bg-[#3B4A39] border border-[#708238]/40 hover:border-[#708238] hover:bg-[#3B4A39]/80 transition-all cursor-pointer relative text-white flex items-center justify-center shrink-0"
              title="Thông Báo Chỉ Đạo"
            >
              <Bell className="w-4.5 h-4.5 text-[#708238]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Badge */}
            <Link
              to="/waiter/profile"
              className="p-1.5 rounded-xl bg-[#3B4A39]/60 border border-[#708238]/30 hover:border-[#708238] hover:bg-[#3B4A39] transition-all cursor-pointer shadow-sm group flex items-center justify-center shrink-0"
              title={`Hồ sơ: ${user?.fullName || 'Phục Vụ'}`}
            >
              <div className="h-7 w-7 rounded-lg bg-[#708238] group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="p-2 rounded-xl bg-[#8C3A27] text-white hover:bg-red-700 transition-all cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold shrink-0 active:scale-95"
              title="Đăng Xuất Tài Khoản"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>

        </div>

        {/* Sub-menu Mobile Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 gap-2 border-t border-[#708238]/20 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${
                  isActive ? 'bg-[#3B4A39] text-white border border-[#708238]/50' : 'text-[#FAF7F2]/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#708238]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
