import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/Admincontext';
import Spinner from '../../components/Spinner';
import { FaUserMd, FaUpload, FaImage } from 'react-icons/fa';

const AddDoctors = () => {
  const { backendurl } = useContext(AdminContext);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    degree: '',
    experience: '',
    about: '',
    fees: '',
    address: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      toast.error('Please upload a profile image for the doctor.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    try {
      await axios.post(`${backendurl}/api/admin/add-doctor`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Doctor added successfully!');
      setForm({
        fullName: '', email: '', password: '', specialization: '', degree: '',
        experience: '', about: '', fees: '', address: '', image: null,
      });
      setImagePreview(null);
      document.getElementById('image-upload').value = null; // Reset file input
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: 'fullName', label: 'Full Name', placeholder: 'Dr. Jane Smith' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'doctor@web.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'specialization', label: 'Specialization', placeholder: 'Dermatology' },
    { name: 'degree', label: 'Degree', placeholder: 'MBBS, MD' },
    { name: 'experience', label: 'Experience (Years)', type: 'number', placeholder: '8' },
    { name: 'fees', label: 'Consultation Fees (₹)', type: 'number', placeholder: '750' },
    { name: 'address', label: 'Clinic Address', placeholder: '456 SkinCare Ave, Beautown' },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserMd />
            Add New Doctor
          </h1>
          <p className="text-gray-500 mt-1">Fill out the form to add a new doctor profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover"/>
                  ) : (
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {inputFields.map(({ name, label, type = 'text', placeholder }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input
                  type={type}
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label htmlFor="about" className="block text-sm font-semibold text-gray-700 mb-1.5">About Doctor</label>
              <textarea
                id="about"
                name="about"
                value={form.about}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Write a brief bio about the doctor..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition text-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Spinner sm />
                  <span>Adding Doctor...</span>
                </>
              ) : (
                <span>Submit Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctors;