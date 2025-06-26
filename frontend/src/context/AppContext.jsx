import React, { createContext, useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // VITE_BACKEND_URL should be set in the frontend .env file (e.g., .env or .env.local)
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [userData, setUserData] = useState(null);

  // Axios interceptor for global 401 handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          setToken('');
          setUserId('');
          setUserData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          toast.error('Session expired, please log in again.', { position: 'top-center' });
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/doctor/list`);
      if (data.success) setDoctors(data.doctors);
    } catch {
      setDoctors([]);
    }
  };
 
  useEffect(() => {
    getDoctorsData();
  }, []);

  const getUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/user/get-profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) setUserData(data.data);
      else {
        setUserData(null);
        toast.error(data.message);
      }
    } catch (err) {
      setUserData(null);
      // If 401, interceptor will handle logout and toast
      if (!err.response || err.response.status !== 401) {
        toast.error("Something went wrong");
      }
    }
  };

  useEffect(() =>  {
    if (token) getUserProfileData();
    else setUserData(null);
  }, [token]);

  // Remove appointment by ID
  const removeAppointment = async (id) => {
    try {
      const { data } = await axios.delete(`${backendurl}/api/user/delete-appointment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success('Appointment removed successfully');
        return true;
      } else {
        toast.error(data.message || 'Failed to remove appointment');
        return false;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove appointment');
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      backendurl, doctors, getDoctorsData,
      token, setToken, userId, setUserId,
      userData,setUserData,
      removeAppointment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;