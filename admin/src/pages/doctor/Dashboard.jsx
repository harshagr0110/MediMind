import React from 'react';

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-blue-700 mb-6">Doctor Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
        <div className="text-2xl font-bold text-blue-700 mb-2">Appointments</div>
        <div className="text-4xl font-extrabold text-blue-900">--</div>
      </div>
      <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
        <div className="text-2xl font-bold text-blue-700 mb-2">Patients</div>
        <div className="text-4xl font-extrabold text-blue-900">--</div>
      </div>
      <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
        <div className="text-2xl font-bold text-blue-700 mb-2">Earnings</div>
        <div className="text-4xl font-extrabold text-blue-900">--</div>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow p-8 mt-8">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Welcome to the MediMind Doctor Panel!</h2>
      <p className="text-gray-700">Manage your appointments, patients, and profile from this dashboard.</p>
    </div>
  </div>
);

export default Dashboard; 