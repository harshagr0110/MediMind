import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../context/AppContext';

const Verify = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  const query = new URLSearchParams(search);
  const appointmentId = query.get("appointmentId");
  const success = query.get("success");

  const [status, setStatus] = useState("pending"); // pending, success, failed, cancelled, invalid
  const [redirectCountdown, setRedirectCountdown] = useState(5); // 5 seconds countdown
  const [checking, setChecking] = useState(false); // For loading spinner while checking status

  useEffect(() => {
    if (!appointmentId) {
      setStatus("invalid");
      return;
    }

    if (success === "true") {
      // Only fetch the appointment details and check payment status using the new endpoint
      const checkStatus = async () => {
        setChecking(true);
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/appointment/${appointmentId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          const appt = data.appointment;
          if (appt && appt.paymentStatus === 'paid') {
            setStatus("success");
          } else {
            setStatus("failed");
          }
        } catch (err) {
          setStatus("failed");
        } finally {
          setChecking(false);
        }
      };
      checkStatus();
      return;
    } else if (success === "false") {
      setStatus("cancelled");
      return;
    } else {
      setStatus("invalid");
      return;
    }
  }, [appointmentId, success, token]);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/my-appointments');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const statusMessages = {
    pending: {
      title: "Verifying your payment...",
      icon: "⏳",
    },
    success: {
      title: "Payment Successful!",
      message: "Your appointment has been confirmed.",
      icon: "✅",
    },
    failed: {
      title: "Payment Verification Failed",
      message: "We could not verify your payment. Please contact support.",
      icon: "❌",
    },
    cancelled: {
      title: "Payment Cancelled",
      message: "You cancelled the payment. No appointment was booked.",
      icon: "⚠️",
    },
    invalid: {
      title: "Invalid Request",
      message: "Missing or invalid payment information.",
      icon: "🚫",
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center w-full py-8">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 flex flex-col items-center">
        {checking ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-blue-700 font-semibold">Checking payment status...</p>
          </div>
        ) : (
          <>
            <div className={
              status === "success"
                ? "text-5xl mb-2 text-green-500"
                : status === "pending"
                ? "text-5xl mb-2 text-blue-500"
                : status === "failed"
                ? "text-5xl mb-2 text-red-500"
                : status === "cancelled"
                ? "text-5xl mb-2 text-yellow-500"
                : "text-5xl mb-2 text-gray-500"
            }>
              {statusMessages[status]?.icon}
            </div>
            <h2 className={
              status === "success"
                ? "text-2xl font-bold mb-2 text-green-600"
                : status === "pending"
                ? "text-2xl font-bold mb-2 text-blue-600"
                : status === "failed"
                ? "text-2xl font-bold mb-2 text-red-600"
                : status === "cancelled"
                ? "text-2xl font-bold mb-2 text-yellow-600"
                : "text-2xl font-bold mb-2 text-gray-600"
            }>
              {statusMessages[status]?.title}
            </h2>
            {statusMessages[status]?.message && (
              <p className="mt-4 text-base text-gray-700">
                {statusMessages[status]?.message}
              </p>
            )}
            {status === "success" && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  You will be redirected to your appointments in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                </p>
              </>
            )}
            <div className="mt-8 flex flex-col gap-2 items-center w-full">
              <Link
                to="/"
                className="text-blue-600 hover:underline font-medium text-base"
              >
                Back to Home
              </Link>
              <Link
                to="/my-appointments"
                className="text-teal-600 hover:underline font-medium text-base"
              >
                My Appointments
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;