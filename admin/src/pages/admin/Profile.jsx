import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const Profile = () => {
  const { aToken } = useContext(AdminContext);
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [aToken]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.post('/api/admin/update-profile', profile, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      if (data.success) {
        setSuccess('Profile updated!');
        setEditMode(false);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Profile</h1>
      {loading ? <div>Loading...</div> : (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-8 flex flex-col gap-6">
          <input name="fullName" value={profile.fullName} onChange={handleChange} disabled={!editMode} className="p-3 rounded-lg border border-blue-200" />
          <input name="email" value={profile.email} onChange={handleChange} disabled className="p-3 rounded-lg border border-blue-200" />
          {editMode ? (
            <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Save</button>
          ) : (
            <button type="button" onClick={() => setEditMode(true)} className="bg-blue-100 text-blue-700 py-3 rounded-lg font-bold hover:bg-blue-200 transition">Edit</button>
          )}
          {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
          {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default Profile; 