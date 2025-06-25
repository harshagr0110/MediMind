import React, { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem('admin_token') || '');

  useEffect(() => {
    if (aToken) {
      localStorage.setItem('admin_token', aToken);
    } else {
      localStorage.removeItem('admin_token');
    }
  }, [aToken]);

  const logout = () => setAToken('');

  return (
    <AdminContext.Provider value={{ aToken, setAToken, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider; 