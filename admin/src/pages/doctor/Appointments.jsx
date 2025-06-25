import React from 'react';
import Spinner from '../../components/Spinner';

const Appointments = () => {
  // Placeholder data
  const appointments = [
    { _id: 1, patient: 'Alice', date: '2024-06-28', time: '10:00 AM', status: 'upcoming' },
    { _id: 2, patient: 'Bob', date: '2024-06-27', time: '11:00 AM', status: 'completed' },
  ];
  const loading = false;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Appointments</h1>
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? <Spinner /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-blue-700 border-b">
                <th className="py-2">Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app._id} className="border-b hover:bg-blue-50">
                  <td className="py-2 font-semibold">{app.patient}</td>
                  <td>{app.date}</td>
                  <td>{app.time}</td>
                  <td><span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{app.status}</span></td>
                  <td>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-2">Complete</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg">Cancel</button>
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

export default Appointments; 