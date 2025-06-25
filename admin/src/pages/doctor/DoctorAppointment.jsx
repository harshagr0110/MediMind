import React, { useEffect, useState, useContext } from 'react';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';

const DoctorAppointment = () => {
  const { dToken } = useContext(DoctorContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/doctor/appointments', {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [dToken]);

  const handleAction = async (id, type) => {
    setActionId(id);
    try {
      const endpoint = type === 'complete' ? '/api/doctor/complete-appointment' : '/api/doctor/cancel-appointment';
      await axios.post(endpoint, { appointmentId: id }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${type} appointment`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Appointments</h1>
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-blue-700 border-b">
                <th className="py-2">Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app._id} className="border-b hover:bg-blue-50">
                  <td className="py-2 font-semibold">{app.patientName}</td>
                  <td>{app.date}</td>
                  <td>{app.time}</td>
                  <td><span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{app.status}</span></td>
                  <td>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2" onClick={() => handleAction(app._id, 'complete')} disabled={actionId === app._id}>Complete</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg" onClick={() => handleAction(app._id, 'cancel')} disabled={actionId === app._id}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointment; 