import React, { useEffect, useState, useContext } from 'react';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const DoctorAppointment = () => {
  const { dToken } = useContext(DoctorContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setAppointments(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Auto-refresh every 5 seconds to show appointment status updates
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [dToken]);

  const handleAction = async (id) => {
    setActionId(id);
    setSuccess('');
    setError('');
    try {
      await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId: id },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      setSuccess('Appointment completed');
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setActionId(null);
    }
  };

  const paidAppointments = appointments.filter(
    (a) => a.paymentStatus === 'paid' && !a.cancelled
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-white">
      <h1 className="text-3xl font-extrabold text-black mb-6">Appointments</h1>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-600 font-semibold text-center bg-white border border-gray-200 p-6">{error}</div>
      ) : (
        <div className="bg-white border border-gray-200 p-6 overflow-x-auto">
          <h3 className="text-xl font-bold text-black mb-4">Paid Appointments</h3>
          {paidAppointments.length === 0 ? (
            <div className="text-gray-400">No paid appointments.</div>
          ) : (
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="text-gray-700 border-b">
                  <th className="py-2">Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paidAppointments.map((app) => (
                  <tr key={app._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-semibold">{app.userData?.fullName || 'Unknown Patient'}</td>
                    <td>{new Date(app.slotDate).toLocaleDateString()}</td>
                    <td>{app.slotTime}</td>
                    <td className="text-black font-bold">₹{app.amount}</td>
                    <td>
                      <span className="px-3 py-1 text-xs font-bold border border-gray-300 text-black">
                        {app.isCompleted ? 'Completed' : 'Paid'}
                      </span>
                    </td>
                    <td>
                      {!app.isCompleted && (
                        <button
                          className="bg-black text-white px-3 py-1 font-semibold"
                          onClick={() => handleAction(app._id)}
                          disabled={actionId === app._id}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {success && <div className="text-green-600 font-semibold text-center mt-4 text-sm sm:text-base">{success}</div>}
    </div>
  );
};

export default DoctorAppointment;