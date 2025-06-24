import React, { useContext, useEffect, useState, useCallback } from 'react';
import { DoctorContext } from '../../context/Doctorcontext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets_admin/assets';

const DoctorProfile = () => {
  const { dToken, backendurl } = useContext(DoctorContext);
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchDoctorProfile = useCallback(async () => {
    if (!dToken) return;
    try {
      const { data } = await axios.get(
        `${backendurl}/api/doctor/profile`,
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      if (data.success) {
        setDoctor(data.doctor);
        setFormData(data.doctor);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  }, [dToken, backendurl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAvailability = async () => {
    try {
      await axios.post(
        `${backendurl}/api/doctor/update-availability`,
        {},
        { headers: { Authorization: `Bearer ${dToken}` } }
      );
      toast.success("Availability updated");
      fetchDoctorProfile();
    } catch (err) {
      toast.error("Failed to update availability");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.post(`${backendurl}/api/doctor/update-profile`, formData, {
        headers: { Authorization: `Bearer ${dToken}` }
      });
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchDoctorProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, [fetchDoctorProfile]);

  if (!doctor) {
    return (
      <div className="min-h-screen flex justify-center items-center pt-24">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 md:px-20 flex justify-center items-start pt-28">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl p-10 flex flex-col md:flex-row gap-10 border border-blue-100">
        <div className="flex flex-col items-center md:items-start md:w-1/3">
          <img
            src={doctor.image}
            alt={doctor.fullName}
            className="w-64 h-64 rounded-2xl object-cover border-4 border-teal-100 shadow-lg"
            onError={(e) => {
              e.target.src = assets.profile_pic;
            }}
          />
          <h3 className="text-3xl font-bold mt-6 text-blue-800">{doctor.fullName}</h3>
          <p className="text-lg text-blue-600">{doctor.email}</p>
          <div className="mt-4">
            <button
              onClick={toggleAvailability}
              className={`px-5 py-2 rounded-full text-sm font-semibold shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                ${doctor.available ? 'bg-teal-100 text-teal-700 hover:bg-teal-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              {doctor.available ? 'Available' : 'Not Available'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-base">
            <Info label="Speciality" value={editing ? (
              <input 
                name="speciality" 
                value={formData.speciality || ''} 
                onChange={handleChange} 
                className="input border border-blue-200 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
            ) : doctor.speciality} />
            
            <Info label="Degree" value={editing ? (
              <input 
                name="degree" 
                value={formData.degree || ''} 
                onChange={handleChange} 
                className="input border border-blue-200 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
            ) : doctor.degree} />
            
            <Info label="Experience" value={editing ? (
              <input 
                name="experience" 
                type="number" 
                value={formData.experience || ''} 
                onChange={handleChange} 
                className="input border border-blue-200 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
            ) : `${doctor.experience} years`} />
            
            <Info label="Fees" value={editing ? (
              <input 
                name="fees" 
                type="number" 
                value={formData.fees || ''} 
                onChange={handleChange} 
                className="input border border-blue-200 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
            ) : `₹${doctor.fees}`} />
            
            <Info label="Address" value={editing ? (
              <input 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange} 
                className="input border border-blue-200 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
              />
            ) : doctor.address} />
          </div>

          <div className="mt-10">
            <h4 className="font-semibold text-xl mb-2 text-blue-700">About</h4>
            {editing ? (
              <textarea 
                name="about" 
                value={formData.about || ''} 
                onChange={handleChange} 
                className="w-full border border-blue-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                rows="5" 
              />
            ) : (
              <p className="text-gray-700 text-lg leading-relaxed bg-blue-50 rounded-xl p-5 shadow-inner">
                {doctor.about}
              </p>
            )}
          </div>

          <div className="mt-6">
            {editing ? (
              <div className="flex gap-4">
                <button 
                  onClick={handleUpdate} 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setEditing(false);
                    setFormData(doctor);
                  }} 
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setEditing(true)} 
                className="bg-blue-100 text-blue-800 px-6 py-2 rounded-lg shadow hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-blue-600 font-medium mb-1">{label}</p>
    <div className="font-semibold text-gray-800">{value}</div>
  </div>
);

export default DoctorProfile;