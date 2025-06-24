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

  useEffect(() => {
    if (!appointmentId) {
      setStatus("invalid");
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/verifystripe`,
          { appointmentId, success },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setStatus("success");
          toast.success("✅ Payment successful! Appointment confirmed.", {
            position: "top-center",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          setTimeout(() => navigate('/my-appointments'), 3000);
        } else {
          setStatus("failed");
          toast.error(data.message || "Payment verification failed", {
            position: "top-center",
            autoClose: 3500,
            theme: "colored",
          });
        }
      } catch (err) {
        setStatus("failed");
        toast.error(err.response?.data?.message || "Verification failed", {
          position: "top-center",
          autoClose: 3500,
          theme: "colored",
        });
      }
    };

    if (success === "true") {
      verifyPayment();
    } else if (success === "false") {
      setStatus("cancelled");
      toast.info("Payment was cancelled", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      setStatus("invalid");
    }
  }, [appointmentId, success, navigate, token]);

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
          <p className="mt-2 text-sm text-gray-500">
            You will be redirected to your appointments shortly...
          </p>
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
      </div>
    </div>
  );
};

export default Verify;