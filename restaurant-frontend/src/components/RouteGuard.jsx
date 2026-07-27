import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only allows authenticated users
export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Only allows unauthenticated users (e.g. Login, Register, Forgot Password)
export const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
      </div>
    );
  }

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// Protects routes by specific roles (e.g. Admin, Manager)
export const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF7F2]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
      </div>
    );
  }

  const hasRole = user && user.roles.some((role) => allowedRoles.includes(role));

  return hasRole ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
