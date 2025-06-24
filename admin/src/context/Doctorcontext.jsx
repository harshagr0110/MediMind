import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
    const backendurl = import.meta.env.VITE_BACKEND_URL;
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '');
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    setDToken('');
                    localStorage.removeItem('dToken');
                    toast.error('Session expired, please log in again.');
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const getAppointments = useCallback(async () => {
        try {
            const response = await axios.get(`${backendurl}/api/doctor/appointments`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (response.data.success) {
                setAppointments(response.data.appointments);
            } else {
                toast.error(response.data.message || 'Error fetching appointments');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error fetching appointments');
        }
    }, [dToken, backendurl]);

    const value = {
        dToken,
        setDToken,
        backendurl,
        appointments,
        getAppointments
    };

    return (
        <DoctorContext.Provider value={value}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;