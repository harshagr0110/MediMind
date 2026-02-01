import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { AdminContext } from '../../context/Admincontext';
import { Link } from 'react-router-dom';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { aToken } = useContext(AdminContext);
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, earnings: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setStats({
          doctors: data.data?.totalDoctors || 0,
          patients: data.data?.totalPatients || 0,
          appointments: data.data?.totalAppointments || 0,
          earnings: data.data?.totalEarnings || 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    const fetchRecent = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/recent-appointments`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setRecent(data.data || []);
      } catch {}
    };
    fetchStats();
    fetchRecent();
    // Auto-refresh every 5 seconds to show updated stats
    const interval = setInterval(() => {
      fetchStats();
      fetchRecent();
    }, 5000);
    return () => clearInterval(interval);
  }, [aToken]);

  return (
    <div className="p-2 sm:p-6 md:p-12 bg-white min-h-screen text-black">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-6 sm:mb-10">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
        <div className="bg-white border border-gray-200 p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-2">Doctors</div>
          <div className="text-3xl sm:text-5xl font-extrabold text-black">{loading ? <Spinner /> : stats.doctors}</div>
        </div>
        <div className="bg-white border border-gray-200 p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-2">Appointments</div>
          <div className="text-3xl sm:text-5xl font-extrabold text-black">{loading ? <Spinner /> : stats.appointments}</div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 w-full">
        {/* Announcements/Updates */}
        <div className="flex-1 bg-white border border-gray-200 p-6 sm:p-8 mb-6 md:mb-0">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4">Platform Announcements</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
            <li>New doctor onboarding process launched. <span className="text-xs text-gray-400">(June 2024)</span></li>
            <li>Performance improvements and bug fixes deployed. <span className="text-xs text-gray-400">(May 2024)</span></li>
            <li>Article management now supports images. <span className="text-xs text-gray-400">(April 2024)</span></li>
          </ul>
        </div>
        {/* Quick Actions & Tips */}
        <div className="flex-1 bg-white border border-gray-200 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-black mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
              <Link to="/doctor-list" className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-black font-semibold hover:bg-gray-100 transition">View Doctors</Link>
              <Link to="/add-doctor" className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-black font-semibold hover:bg-gray-100 transition">Add Doctor</Link>
              <Link to="/articles" className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-black font-semibold hover:bg-gray-100 transition">View Articles</Link>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-black mb-4">Admin Tips</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm sm:text-base">
              <li>Regularly review doctor profiles for accuracy.</li>
              <li>Encourage doctors to keep their availability up to date.</li>
              <li>Use the articles section to share important health updates.</li>
            </ul>
          </div>
        </div>
      </div>
      {error && <div className="text-red-600 font-semibold text-center mt-6">{error}</div>}
    </div>
  );
};

export default Dashboard;