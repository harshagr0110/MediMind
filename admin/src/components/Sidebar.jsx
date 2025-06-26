import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUserMd, FaPlus, FaFileAlt, FaUserCircle, FaRegNewspaper, FaTimes } from 'react-icons/fa';

const navItems = {
  admin: [
    { to: '/admin-dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/doctor-list', label: 'Doctors', icon: <FaUserMd /> },
    { to: '/add-doctor', label: 'Add Doctor', icon: <FaPlus /> },
    { to: '/articles', label: 'Articles', icon: <FaFileAlt /> },
    { to: '/add-article', label: 'Add Article', icon: <FaRegNewspaper /> },
  ],
  doctor: [
    { to: '/doctor-dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/doctor-appointment', label: 'Appointments', icon: <FaFileAlt /> },
    { to: '/doctor-profile', label: 'Profile', icon: <FaUserCircle /> },
  ]
};

const Sidebar = ({ role, open, onClose }) => (
  <>
    {/* Overlay for mobile */}
    <div
      className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${open ? 'block md:hidden' : 'hidden'}`}
      onClick={onClose}
      aria-label="Close sidebar overlay"
    />
    <div
      className={`fixed z-50 top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:block md:h-full md:z-10`}
      style={{ minHeight: '100vh' }}
    >
      {/* Close button for mobile */}
      <button
        className="md:hidden absolute top-4 right-4 p-2 text-black"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <FaTimes className="text-2xl" />
      </button>
      <div className="text-2xl font-extrabold text-black mb-10 tracking-tight">MediMind</div>
      <nav className="flex flex-col gap-2 flex-1">
        {(navItems[role] || []).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-base font-semibold transition-all
                ${isActive ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`
            }
            style={({ isActive }) => ({ boxShadow: isActive ? '0 2px 8px rgba(30,34,51,0.08)' : undefined })}
            onClick={onClose}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  </>
);

export default Sidebar; 