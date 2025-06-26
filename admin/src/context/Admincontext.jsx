import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  // Initialize from localStorage so refresh doesn't clear token
  const [aToken, setAToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [loading, setLoading] = useState(true);

  // On mount, ensure token is set from localStorage (for SSR or hydration)
  useEffect(() => {
    const token = localStorage.getItem('admin_token') || '';
    setAToken(token);
    setLoading(false);
  }, []);

  // Whenever aToken changes, update localStorage and axios default header
  useEffect(() => {
    if (aToken) {
      localStorage.setItem('admin_token', aToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${aToken}`;
    } else {
      localStorage.removeItem('admin_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [aToken]);

  const logout = () => {
    setAToken('');
    localStorage.removeItem('admin_token');
    window.location.reload();
  };

  if (loading) return null; // Prevent children from rendering until token is restored

  return (
    <AdminContext.Provider value={{ aToken, setAToken, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider; 