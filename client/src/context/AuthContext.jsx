import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('orhims_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      setUser(res.data);
      localStorage.setItem('orhims_user', JSON.stringify(res.data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('orhims_user');
  };

  // Quick switch function for vendor evaluation presentation
  const demoLogin = async (username) => {
    return await login(username, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, demoLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
