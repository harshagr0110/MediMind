import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AdminContextProvider from './context/Admincontext.jsx';
import DoctorContextProvider from './context/Doctorcontext.jsx';
import './index.css';

const backendurl = import.meta.env.VITE_BACKEND_URL;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminContextProvider>
        <DoctorContextProvider>
          <App backendurl={backendurl} />
        </DoctorContextProvider>
      </AdminContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
