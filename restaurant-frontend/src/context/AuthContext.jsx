import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Synchronize authentication logout event from API interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  // Verify session on application load
  useEffect(() => {
    const checkCurrentUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          if (response.data && response.data.success) {
            const userData = response.data.data;
            const updatedUser = {
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName,
              phone: userData.phone,
              avatar: userData.avatarUrl || userData.avatar || null,
              avatarUrl: userData.avatarUrl || userData.avatar || null,
              roles: userData.roles,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          // Token refresh interceptor will handle clearing storage if refresh also fails
        }
      }
      setLoading(false);
    };

    checkCurrentUser();
  }, []);

  const updateUser = (nextUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...nextUserData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data && response.data.success) {
        const authData = response.data.data;
        const loggedUser = {
          id: authData.id,
          email: authData.email,
          fullName: authData.fullName,
          phone: authData.phone,
          avatar: authData.avatarUrl || authData.avatar || null,
          avatarUrl: authData.avatarUrl || authData.avatar || null,
          roles: authData.roles,
        };

        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        setUser(loggedUser);
        return response.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, phone) => {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        fullName,
        phone,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('letoile_cart_items');
      localStorage.removeItem('letoile_cart_voucher');
      setUser(null);
      setLoading(false);
      window.location.href = '/login';
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/api/auth/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
