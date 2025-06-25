import React from 'react';

const Navbar = ({ role, onLogout }) => (
  <header className="bg-white shadow flex items-center justify-between px-8 py-4 border-b border-blue-100">
    <div className="text-xl font-bold text-blue-700">{role === 'admin' ? 'Admin Panel' : 'Doctor Panel'}</div>
    <div className="flex items-center gap-4">
      <span className="text-blue-700 font-semibold capitalize">{role}</span>
      <button
        onClick={onLogout}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition"
      >
        Logout
      </button>
    </div>
  </header>
);

export default Navbar; 