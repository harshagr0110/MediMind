import React, { useState } from "react";
import AdminContextProvider from "./context/Admincontext";
import DoctorContextProvider from "./context/Doctorcontext";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import AddDoctors from "./pages/admin/AddDoctors";
import AddDoctor from "./pages/admin/AddDoctor";
import AddArticle from "./pages/admin/AddArticle";
import Dashboard from "./pages/admin/Dashboard";
import DoctorsList from "./pages/admin/DoctorsList";
import Articles from "./pages/admin/Articles";
import Profile from "./pages/admin/Profile";
import Settings from "./pages/admin/Settings";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/Profile";
import DoctorAppointment from "./pages/doctor/DoctorAppointment";
import { AdminContext } from "./context/Admincontext";
import { DoctorContext } from "./context/Doctorcontext";
import { useContext } from "react";

function AppRoutes() {
  const { aToken, logout: adminLogout } = useContext(AdminContext);
  const { dToken, logout: doctorLogout } = useContext(DoctorContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!aToken && !dToken) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-200">
        <ToastContainer />
        <Login />
      </div>
    );
  }

  const isAdmin = !!aToken;
  const isDoctor = !!dToken;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-200">
      <ToastContainer />
      <Navbar
        role={isAdmin ? "admin" : "doctor"}
        onLogout={isAdmin ? adminLogout : doctorLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          role={isAdmin ? "admin" : "doctor"}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 md:p-10 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
          <Routes>
            {isAdmin && (
              <>
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/doctor-list" element={<DoctorsList />} />
                <Route path="/add-doctor" element={<AddDoctor />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/add-article" element={<AddArticle />} />
                <Route path="/admin-profile" element={<Profile />} />
                <Route path="/admin-settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin-dashboard" />} />
              </>
            )}
            {isDoctor && (
              <>
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor-appointment" element={<DoctorAppointment />} />
                <Route path="/doctor-profile" element={<DoctorProfile />} />
                <Route path="/doctor-settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/doctor-dashboard" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AdminContextProvider>
      <DoctorContextProvider>
        <AppRoutes />
      </DoctorContextProvider>
    </AdminContextProvider>
  );
}

export default App;