import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  ChefHat,
  Flame,
  CheckCheck,
  Bell,
  User,
  LogOut,
  Package
} from 'lucide-react';

export default function ChefNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/api/staff-notifications/unread-count', { params: { role: 'ROLE_CHEF' } });
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
    { path: '/chef/dashboard', label: 'Bảng Điều Phối', icon: LayoutDashboard },
    { path: '/chef/queue', label: 'Hàng Chờ Nấu', icon: Flame },
    { path: '/chef/orders', label: 'Quản Lý Đơn', icon: ChefHat },
    { path: '/chef/inventory', label: 'Kho Nguyên Liệu', icon: Package },
    { path: '/chef/completed', label: 'Lịch Sử Hoàn Thành', icon: CheckCheck },
  ];

  return (
    <header className="bg-[#3A1C14] text-[#FAF7F2] border-b border-[#D97706]/30 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Chef Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-9 w-9 rounded-xl object-cover border border-[#D97706]/40 shadow-md shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold font-serif tracking-wide text-[#FAF7F2] leading-tight">
                L'ÉCLAT KDS
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#D97706] leading-tight">
                Hệ Thống Bếp Trưởng
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
                      ? 'bg-[#7A2E1E] text-white shadow-md border border-[#D97706]/50'
                      : 'text-[#FAF7F2]/80 hover:bg-[#7A2E1E]/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#D97706]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions: Bell Icon Button, User Profile & Logout Button */}
          <div className="flex items-center gap-2.5">
            {/* Bell Icon Notification Button */}
            <Link
              to="/chef/notifications"
              className="p-2 rounded-xl bg-[#7A2E1E] border border-[#D97706]/40 hover:border-[#D97706] hover:bg-[#7A2E1E]/80 transition-all cursor-pointer relative text-white flex items-center justify-center shrink-0"
              title="Thông Báo Chỉ Đạo Bếp"
            >
              <Bell className="w-4.5 h-4.5 text-[#D97706]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Button */}
            <Link
              to="/chef/profile"
              className="p-2 rounded-xl bg-[#7A2E1E]/80 border border-[#D97706]/40 hover:border-[#D97706] hover:bg-[#7A2E1E] transition-all cursor-pointer shadow-md group flex items-center justify-center shrink-0"
              title={`Hồ sơ cá nhân: ${user?.fullName || 'Bếp Trưởng'}`}
            >
              <div className="h-7 w-7 rounded-lg bg-[#D97706] group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>

          </div>

        </div>

        {/* Sub-menu Mobile Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 gap-2 border-t border-[#D97706]/20 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${
                  isActive ? 'bg-[#7A2E1E] text-white border border-[#D97706]/50' : 'text-[#FAF7F2]/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
