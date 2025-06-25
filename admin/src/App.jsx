import React from "react";
import AdminContextProvider from "./context/Admincontext";
import DoctorContextProvider from "./context/Doctorcontext";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import AddDoctors from "./pages/admin/AddDoctors";
import Dashboard from "./pages/admin/Dashboard";
import DoctorsList from "./pages/admin/DoctorsList";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorAppointment from "./pages/doctor/DoctorAppointment";
import { AdminContext } from "./context/Admincontext";
import { DoctorContext } from "./context/Doctorcontext";
import { useContext } from "react";

function AppRoutes({ backendurl }) {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      <ToastContainer />
      {aToken ? (
        <>
          <Navbar />
          <div className="flex items-start">
            <Sidebar />
            <div className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/admin-dashboard" />} />
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/add-doctor" element={<AddDoctors />} />
                <Route path="/doctor-list" element={<DoctorsList />} />
                <Route path="*" element={<Navigate to="/admin-dashboard" />} />
              </Routes>
            </div>
          </div>
        </>
      ) : dToken ? (
        <>
          <Navbar />
          <div className="flex items-start">
            <Sidebar />
            <div className="flex-1 p-6 pt-28">
              <Routes>
                <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor-profile" element={<DoctorProfile />} />
                <Route path="/doctor-appointment" element={<DoctorAppointment />} />
                <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <>
          <Login backendurl={backendurl} />
          <Routes>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      )}
    </div>
  );
}

function App({ backendurl }) {
  return (
    <AdminContextProvider>
      <DoctorContextProvider>
        <AppRoutes backendurl={backendurl} />
      </DoctorContextProvider>
    </AdminContextProvider>
  );
}

export default App;