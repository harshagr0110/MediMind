import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { DoctorContext } from '../../context/Doctorcontext';

const DoctorDashboard = () => {
  const { dToken } = useContext(DoctorContext);
  const [stats, setStats] = useState({ appointments: 0, patients: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get('/api/doctor/dashboard', {
          headers: { Authorization: `Bearer ${dToken}` },
        });
        setStats({
          appointments: data.appointments || 0,
          patients: data.patients || 0,
          earnings: data.earnings || 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dToken]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
          <div className="text-2xl font-bold text-blue-700 mb-2">Appointments</div>
          <div className="text-4xl font-extrabold text-blue-900">{loading ? <Spinner /> : stats.appointments}</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
          <div className="text-2xl font-bold text-blue-700 mb-2">Patients</div>
          <div className="text-4xl font-extrabold text-blue-900">{loading ? <Spinner /> : stats.patients}</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
          <div className="text-2xl font-bold text-blue-700 mb-2">Earnings</div>
          <div className="text-4xl font-extrabold text-blue-900">{loading ? <Spinner /> : `$${stats.earnings}`}</div>
        </div>
      </div>
      {error && <div className="text-red-600 font-semibold text-center mb-4">{error}</div>}
      <div className="bg-white rounded-xl shadow p-8 mt-8">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Welcome to the MediMind Doctor Panel!</h2>
        <p className="text-gray-700">Manage your appointments, patients, and profile from this dashboard.</p>
      </div>
    </div>
  );
};

export default DoctorDashboard; 