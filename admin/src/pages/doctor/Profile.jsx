import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const initialProfile = {
  fullName: '',
  email: '',
  image: '',
  speciality: '',
  degree: '',
  experience: '',
  about: '',
  available: true,
  fees: '',
  address: '',
};

const Profile = () => {
  const { dToken } = useContext(DoctorContext);
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialProfile);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availLoading, setAvailLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);

  // Fetch profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setProfile({
        fullName: data.data?.fullName || '',
        email: data.data?.email || '',
        image: data.data?.image || '',
        speciality: data.data?.speciality || '',
        degree: data.data?.degree || '',
        experience: data.data?.experience?.toString() || '',
        about: data.data?.about || '',
        available: data.data?.available ?? true,
        fees: data.data?.fees?.toString() || '',
        address: data.data?.address || '',
      });
      setForm({
        fullName: data.data?.fullName || '',
        email: data.data?.email || '',
        image: data.data?.image || '',
        speciality: data.data?.speciality || '',
        degree: data.data?.degree || '',
        experience: data.data?.experience?.toString() || '',
        about: data.data?.about || '',
        available: data.data?.available ?? true,
        fees: data.data?.fees?.toString() || '',
        address: data.data?.address || '',
      });
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setAppointments(data.data || []);
    } catch (err) {
      // ignore for now
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
    // eslint-disable-next-line
  }, [dToken]);

  // Handle form changes
  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setImageFile(files[0]);
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Save profile to backend
  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'experience' || key === 'fees') {
          formData.append(key, Number(value));
        } else {
          formData.append(key, value);
        }
      });
      if (imageFile) formData.append('image', imageFile);
      const { data } = await axios.patch(`${backendUrl}/api/doctor/update-profile`, formData, {
        headers: {
          Authorization: `Bearer ${dToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (data.success) {
        setSuccess('Profile updated!');
        setEditMode(false);
        await fetchProfile();
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  // Handle availability toggle
  const handleToggleAvailability = async () => {
    setAvailLoading(true);
    try {
      const { data } = await axios.patch(`${backendUrl}/api/doctor/update-availability`, { available: !profile.available }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      if (data.success) {
        setProfile(p => ({ ...p, available: data.data.available }));
        setForm(f => ({ ...f, available: data.data.available }));
      }
    } catch (err) {
      // ignore for now
    } finally {
      setAvailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-xl bg-white border border-gray-200 p-8 flex flex-col items-center relative">
        {/* Availability toggle at top right */}
        <div className="absolute top-6 right-8 flex items-center gap-2">
          <label className="text-black font-bold">Available</label>
          <input
            name="available"
            type="checkbox"
            checked={profile.available}
            onChange={handleToggleAvailability}
            disabled={availLoading}
          />
          {availLoading && <span className="ml-2 animate-spin h-5 w-5 border-t-2 border-b-2 border-black rounded-full"></span>}
        </div>
        <img
          src={editMode ? (imageFile ? URL.createObjectURL(imageFile) : form.image || '/default-profile.png') : (profile.image || '/default-profile.png')}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 mb-4"
        />
        {editMode ? (
          <form onSubmit={handleSave} encType="multipart/form-data" className="w-full flex flex-col gap-4 mt-2">
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="mt-2"
              disabled={saving}
            />
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name*"
              className="p-3 border border-gray-200"
              required
              disabled={saving}
            />
            <input
              name="email"
              value={form.email}
              disabled
              className="p-3 border border-gray-200 bg-gray-100"
            />
            <input
              name="speciality"
              value={form.speciality}
              disabled
              className="p-3 border border-gray-200 bg-gray-100"
            />
            <input
              name="degree"
              value={form.degree}
              onChange={handleChange}
              placeholder="Degree*"
              className="p-3 border border-gray-200"
              required
              disabled={saving}
            />
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Experience (years)*"
              type="number"
              min="0"
              className="p-3 border border-gray-200"
              required
              disabled={saving}
            />
            <input
              name="fees"
              value={form.fees}
              onChange={handleChange}
              placeholder="Fees (INR)*"
              type="number"
              min="0"
              className="p-3 border border-gray-200"
              required
              disabled={saving}
            />
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className="p-3 border border-gray-200"
              disabled={saving}
            />
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              placeholder="About"
              className="p-3 border border-gray-200"
              rows={3}
              disabled={saving}
            />
            <button type="submit" className="bg-black text-white py-3 font-bold" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
            {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
            {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          </form>
        ) : (
          <div className="w-full flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Full Name</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.fullName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Email</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Speciality</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.speciality}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Degree</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.degree}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Experience</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.experience}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Fees</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.fees}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">Address</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.address}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black font-bold">About</span>
              <span className="p-3 border border-gray-200 bg-gray-100">{profile.about}</span>
            </div>
            <button className="bg-black text-white py-3 font-bold mt-4" onClick={() => setEditMode(true)}>Edit Profile</button>
            {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
            {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 