import React, { useState, useEffect, useContext } from 'react';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { AdminContext } from '../../context/Admincontext';

const DoctorsList = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const { aToken } = useContext(AdminContext);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/admin/all-doctors', {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      setDoctors(data.doctors || []);
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
      await axios.delete(`/api/admin/delete-doctor/${id}`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      await fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Doctors List</h1>
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-blue-700 border-b">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc._id} className="border-b hover:bg-blue-50">
                  <td className="py-2 font-semibold">{doc.fullName}</td>
                  <td>{doc.email}</td>
                  <td>{doc.specialization}</td>
                  <td><span className={`px-3 py-1 rounded-full text-xs font-bold ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{doc.status}</span></td>
                  <td>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2">Edit</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg" onClick={() => handleDelete(doc._id)} disabled={deletingId === doc._id}>{deletingId === doc._id ? 'Deleting...' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorsList; 