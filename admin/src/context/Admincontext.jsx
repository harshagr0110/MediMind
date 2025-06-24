// src/context/AdminContext.jsx

import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
    const navigate = useNavigate();
    const backendurl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    setToken("");
                    localStorage.removeItem("admin_token");
                    navigate("/login");
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [token, navigate]);

    const logout = () => {
        setToken("");
        localStorage.removeItem("admin_token");
        navigate("/login");
    };

    const contextValue = {
        token,
        setToken,
        backendurl,
        logout,
    };

    return (
        <AdminContext.Provider value={contextValue}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
