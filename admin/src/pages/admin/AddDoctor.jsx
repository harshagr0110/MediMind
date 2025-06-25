import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const AddDoctor = () => {
  const [form, setForm] = useState({ fullName: '', email: '', specialization: '', image: null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { aToken } = useContext(AdminContext);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('specialization', form.specialization);
      if (form.image) formData.append('image', form.image);
      const { data } = await axios.post('/api/admin/add-doctor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (data.success) {
        setSuccess('Doctor added successfully!');
        setForm({ fullName: '', email: '', specialization: '', image: null });
      } else {
        setError(data.message || 'Failed to add doctor');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Add Doctor</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 max-w-lg mx-auto flex flex-col gap-6">
        <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" required className="p-3 rounded-lg border border-blue-200" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="p-3 rounded-lg border border-blue-200" />
        <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" required className="p-3 rounded-lg border border-blue-200" />
        <input name="image" onChange={handleChange} type="file" accept="image/*" className="p-3 rounded-lg border border-blue-200" />
        <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition" disabled={loading}>{loading ? 'Adding...' : 'Add Doctor'}</button>
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      </form>
    </div>
  );
};

export default AddDoctor; 