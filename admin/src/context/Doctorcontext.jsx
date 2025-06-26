import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  // Initialize from localStorage so refresh doesn't clear token
  const [dToken, setDToken] = useState(() => localStorage.getItem('doctor_token') || '');
  const [loading, setLoading] = useState(true);

  // On mount, ensure token is set from localStorage (for SSR or hydration)
  useEffect(() => {
    const token = localStorage.getItem('doctor_token') || '';
    setDToken(token);
    setLoading(false);
  }, []);

  // Whenever dToken changes, update localStorage and axios default header
  useEffect(() => {
    if (dToken) {
      localStorage.setItem('doctor_token', dToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${dToken}`;
    } else {
      localStorage.removeItem('doctor_token');
      delete axios.defaults.headers.common['Authorization'];
    }
    // console.log('DoctorContext dToken:', dToken);
  }, [dToken]);

  const logout = () => {
    setDToken('');
    localStorage.removeItem('doctor_token');
    window.location.reload();
  };

  if (loading) return null; // Prevent children from rendering until token is restored

  return (
    <DoctorContext.Provider value={{ dToken, setDToken, logout }}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider; 