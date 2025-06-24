import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { AdminContext } from '../../context/Admincontext';

const DoctorsList = () => {
  const { aToken, backendurl, doctors, getAllDoctors, changeAvailability, removeDoctor } = useContext(AdminContext);
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken, getAllDoctors]);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const initialState = {};
      doctors.forEach((doc) => {
        initialState[doc._id] = doc.available;
      });
      setAvailability(initialState);
    }
  }, [doctors]);

  const toggleAvailability = async (id) => {
    try {
      // Call context function
      await changeAvailability(id);
      // Optimistically update local state
      setAvailability((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
      toast.success('Availability updated!', {
        style: {
          border: '1px solid #22c55e',
          padding: '8px 16px',
          color: '#166534',
          background: '#f0fdf4',
        },
        iconTheme: {
          primary: '#22c55e',
          secondary: '#f0fdf4',
        },
      });
    } catch (error) {
      toast.error('Failed to update availability.', {
        style: {
          border: '1px solid #ef4444',
          padding: '8px 16px',
          color: '#991b1b',
          background: '#fef2f2',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fef2f2',
        },
      });
    }
  };

  return (
    <div className="p-8 min-h-screen bg-blue-50 text-gray-900 pt-24">
      <Toaster position="top-center" />
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">Doctors List</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col items-center text-center border border-blue-100"
            >
              <img
                src={doctor.image}
                alt={doctor.fullName}
                className="w-full h-40 object-cover object-top rounded-xl mb-4 border-2 border-teal-100 shadow"
              />

              <h3 className="text-lg font-semibold text-blue-800">{doctor.fullName}</h3>
              <p className="text-teal-600 font-medium">{doctor.speciality}</p>
              <p className="text-sm text-gray-500">Degree: {doctor.degree}</p>
              <p className="text-sm text-gray-500">Experience: {doctor.experience} years</p>
              <p className="text-sm text-gray-500">
                Fees: <span className="text-blue-700 font-semibold">	{doctor.fees}</span>
              </p>
              <p className="text-sm text-gray-500">Email: {doctor.email}</p>
              <p className="text-sm text-gray-500">Address: {doctor.address}</p>

              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={availability[doctor._id] || false}
                  onChange={() => toggleAvailability(doctor._id)}
                  className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-blue-200 rounded"
                />
                <label className={`text-sm font-medium ${availability[doctor._id] ? 'text-teal-700' : 'text-gray-400'}`}>
                  {availability[doctor._id] ? 'Available' : 'Not Available'}
                </label>
                <button
                  className="ml-4 px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold shadow hover:bg-red-600 transition"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to remove this doctor?')) {
                      removeDoctor(doctor._id);
                    }
                  }}
                  title="Remove Doctor"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">No doctors found.</div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
