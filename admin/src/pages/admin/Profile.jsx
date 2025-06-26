import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const Profile = () => {
  const { aToken } = useContext(AdminContext);
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        setProfile({
          fullName: data.name || 'Admin',
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

  return (
    <div className="p-2 sm:p-8 md:p-12 bg-white min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-black mb-6 sm:mb-10">Profile</h1>
        <div className="bg-white border border-gray-200 p-4 sm:p-10">
          {loading ? (
            <div className="text-center text-gray-700 font-bold">Loading...</div>
          ) : error ? (
            <div className="text-red-600 font-semibold text-center">{error}</div>
          ) : (
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-black font-bold">Full Name</label>
                <input
                  name="fullName"
                  value={profile.fullName}
                  className="p-3 border border-gray-200 text-base bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-black font-bold">Email</label>
                <input
                  name="email"
                  value={profile.email}
                  className="p-3 border border-gray-200 text-base bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="mt-4 text-center text-gray-500 font-medium">
                Profile editing is not supported for this admin.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;