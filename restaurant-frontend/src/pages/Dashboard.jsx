import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(newPassword)) {
      setError('Mật khẩu mới cần 8–72 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to change password. Old password may be incorrect.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans pb-12">
      
      {/* Premium Elegant Navbar */}
      <header className="sticky top-0 z-50 bg-[#4A121A] text-white shadow-md border-b-2 border-[#C5A059]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-11 w-11 rounded-xl object-cover border border-[#C5A059] shadow-lg" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wider text-[#FAF7F2] font-serif">L'ÉCLAT Restaurant</span>
                <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-semibold font-sans mt-0.5">Management Portal</span>
              </div>
            </div>

            {/* Profile widget and Log out */}
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col text-right">
                <div className="text-sm font-semibold text-[#FAF7F2]">{user?.fullName || 'User'}</div>
                <div className="text-[11px] text-[#C5A059] uppercase tracking-wider mt-0.5 font-bold">
                  {user?.roles?.map(r => r.replace('ROLE_', '')).join(', ')}
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#C5A059] hover:border-transparent transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Decorative Executive Banner */}
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-[#4A121A] via-[#350d13] to-[#1B3B2B] p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-[#C5A059]/20">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
          <div className="relative z-10">
            <span className="text-[#C5A059] text-xs font-bold uppercase tracking-widest block mb-2">Welcome Back</span>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-serif">{user?.fullName || 'Crew Member'}</h1>
            <p className="text-[#FAF7F2]/80 text-sm md:text-base max-w-xl font-light leading-relaxed">
              L'ÉCLAT operation status is optimal. You are logged in with credential clearance to modify passwords and review administrative parameters.
            </p>
          </div>
        </div>

        {/* Executive Stats Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="restaurant-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-[#6E6564] uppercase tracking-wider mb-2">Access Scope</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user?.roles?.map((role) => (
                    <span key={role} className="inline-block bg-[#FAF7F2] text-[#4A121A] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#E8E2D9]">
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-2.5 bg-[#4A121A]/10 text-[#4A121A] rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="restaurant-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-[#6E6564] uppercase tracking-wider mb-2">Dining Area</p>
                <h3 className="text-3xl font-bold font-serif text-[#1B3B2B]">12 / 20</h3>
                <p className="text-[10px] text-green-600 mt-1.5 font-bold uppercase tracking-wider">Occupied Tables</p>
              </div>
              <div className="p-2.5 bg-[#1B3B2B]/10 text-[#1B3B2B] rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="restaurant-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-[#6E6564] uppercase tracking-wider mb-2">Pending Tickets</p>
                <h3 className="text-3xl font-bold font-serif text-[#C5A059]">05 Orders</h3>
                <p className="text-[10px] text-[#C5A059] mt-1.5 font-bold uppercase tracking-wider">Kitchen Processing</p>
              </div>
              <div className="p-2.5 bg-[#C5A059]/10 text-[#C5A059] rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="restaurant-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-[#6E6564] uppercase tracking-wider mb-2">Operations State</p>
                <h3 className="text-3xl font-bold font-serif text-green-700">Online</h3>
                <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider font-bold">Services Healthy</p>
              </div>
              <div className="p-2.5 bg-green-50 text-green-700 rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2m-14 0a2 2 0 002 2h10a2 2 0 002-2M7 8h10M7 16h10" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
          
          {/* Card: Account info */}
          <div className="restaurant-card p-8 lg:col-span-1 border-t-4 border-t-[#1B3B2B]">
            <h2 className="text-2xl font-bold text-[#4A121A] font-serif mb-6 flex items-center gap-2.5 pb-2 border-b border-[#E8E2D9]">
              <svg className="h-5 w-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Card
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#6E6564] uppercase tracking-widest">Full Name</label>
                <p className="font-semibold text-gray-800 text-lg mt-0.5">{user?.fullName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6E6564] uppercase tracking-widest">Email Address</label>
                <p className="font-semibold text-gray-700 mt-0.5">{user?.email}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6E6564] uppercase tracking-widest">Clearance Level</label>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {user?.roles?.map((role) => (
                    <span key={role} className="inline-block bg-[#1B3B2B]/10 text-[#1B3B2B] text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#6E6564] uppercase tracking-widest">System Identifier</label>
                <p className="font-mono text-xs text-[#C5A059] mt-0.5 font-bold">UID-{String(user?.id || 0).padStart(4, '0')}</p>
              </div>
            </div>
          </div>

          {/* Card: Change Password Form */}
          <div className="restaurant-card p-8 lg:col-span-2 border-t-4 border-t-[#4A121A]">
            <h2 className="text-2xl font-bold text-[#4A121A] font-serif mb-6 flex items-center gap-2.5 pb-2 border-b border-[#E8E2D9]">
              <svg className="h-5 w-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Credentials Management
            </h2>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex items-start gap-2.5">
                <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-100 flex items-start gap-2.5">
                <svg className="h-5 w-5 shrink-0 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1.5" htmlFor="oldPassword">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1.5" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    minLength="8"
                    maxLength="72"
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6564] uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Verify new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-accent text-white py-3 px-6 mt-4 flex justify-center text-xs font-bold tracking-wider uppercase"
              >
                {loading ? 'Updating Credentials...' : 'Change Password'}
              </button>
            </form>

          </div>

        </div>

      </main>

    </div>
  );
}
