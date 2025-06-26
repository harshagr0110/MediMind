import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const AddDoctor = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    speciality: '',
    degree: '',
    experience: '',
    about: '',
    fees: '',
    address: '',
    available: 'yes',
    image: null
  });
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
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'image' && !value) return;
        formData.append(key, value);
      });
      formData.set('available', form.available === 'yes');
      const { data } = await axios.post('/api/admin/add-doctor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (data.success) {
        setSuccess('Doctor added successfully!');
        setForm({
          fullName: '', email: '', password: '', speciality: '', degree: '', experience: '', about: '', fees: '', address: '', available: 'yes', image: null
        });
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
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" required className="p-3 rounded-lg border border-blue-200" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="p-3 rounded-lg border border-blue-200" />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className="p-3 rounded-lg border border-blue-200" />
          <input name="speciality" value={form.speciality} onChange={handleChange} placeholder="Speciality" required className="p-3 rounded-lg border border-blue-200" />
          <input name="degree" value={form.degree} onChange={handleChange} placeholder="Degree" required className="p-3 rounded-lg border border-blue-200" />
          <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (years)" type="number" min="0" required className="p-3 rounded-lg border border-blue-200" />
          <input name="fees" value={form.fees} onChange={handleChange} placeholder="Fees (INR)" type="number" min="0" required className="p-3 rounded-lg border border-blue-200" />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required className="p-3 rounded-lg border border-blue-200" />
          <select name="available" value={form.available} onChange={handleChange} className="p-3 rounded-lg border border-blue-200" required>
            <option value="yes">Available</option>
            <option value="no">Unavailable</option>
          </select>
          <input name="image" onChange={handleChange} type="file" accept="image/*" className="p-3 rounded-lg border border-blue-200" />
        </div>
        <textarea name="about" value={form.about} onChange={handleChange} placeholder="About" required className="p-3 rounded-lg border border-blue-200 col-span-2" rows={3} />
        <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition" disabled={loading}>{loading ? 'Adding...' : 'Add Doctor'}</button>
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      </form>
    </div>
  );
};

export default AddDoctor; 