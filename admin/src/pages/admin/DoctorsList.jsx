import React, { useState, useEffect, useContext } from 'react';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const statusColors = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

const DoctorsList = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const { aToken } = useContext(AdminContext);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('https://medimind-backend.vercel.app/api/admin/all-doctors', {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDoctors(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line
  }, [aToken]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    setDeletingId(id);
    try {
      await axios.delete('https://medimind-backend.vercel.app/api/admin/delete-doctor/' + id, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      await fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatus = async (id, status) => {
    setUpdatingId(id + status);
    try {
      await axios.post('https://medimind-backend.vercel.app/api/admin/update-doctor-status', { doctorId: id, status }, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      await fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-2 sm:p-8 md:p-12 bg-white min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-6 sm:mb-10">Doctors List</h1>
      <div className="bg-white border border-gray-200 shadow p-2 sm:p-8 overflow-x-auto rounded-none">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-500 font-semibold text-center text-sm sm:text-base">{error}</div>
        ) : (
          <>
            {/* Card layout for mobile */}
            <div className="block md:hidden space-y-4">
              {doctors.map(doc => (
                <div key={doc._id} className="border border-gray-200 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-4 mb-2">
                    {doc.image ? (
                      <img src={doc.image} alt={doc.fullName} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">N/A</div>
                    )}
                    <span className="font-semibold text-black text-lg">{doc.fullName}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-700 text-sm">
                    <span><b>Email:</b> {doc.email}</span>
                    <span><b>Speciality:</b> {doc.speciality}</span>
                    <span><b>Degree:</b> {doc.degree}</span>
                    <span><b>Experience:</b> {doc.experience} yrs</span>
                    <span><b>Fees:</b> ₹{doc.fees}</span>
                    <span><b>Address:</b> {doc.address}</span>
                    <span><b>Available:</b> {doc.available ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDelete(doc._id)}
                      disabled={deletingId === doc._id}
                      className="border border-black text-black px-4 py-2 font-semibold hover:bg-gray-100 transition disabled:opacity-60 shadow-none flex-1"
                    >
                      {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Table layout for md+ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b">
                    <th className="py-3 px-4 font-semibold">Image</th>
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Speciality</th>
                    <th className="py-3 px-4 font-semibold">Degree</th>
                    <th className="py-3 px-4 font-semibold">Experience</th>
                    <th className="py-3 px-4 font-semibold">Fees</th>
                    <th className="py-3 px-4 font-semibold">Address</th>
                    <th className="py-3 px-4 font-semibold">Available</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        {doc.image ? (
                          <img src={doc.image} alt={doc.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">N/A</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-black whitespace-nowrap">{doc.fullName}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{doc.email}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{doc.speciality}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{doc.degree}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{doc.experience} yrs</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">₹{doc.fees}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{doc.address}</td>
                      <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{doc.available ? 'Yes' : 'No'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(doc._id)}
                          disabled={deletingId === doc._id}
                          className="border border-black text-black px-4 py-2 font-semibold hover:bg-gray-100 transition disabled:opacity-60 shadow-none"
                        >
                          {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;