import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // Import assets

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MyAppointments = () => {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('success')) {
      fetchAppointments();
      if (params.get('success') === 'true') {
        toast.success('Payment successful! Your appointment is confirmed.');
      } else {
        toast.error('Payment was not completed.');
      }
      navigate('/my-appointments', { replace: true });
    }
  }, [location.search, navigate]);

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/user/delete-appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message || 'Appointment cancelled successfully.');
        fetchAppointments();
      } else {
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handlePayOnline = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/create-stripe-session`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not initiate payment');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-10 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 w-full">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">My Appointments</h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold text-center bg-white rounded-xl shadow p-6">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-gray-500 text-center bg-white rounded-xl shadow p-8 font-medium">No appointments found.</div>
      ) : (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          {appointments
            .slice()
            .sort((a, b) => {
              // Combine slotDate and slotTime into a Date object for each appointment
              const parseDateTime = (dateStr, timeStr) => {
                // slotDate: '2024-06-10', slotTime: '09:00 AM'
                const [year, month, day] = dateStr.split('-').map(Number);
                let [time, modifier] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (modifier === 'PM' && hours !== 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return new Date(year, month - 1, day, hours, minutes);
              };
              const dateA = parseDateTime(a.slotDate, a.slotTime);
              const dateB = parseDateTime(b.slotDate, b.slotTime);
              return dateA - dateB;
            })
            .map((app) => {
              const doc = app.docData || {};
              const isPaid = app.paymentStatus === 'paid';
              const isCancelled = app.cancelled;
              const isCompleted = isPaid && app.isCompleted;
              return (
                <div
                  key={app._id}
                  className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-2xl p-8 gap-8 w-full border border-blue-100 hover:shadow-3xl transition-all duration-200"
                  style={{ opacity: isCancelled ? 0.7 : 1 }}
                >
                  <img
                    src={doc.image || assets.profile_pic || ''}
                    alt={doc.fullName || 'Doctor'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                  />
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 w-full">
                    <div className="flex-1 min-w-[180px]">
                      <h2 className="text-2xl font-bold text-blue-800 mb-1">{doc.fullName || 'Doctor'}</h2>
                      <p className="text-blue-600 font-semibold mb-1">{doc.specialization || doc.speciality || 'Specialization'}</p>
                      <p className="text-gray-500 text-sm">{doc.degree ? `Degree: ${doc.degree}` : ''}</p>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px] items-center">
                      <span className="font-semibold text-gray-700 text-lg">{formatDate(app.slotDate)}</span>
                      <span className="text-gray-600 text-base">{app.slotTime}</span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px] items-center">
                      <span className="font-semibold text-gray-700 text-lg">₹{app.amount}</span>
                      {isCompleted ? (
                        <span className="text-xs font-bold rounded-full px-3 py-1 mt-1 bg-blue-100 text-blue-700 border border-blue-300">Completed</span>
                      ) : (
                        <span className={`text-xs font-bold rounded-full px-3 py-1 mt-1 ${isPaid ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>{isPaid ? 'Paid' : 'Pending'}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px] items-center">
                      <span className={`text-xs font-bold rounded-full px-3 py-1 mt-1 ${isCancelled ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}`}>{isCancelled ? 'Cancelled' : 'Active'}</span>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px] items-center">
                      {!isCancelled && !isPaid && (
                        <button
                          onClick={() => handlePayOnline(app._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-600 transition w-full"
                        >
                          Pay Now
                        </button>
                      )}
                      {!isCancelled && !isPaid && (
                        <button
                          onClick={() => cancelAppointment(app._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-red-600 transition w-full"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;