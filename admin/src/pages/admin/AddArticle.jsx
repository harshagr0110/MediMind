import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const AddArticle = () => {
  const { aToken } = useContext(AdminContext);
  const [form, setForm] = useState({ title: '', content: '', image: null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (form.image) formData.append('image', form.image);
      const { data } = await axios.post('/api/article/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (data.success) {
        setSuccess('Article added successfully!');
        setForm({ title: '', content: '', image: null });
      } else {
        setError(data.message || 'Failed to add article');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Add Article</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 max-w-lg mx-auto flex flex-col gap-6">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="p-3 rounded-lg border border-blue-200" />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" required className="p-3 rounded-lg border border-blue-200 min-h-[120px]" />
        <input name="image" onChange={handleChange} type="file" accept="image/*" className="p-3 rounded-lg border border-blue-200" />
        <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition" disabled={loading}>{loading ? 'Adding...' : 'Add Article'}</button>
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      </form>
    </div>
  );
};

export default AddArticle; 