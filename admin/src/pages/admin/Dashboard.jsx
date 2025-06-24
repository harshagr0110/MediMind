import React, { useEffect, useContext, useState } from "react";
import { AdminContext } from "../../context/Admincontext";
import axios from "axios";

// Toast notification (simple, tailwind-based)
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg flex items-center gap-3
      ${type === "success"
        ? "bg-green-100 text-green-800 border border-green-300"
        : "bg-red-100 text-red-800 border border-red-300"
      }`}
  >
    <span>{message}</span>
    <button className="ml-2 text-xl leading-none" onClick={onClose}>&times;</button>
  </div>
);

const Dashboard = () => {
  const { aToken, backendurl } = useContext(AdminContext);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendurl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      if (data.success) {
        setDoctors(data.doctors);
        setAppointments(data.appointments);
        setUsers(data.users);
        showToast("Dashboard data loaded!", "success");
      } else {
        showToast("Failed to load dashboard data.", "error");
      }
    } catch (error) {
      showToast("Error fetching dashboard data.", "error");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (aToken) getData();
    // eslint-disable-next-line
  }, [aToken]);

  const totalRevenue = appointments.reduce(
    (sum, appt) => (appt.paymentStatus === "paid" ? sum + appt.amount : sum),
    0
  );
  const pendingPayments = appointments.filter(
    (appt) => appt.paymentStatus === "pending"
  ).length;
  const completedAppointments = appointments.filter((appt) => appt.isCompleted)
    .length;
  const cancelledAppointments = appointments.filter((appt) => appt.cancelled)
    .length;

  if (loading) {
    return (
      <div className="w-full h-2 bg-blue-100 rounded animate-pulse mt-4 mb-8" />
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center pt-28 px-2">
      {/* Boxed Main Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow">Admin Dashboard</h1>
          <button
            onClick={getData}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-200 transition"
          >
            Refresh
          </button>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-400">
            <div className="bg-blue-100 text-blue-700 rounded-full p-3 mb-2 shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
            </div>
            <div className="text-gray-500 text-xs">Users</div>
            <div className="text-2xl font-bold text-blue-900">{users.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-teal-400">
            <div className="bg-teal-100 text-teal-700 rounded-full p-3 mb-2 shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2c0-1.1-.9-2-2-2zm0 10c-4.41 0-8-1.79-8-4V6c0-2.21 3.59-4 8-4s8 1.79 8 4v8c0 2.21-3.59 4-8 4z" /></svg>
            </div>
            <div className="text-gray-500 text-xs">Doctors</div>
            <div className="text-2xl font-bold text-teal-900">{doctors.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-orange-400">
            <div className="bg-orange-100 text-orange-700 rounded-full p-3 mb-2 shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div className="text-gray-500 text-xs">Appointments</div>
            <div className="text-2xl font-bold text-orange-700">{appointments.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-green-400">
            <div className="bg-green-100 text-green-700 rounded-full p-3 mb-2 shadow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2c0-1.1-.9-2-2-2zm0 10c-4.41 0-8-1.79-8-4V6c0-2.21 3.59-4 8-4s8 1.79 8 4v8c0 2.21-3.59 4-8 4z" /></svg>
            </div>
            <div className="text-gray-500 text-xs">Revenue</div>
            <div className="text-2xl font-bold text-green-700">₹{totalRevenue}</div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Recent Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.slice(0, 6).map((appointment, idx) => (
              <div
                key={appointment._id}
                className="flex flex-col gap-4 bg-blue-50 rounded-xl p-5 border border-blue-100 shadow hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={appointment.userData?.image}
                    alt={appointment.userData?.fullName}
                    className="w-12 h-12 rounded-full border-2 border-blue-200 shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-blue-900 truncate">{appointment.userData?.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">Patient</div>
                  </div>
                  <span className="mx-2 text-blue-300 font-bold text-xl">→</span>
                  <img
                    src={appointment.docData?.image}
                    alt={appointment.docData?.fullName}
                    className="w-12 h-12 rounded-full border-2 border-teal-200 shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-teal-800 truncate">{appointment.docData?.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">Doctor</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between mt-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {appointment.slotDate?.replace(/_/g, "/")} at {appointment.slotTime}
                  </span>
                  <span className="text-teal-700 font-bold text-lg">₹{appointment.amount}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow
                    ${appointment.cancelled ? 'bg-red-100 text-red-600' : appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {appointment.cancelled ? 'Cancelled' : appointment.paymentStatus === 'paid' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-teal-700">{completedAppointments}</div>
              <div className="text-gray-500 text-xs">Completed</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-yellow-700">{pendingPayments}</div>
              <div className="text-gray-500 text-xs">Pending Payment</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-red-700">{cancelledAppointments}</div>
              <div className="text-gray-500 text-xs">Cancelled</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-extrabold text-blue-700">{appointments.length}</div>
              <div className="text-gray-500 text-xs">Total Appointments</div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Dashboard;
