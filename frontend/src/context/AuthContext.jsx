import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('roxiler_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('roxiler_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem('roxiler_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error('Failed to verify user session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: authUser, token: authToken } = res.data.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('roxiler_token', authToken);
      localStorage.setItem('roxiler_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.message || 'Login failed.');
  };

  const signup = async (formData) => {
    const res = await api.post('/auth/signup', formData);
    if (res.data.success) {
      const { user: authUser, token: authToken } = res.data.data;
      setUser(authUser);
      setToken(authToken);
      localStorage.setItem('roxiler_token', authToken);
      localStorage.setItem('roxiler_user', JSON.stringify(authUser));
      return authUser;
    }
    throw new Error(res.data.message || 'Signup failed.');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const res = await api.patch('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('roxiler_token');
    localStorage.removeItem('roxiler_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        signup,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
