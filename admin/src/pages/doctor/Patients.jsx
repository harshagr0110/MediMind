import React, { useEffect, useState, useContext } from 'react';
import Spinner from '../../components/Spinner';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';

const Patients = () => {
  const { dToken } = useContext(DoctorContext);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get('/api/doctor/patients', {
          headers: { Authorization: `Bearer ${dToken}` },
        });
        setPatients(data.patients || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [dToken]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Patients</h1>
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? <Spinner /> : error ? (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-blue-700 border-b">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient._id} className="border-b hover:bg-blue-50">
                  <td className="py-2 font-semibold">{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.age}</td>
                  <td>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2">View</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg">Remove</button>
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

export default Patients; 