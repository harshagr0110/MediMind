import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const AddArticle = () => {
  const { aToken } = useContext(AdminContext);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
      const { data } = await axios.post('/api/articles/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (data.success) {
        setSuccess('Article added successfully!');
        setForm({ title: '', content: '' });
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
    <div className="p-2 sm:p-8 md:p-12 bg-white min-h-screen">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-black mb-6 sm:mb-10">Add Article</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-4 sm:p-10 max-w-xl mx-auto flex flex-col gap-6 sm:gap-8">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="p-3 sm:p-4 border border-gray-300 text-base sm:text-lg focus:ring-2 focus:ring-black" />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" required className="p-3 sm:p-4 border border-gray-300 min-h-[120px] text-base sm:text-lg focus:ring-2 focus:ring-black" />
        <button type="submit" className="bg-black text-white py-3 sm:py-4 font-bold text-base sm:text-lg hover:bg-gray-900 transition shadow border border-black" disabled={loading}>{loading ? 'Adding...' : 'Add Article'}</button>
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      </form>
    </div>
  );
};

export default AddArticle;