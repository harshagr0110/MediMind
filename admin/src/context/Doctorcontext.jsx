import { createContext, useState, useEffect } from "react";
import axios from "axios";
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
                    alert('Session expired, please log in again.');
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const getAppointments = async () => {
        try {
            const response = await axios.get(`${backendurl}/api/doctor/appointments`, {
                headers: {
                    Authorization: `Bearer ${dToken}`,
                },
            });
            if (response.data.success) {
                setAppointments(response.data.appointments);
            } else {
                console.error('Error fetching appointments:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    }

    const value = {
        dToken,
        setDToken,
        backendurl,
        appointments,
        getAppointments
    };

    return (
        <DoctorContext.Provider value={value}>
            {children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;