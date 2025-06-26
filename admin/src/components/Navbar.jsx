import React from 'react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import logo from '../assets/assets_admin/logo.png';

const Navbar = ({ role, onLogout, onMenuClick }) => (
  <header className="bg-white shadow-md flex items-center justify-between px-4 md:px-10 py-4 border-b border-gray-200 z-20 w-full">
    <div className="flex items-center gap-3 md:gap-4">
      {/* Hamburger for mobile */}
      <button className="md:hidden mr-2 p-2" onClick={onMenuClick} aria-label="Open menu">
        <FaBars className="text-2xl text-black" />
      </button>
      <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
      <span className="text-xl md:text-2xl font-extrabold text-black tracking-wide">MediMind</span>
      <span className="hidden sm:inline text-base md:text-lg font-bold text-gray-500 ml-2">{role === 'admin' ? 'Admin Panel' : 'Doctor Panel'}</span>
    </div>
    <div className="flex items-center gap-3 md:gap-6">
      <span className="hidden sm:flex items-center gap-2 text-gray-700 font-semibold capitalize text-base md:text-lg bg-gray-100 px-4 py-2">
        <FaUserCircle className="text-xl md:text-2xl" />
        {role}
      </span>
      <button
        onClick={onLogout}
        className="bg-black text-white px-4 md:px-6 py-2 md:py-3 font-bold hover:bg-gray-900 transition-all text-base md:text-lg"
      >
        Logout
      </button>
    </div>
  </header>
);

export default Navbar; 