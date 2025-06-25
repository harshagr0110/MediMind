import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // Import assets

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MyAppointments = () => {
  const { backendurl, token, removeAppointment } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendurl}/api/user/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  // Refetch appointments after Stripe payment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('success')) {
      fetchAppointments();
      if (params.get('success') === 'true') {
        toast.success('Payment successful! Your appointment is confirmed.');
      } else {
        toast.error('Payment was not completed.');
      }
      // Remove payment params from URL
      navigate('/my-appointments', { replace: true });
    }
  }, [location.search, navigate]); // Added navigate to dependency array

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const { data } = await axios.delete(
        `${backendurl}/api/user/delete-appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message || "Appointment cancelled successfully.");
        fetchAppointments(); // Refresh the list
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
        `${backendurl}/api/user/create-stripe-session`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not initiate payment");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment processing failed");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Assuming dateString is an ISO string from backend now
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center w-full py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">My Appointments</h1>
        <p className="text-blue-700 mb-8 text-center text-lg font-medium">
          Manage your doctor appointments easily
        </p>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-10 w-10 text-teal-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-blue-700 font-semibold">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-gray-500 text-lg mb-4">No appointments found.</p>
            <button
              onClick={() => navigate('/doctors')}
              className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-orange-600 transition"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-full">
            {appointments.map((appt, idx) => {
              const doc = appt.docData || {};
              return (
                <div
                  key={appt._id}
                  className={`flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-teal-50'} shadow-lg rounded-xl p-5 gap-6 md:gap-10 border border-blue-100 transition hover:scale-[1.01] hover:shadow-2xl`}
                >
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <img
                      src={doc.image || 'https://i.pravatar.cc/128'}
                      alt={doc.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-teal-200 shadow"
                    />
                    <span className="mt-2 text-xs text-white font-semibold bg-blue-500 px-2 py-0.5 rounded-full">
                      {doc.speciality || 'General'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center md:items-start">
                    <p className="text-xl font-bold text-blue-800">{doc.fullName || 'Doctor'}</p>
                    <div className="mt-2 flex flex-col gap-1 text-sm w-full">
                      <div>
                        <span className="font-semibold text-blue-700">Date & Time:</span>{' '}
                        <span className="text-gray-700">{formatDate(appt.slotDate)} | {appt.slotTime || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-orange-600">Fees:</span>{' '}
                        <span className="text-gray-700">₹{appt.amount || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {appt.cancelled ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                          Cancelled
                        </span>
                      ) : appt.isCompleted ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                          Completed
                        </span>
                      ) : appt.paymentStatus === 'paid' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                          Paid
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                          Payment Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto items-center">
                    {!appt.cancelled && appt.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handlePayOnline(appt._id)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition w-full"
                      >
                        Pay Online
                      </button>
                    )}
                    {!appt.cancelled && (
                      <button
                        onClick={() => cancelAppointment(appt._id)}
                        className={`bg-red-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition w-full ${
                          appt.paymentStatus === 'paid' ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        disabled={appt.paymentStatus === 'paid'}
                      >
                        Cancel Appointment
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to permanently remove this appointment?')) {
                          const success = await removeAppointment(appt._id);
                          if (success) fetchAppointments();
                        }
                      }}
                      className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-gray-400 transition w-full"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const MyAppointmentsPage = (props) => (
  <ErrorBoundary>
    <MyAppointments {...props} />
  </ErrorBoundary>
);

export default MyAppointmentsPage;