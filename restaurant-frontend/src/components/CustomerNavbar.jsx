import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import NotificationDropdown from './NotificationDropdown';
import { User, Search, ShoppingBag, Menu, X, Calendar, MapPin } from 'lucide-react';

export default function CustomerNavbar({ search, setSearch }) {
  const { user } = useAuth();
  const { itemCount, setIsCartOpen, selectedTable } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#4A2810] via-[#8C3A27] to-[#4A2810] text-white shadow-xl border-b border-[#E07A5F]/30 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* 1. BRAND LOGO */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="L'ÉCLAT Logo"
              className="h-11 w-11 rounded-xl object-cover shadow-md border border-[#E07A5F]/40 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-wider text-[#FAF7F2] font-serif group-hover:text-[#E07A5F] transition-colors">
                L'ÉCLAT Gastronomie
              </span>
              <span className="text-[9px] text-[#E07A5F] uppercase tracking-widest font-mono font-semibold">
                Haute Cuisine & Dining
              </span>
            </div>
          </Link>

          {/* 2. SEARCH BAR & MAIN NAVIGATION */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0">
            {/* Quick Search */}
            <div className="relative w-44 xl:w-60 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E07A5F] pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm món ngon..."
                value={search || ''}
                onChange={(e) => setSearch && setSearch(e.target.value)}
                className="w-full bg-[#3B1F0B]/60 border border-[#E07A5F]/35 rounded-2xl py-2 pl-9 pr-7 text-xs text-white placeholder:text-[#FAF7F2]/50 focus:outline-none focus:border-[#E07A5F] focus:ring-1 focus:ring-[#E07A5F] transition-all shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch && setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Nav Links */}
            <nav className="flex items-center gap-5 xl:gap-7 text-xs font-bold uppercase tracking-widest leading-none">
              <Link
                to="/"
                className={`transition-colors py-1.5 relative ${
                  isActive('/') ? 'text-[#E07A5F] font-black' : 'text-[#FAF7F2] hover:text-[#E07A5F]'
                }`}
              >
                Trang Chủ
              </Link>
              <Link
                to="/menu"
                className={`transition-colors py-1.5 relative ${
                  isActive('/menu') ? 'text-[#E07A5F] font-black' : 'text-[#FAF7F2] hover:text-[#E07A5F]'
                }`}
              >
                Thực Đơn
              </Link>
              <Link
                to="/orders"
                className={`transition-colors py-1.5 relative ${
                  isActive('/orders') ? 'text-[#E07A5F] font-black' : 'text-[#FAF7F2] hover:text-[#E07A5F]'
                }`}
              >
                Đơn Hàng
              </Link>
              <Link
                to="/reservation"
                className={`transition-colors py-1.5 relative ${
                  isActive('/reservation') ? 'text-[#E07A5F] font-black' : 'text-[#FAF7F2] hover:text-[#E07A5F]'
                }`}
              >
                Đặt Bàn
              </Link>
            </nav>
          </div>

          {/* 3. RIGHT ACTION CLUSTER */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            
            {/* Table Badge Indicator (If dining in) */}
            {selectedTable && (
              <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3B1F0B]/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold font-mono shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{selectedTable.tableName}</span>
              </span>
            )}

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#3B1F0B] border border-[#E07A5F]/40 text-white hover:border-[#E07A5F] hover:bg-[#4A2810] transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-[#FAF7F2]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#E07A5F] text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Đặt Bàn Ngay CTA Button */}
            <Link
              to="/reservation"
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#E07A5F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c9664c] transition-all shadow-md active:scale-95 whitespace-nowrap leading-none border border-[#E07A5F]/40"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>Đặt Bàn Ngay</span>
            </Link>

            {/* User Profile Button */}
            {user ? (
              <Link
                to="/profile"
                className="h-10 w-10 rounded-xl bg-[#3B1F0B] border border-[#E07A5F]/40 flex items-center justify-center text-[#E07A5F] hover:border-[#E07A5F] hover:bg-[#4A2810] transition-all shadow-md shrink-0"
                title={`Tài khoản: ${user.fullName || 'Thành viên'}`}
              >
                <User className="w-5 h-5 text-[#E07A5F]" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3B1F0B] border border-[#E07A5F]/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:border-[#E07A5F] transition-all shrink-0"
              >
                <User className="w-4 h-4 text-[#E07A5F]" />
                <span>Đăng Nhập</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#E07A5F] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E07A5F]/30 flex flex-col gap-3 text-xs font-bold uppercase tracking-wider animate-fade-in bg-[#4A2810] px-4 rounded-b-2xl mb-2">
            <input
              type="text"
              placeholder="Tìm kiếm món ngon..."
              value={search || ''}
              onChange={(e) => setSearch && setSearch(e.target.value)}
              className="w-full bg-[#3B1F0B] border border-[#E07A5F]/40 rounded-xl py-2 px-3 text-xs text-white mb-2"
            />
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-[#FAF7F2] py-1.5 hover:text-[#E07A5F]">Trang chủ</Link>
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="text-[#FAF7F2] py-1.5 hover:text-[#E07A5F]">Thực đơn</Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-[#FAF7F2] py-1.5 hover:text-[#E07A5F]">Đơn hàng</Link>
            <Link to="/reservation" onClick={() => setMobileMenuOpen(false)} className="text-[#E07A5F] py-1.5 font-black">Đặt Bàn Ngay</Link>
          </div>
        )}
      </div>
    </header>
  );
}
