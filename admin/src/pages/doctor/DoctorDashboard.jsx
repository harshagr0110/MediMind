import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { DoctorContext } from '../../context/Doctorcontext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const DoctorDashboard = () => {
  const { dToken } = useContext(DoctorContext);
  const [stats, setStats] = useState({ appointments: 0, earnings: 0, patients: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${dToken}` },
        });
        setStats({
          appointments: data.data?.totalAppointments || 0,
          earnings: data.data?.totalEarnings || 0,
          patients: data.data?.totalPatients || 0,
        });
        setUpcoming(data.data?.upcomingAppointments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // Auto-refresh every 5 seconds to show updated stats
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [dToken]);

  return (
    <div className="py-8 px-2 md:px-8 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-8 tracking-tight">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-700 mb-2">Appointments</div>
          <div className="text-5xl font-extrabold text-black">{loading ? <Spinner /> : stats.appointments}</div>
        </div>
        <div className="bg-white border border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-700 mb-2">Patients</div>
          <div className="text-5xl font-extrabold text-black">{loading ? <Spinner /> : stats.patients}</div>
        </div>
        <div className="bg-white border border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-700 mb-2">Earnings</div>
          <div className="text-5xl font-extrabold text-black">{loading ? <Spinner /> : `₹${Number(stats.earnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Upcoming Appointments */}
        <div className="flex-1 bg-white border border-gray-200 p-8 overflow-x-auto">
          <h2 className="text-xl font-bold text-black mb-4">Upcoming Appointments</h2>
          {loading ? <Spinner /> : upcoming.length === 0 ? (
            <div className="text-gray-500">No upcoming appointments.</div>
          ) : (
            <table className="w-full min-w-[400px] text-left border-t border-gray-100">
              <thead>
                <tr className="text-gray-700 border-b">
                  <th className="py-2">Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 3).map((app, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-2 font-medium text-gray-900 whitespace-nowrap">{app.patientName}</td>
                    <td className="py-2 text-gray-700 whitespace-nowrap">{app.date}</td>
                    <td className="py-2 text-gray-700 whitespace-nowrap">{app.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Welcome & Tips */}
        <div className="flex-1 bg-white border border-gray-200 p-8 flex flex-col justify-between mt-8 md:mt-0">
          <div>
            <h2 className="text-xl font-bold text-black mb-4">Welcome to MediMind!</h2>
            <p className="text-gray-700 mb-6">Manage your appointments, patients, and profile from this dashboard. Here are some quick tips to get started:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Check your upcoming appointments and mark them as completed after each session.</li>
              <li>Keep your profile updated so patients can find you easily.</li>
              <li>Review your earnings and appointment stats regularly.</li>
            </ul>
          </div>
        </div>
      </div>
      {error && <div className="text-red-600 font-semibold text-center mt-6">{error}</div>}
    </div>
  );
};

export default DoctorDashboard; 