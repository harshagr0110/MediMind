import React, { useEffect, useState, useContext } from 'react';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Appointments = () => {
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
    setSuccess('');
    setError('');
    try {
      const endpoint = type === 'complete' ? '/api/doctor/complete-appointment' : '/api/doctor/cancel-appointment';
      await axios.post(`${backendUrl}${endpoint}`, { appointmentId: id }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setSuccess(`Appointment ${type}d successfully!`);
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${type} appointment`);
    } finally {
      setActionId(null);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-4 sm:mb-6">Appointments</h1>
      <div className="bg-white border border-gray-200 p-2 sm:p-4 md:p-6 rounded-none">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-600 font-semibold text-center text-sm sm:text-base">{error}</div>
        ) : (
          <>
            {/* Card layout for mobile */}
            <div className="block md:hidden space-y-4">
              {appointments.map(app => (
                <div key={app._id} className="border border-gray-200 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-black">{app.userData?.fullName || 'Unknown'}</span>
                    <span className={`px-3 py-1 text-xs font-bold border border-gray-300 text-black`}>{app.isCompleted ? 'Completed' : app.cancelled ? 'Cancelled' : 'Upcoming'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-700 text-sm">
                    <span><b>Date:</b> {new Date(app.slotDate).toLocaleDateString()}</span>
                    <span><b>Time:</b> {app.slotTime}</span>
                  </div>
                  {!app.isCompleted && !app.cancelled && (
                    <div className="flex gap-2 mt-2">
                      <button className="bg-black text-white px-3 py-1 font-semibold flex-1" onClick={() => handleAction(app._id, 'complete')} disabled={actionId === app._id}>Complete</button>
                      <button className="bg-black text-white px-3 py-1 font-semibold flex-1" onClick={() => handleAction(app._id, 'cancel')} disabled={actionId === app._id}>Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Table layout for md+ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="text-gray-700 border-b">
                    <th className="py-2">Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-semibold max-w-xs truncate">{app.userData?.fullName || 'Unknown'}</td>
                      <td>{new Date(app.slotDate).toLocaleDateString()}</td>
                      <td>{app.slotTime}</td>
                      <td><span className={`px-3 py-1 text-xs font-bold border border-gray-300 text-black`}>{app.isCompleted ? 'Completed' : app.cancelled ? 'Cancelled' : 'Upcoming'}</span></td>
                      <td>
                        {!app.isCompleted && !app.cancelled && (
                          <div className="flex flex-row gap-2">
                            <button className="bg-black text-white px-3 py-1 font-semibold" onClick={() => handleAction(app._id, 'complete')} disabled={actionId === app._id}>Complete</button>
                            <button className="bg-black text-white px-3 py-1 font-semibold" onClick={() => handleAction(app._id, 'cancel')} disabled={actionId === app._id}>Cancel</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {success && <div className="text-green-600 font-semibold text-center mt-4 text-sm sm:text-base">{success}</div>}
      </div>
    </div>
  );
};

export default Appointments; 