import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/add-doctor', label: 'Add Doctor' },
    { to: '/admin/articles', label: 'Articles' },
    { to: '/admin/profile', label: 'Profile' },
    { to: '/admin/settings', label: 'Settings' },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/availability', label: 'Availability' },
    { to: '/doctor/profile', label: 'Profile' },
    { to: '/doctor/settings', label: 'Settings' },
  ]
};

const Sidebar = ({ role }) => (
  <aside className="bg-blue-700 text-white w-64 min-h-screen flex flex-col shadow-xl">
    <div className="p-6 text-2xl font-extrabold tracking-wide border-b border-blue-600">MediMind</div>
    <nav className="flex-1 flex flex-col gap-2 p-4">
      {(navItems[role] || []).map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `block px-4 py-3 rounded-lg font-semibold transition-all ${isActive ? 'bg-blue-900' : 'hover:bg-blue-800'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar; 