import React, { createContext, useState, useEffect } from 'react';

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const [dToken, setDToken] = useState(localStorage.getItem('doctor_token') || '');

  useEffect(() => {
    if (dToken) {
      localStorage.setItem('doctor_token', dToken);
    } else {
      localStorage.removeItem('doctor_token');
    }
  }, [dToken]);

  const logout = () => setDToken('');

  return (
    <DoctorContext.Provider value={{ dToken, setDToken, logout }}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider; 