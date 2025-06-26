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
    // eslint-disable-next-line
  }, [dToken]);

  const handleAction = async (id, type) => {
    setActionId(id);
    console.log('handleAction called:', { id, type });
    try {
      const endpoint = type === 'complete' ? '/api/doctor/complete-appointment' : '/api/doctor/cancel-appointment';
      console.log('POST to:', `${backendUrl}${endpoint}`);
      await axios.post(`${backendUrl}${endpoint}`, { appointmentId: id }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      console.log('API call success');
      await fetchAppointments();
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)}d successfully`);
    } catch (err) {
      console.log('API call error:', err);
      setError(err.response?.data?.message || `Failed to ${type} appointment`);
    } finally {
      setActionId(null);
    }
  };

  // Add a new cancelAppointment function
  const cancelAppointment = async (appointmentId) => {
    setActionId(appointmentId);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      setSuccess('Appointment cancelled successfully');
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionId(null);
    }
  };

  // Split appointments
  const completedPayments = appointments.filter(a => a.paymentStatus === 'paid' && a.isCompleted && !a.cancelled);
  const paidNotCompleted = appointments.filter(a => a.paymentStatus === 'paid' && !a.isCompleted && !a.cancelled);
  const pendingPayments = appointments.filter(a => a.paymentStatus !== 'paid' && !a.cancelled);
  const cancelledAppointments = appointments.filter(a => a.cancelled);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-white">
      <h1 className="text-3xl font-extrabold text-black mb-6">Appointments</h1>
      {loading ? <Spinner /> : error ? (
        <div className="text-red-600 font-semibold text-center bg-white border border-gray-200 p-6">{error}</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Completed Payments Section */}
          <div className="bg-white border border-gray-200 p-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-black mb-4">Completed Appointments</h3>
            {completedPayments.length === 0 ? (
              <div className="text-gray-400">No completed appointments.</div>
            ) : (
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="text-gray-700 border-b">
                    <th className="py-2">Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPayments.map(app => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-semibold">{app.userData?.fullName || 'Unknown Patient'}</td>
                      <td>{new Date(app.slotDate).toLocaleDateString()}</td>
                      <td>{app.slotTime}</td>
                      <td className="text-black font-bold">₹{app.amount}</td>
                      <td><span className="px-3 py-1 text-xs font-bold border border-gray-300 text-black">Completed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Paid but not completed section (show Complete button) */}
          <div className="bg-white border border-gray-200 p-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-black mb-4">Paid Appointments (Mark as Complete)</h3>
            {paidNotCompleted.length === 0 ? (
              <div className="text-gray-400">No paid appointments to complete.</div>
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
                  {paidNotCompleted.map(app => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-semibold">{app.userData?.fullName || 'Unknown Patient'}</td>
                      <td>{new Date(app.slotDate).toLocaleDateString()}</td>
                      <td>{app.slotTime}</td>
                      <td className="text-black font-bold">₹{app.amount}</td>
                      <td><span className="px-3 py-1 text-xs font-bold border border-gray-300 text-black">Paid</span></td>
                      <td>
                        <button className="bg-black text-white px-3 py-1 font-semibold" onClick={() => handleAction(app._id, 'complete')} disabled={actionId === app._id || app.isCompleted || app.cancelled}>Complete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pending Payments Section (show Cancel button only) */}
          <div className="bg-white border border-gray-200 p-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-black mb-4">Pending Payments</h3>
            {pendingPayments.length === 0 ? (
              <div className="text-gray-400">No pending payments.</div>
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
                  {pendingPayments.map(app => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-semibold">{app.userData?.fullName || 'Unknown Patient'}</td>
                      <td>{new Date(app.slotDate).toLocaleDateString()}</td>
                      <td>{app.slotTime}</td>
                      <td className="text-black font-bold">₹{app.amount}</td>
                      <td><span className="px-3 py-1 text-xs font-bold border border-gray-300 text-black">Pending</span></td>
                      <td>
                        <button
                          className="bg-black text-white px-3 py-1 font-semibold min-w-[80px]"
                          onClick={() => cancelAppointment(app._id)}
                          disabled={actionId === app._id}
                        >
                          {actionId === app._id ? (
                            <span className="loader border-white border-t-2 border-2 rounded-full w-4 h-4 mr-2 animate-spin"></span>
                          ) : null}
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Cancelled Appointments Section */}
          <div className="bg-white border border-gray-200 p-6 overflow-x-auto">
            <h3 className="text-xl font-bold text-black mb-4">Cancelled Appointments</h3>
            {cancelledAppointments.length === 0 ? (
              <div className="text-gray-400">No cancelled appointments.</div>
            ) : (
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="text-gray-700 border-b">
                    <th className="py-2">Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cancelledAppointments.map(app => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-semibold">{app.userData?.fullName || 'Unknown Patient'}</td>
                      <td>{new Date(app.slotDate).toLocaleDateString()}</td>
                      <td>{app.slotTime}</td>
                      <td className="text-black font-bold">₹{app.amount}</td>
                      <td><span className="px-3 py-1 text-xs font-bold border border-gray-300 text-black">Cancelled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
          {actionId === null && success && <div className="text-green-600 font-semibold text-center mt-4">{success}</div>}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment; 