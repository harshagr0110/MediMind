import React, { useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({ fullName: 'Dr. John Doe', email: 'doctor@medimind.com', specialization: 'Cardiologist' });
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handleSave = e => {
    e.preventDefault();
    setEditMode(false);
    setSuccess('Profile updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Doctor Profile</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-8 flex flex-col gap-6">
        <input name="fullName" value={profile.fullName} onChange={handleChange} disabled={!editMode} className="p-3 rounded-lg border border-blue-200" />
        <input name="email" value={profile.email} onChange={handleChange} disabled className="p-3 rounded-lg border border-blue-200" />
        <input name="specialization" value={profile.specialization} onChange={handleChange} disabled={!editMode} className="p-3 rounded-lg border border-blue-200" />
        {editMode ? (
          <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Save</button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)} className="bg-blue-100 text-blue-700 py-3 rounded-lg font-bold hover:bg-blue-200 transition">Edit</button>
        )}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
      </form>
    </div>
  );
};

export default Profile; 