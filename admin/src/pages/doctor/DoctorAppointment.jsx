import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/Doctorcontext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointment = () => {
  const { dToken, appointments = [], getAppointments, backendurl } = useContext(DoctorContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken, getAppointments]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const { data } = await axios.post(
        `${backendurl}/api/doctor/cancel-appointment`,
        { id },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data.success) {
        toast.success("Appointment cancelled");
        getAppointments();
      } else {
        toast.error(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleComplete = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendurl}/api/doctor/complete-appointment`,
        { id },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data.success) {
        toast.success("Appointment marked as completed");
        getAppointments();
      } else {
        toast.error(data.message || 'Failed to complete appointment');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete appointment');
    }
  };

  return (
    <div className="p-4 md:p-10 bg-gradient-to-br from-blue-50 to-white min-h-screen pt-28">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <h2 className="text-4xl font-extrabold text-blue-900 drop-shadow-sm">My Appointments</h2>
        <button
          onClick={getAppointments}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition text-lg"
        >
          Refresh
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-lg">No appointments available.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {appointments.map((app) => (
            <div
              key={app._id}
              className={`bg-white p-8 rounded-3xl shadow-xl border border-blue-100 flex flex-col gap-3 transition-all ${
                app.cancelled ? 'opacity-60' : 'hover:shadow-2xl'
              }`}
            >
              {/* Patient Info */}
              <div className="flex items-center gap-5 mb-2">
                <img
                  src={app.userData?.image}
                  alt={app.userData?.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow"
                />
                <div>
                  <p className="font-bold text-blue-900 text-lg">{app.userData?.fullName}</p>
                  <p className="text-base text-blue-600">{app.userData?.email}</p>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="text-base mt-1 space-y-1">
                <p><span className="font-semibold text-blue-700">Date:</span> {app.slotDate}</p>
                <p><span className="font-semibold text-blue-700">Time:</span> {app.slotTime}</p>
                <p><span className="font-semibold text-blue-700">Amount:</span> ₹{app.amount}</p>
                <p>
                  <span className="font-semibold text-blue-700">Completed:</span>{' '}
                  <span className={app.isCompleted ? 'text-teal-600' : 'text-gray-500'}>
                    {app.isCompleted ? 'Yes' : 'No'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-blue-700">Cancelled:</span>{' '}
                  <span className={app.cancelled ? 'text-red-500' : 'text-gray-500'}>
                    {app.cancelled ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>

              {/* Payment Status */}
              <div className="mt-2">
                <span
                  className={`text-xs font-semibold px-4 py-1 rounded-full border
                    ${app.paymentStatus === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}
                >
                  {app.paymentStatus === 'pending' ? 'Payment Pending' : 'Paid'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleCancel(app._id)}
                  disabled={app.cancelled || app.isCompleted}
                  className={`px-5 py-2 rounded-xl text-base font-medium transition-all
                    ${app.cancelled || app.isCompleted ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                  {app.cancelled ? 'Cancelled' : 'Cancel'}
                </button>

                <button
                  onClick={() => handleComplete(app._id)}
                  disabled={app.cancelled || app.isCompleted}
                  className={`px-5 py-2 rounded-xl text-base font-medium transition-all
                    ${app.isCompleted ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                >
                  {app.isCompleted ? 'Completed' : 'Mark as Completed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;
