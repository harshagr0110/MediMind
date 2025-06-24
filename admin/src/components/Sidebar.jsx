import React, { useContext } from 'react';
import { AdminContext } from '../context/Admincontext';
import { NavLink } from 'react-router-dom';
import { DoctorContext } from '../context/Doctorcontext';
import logo from '../assets/logo.png';

// Navigation links
const adminNavLinks = [
    { to: '/admin-dashboard', label: 'Dashboard' },
    { to: '/add-doctor', label: 'Add Doctor' },
    { to: '/doctor-list', label: 'Doctors List' },
];

const doctorNavLinks = [
    { to: '/doctor-dashboard', label: 'Dashboard' },
    { to: '/doctor-profile', label: 'Profile' },
    { to: '/doctor-appointment', label: 'Appointments' },
];

const Sidebar = () => {
    const { aToken } = useContext(AdminContext);
    const { dToken } = useContext(DoctorContext);

    // Choose nav links based on token
    const navLinks = dToken ? doctorNavLinks : aToken ? adminNavLinks : [];

    return (
        <aside className="w-full md:w-64 bg-white rounded-3xl p-0 shadow-xl h-full min-h-full border-r border-blue-100 sticky top-20">
            <div className="p-6 border-b border-blue-100 flex flex-col items-center">
                <img src={logo} alt="Logo" className="h-12 mb-2 rounded-full border-2 border-blue-200 shadow" />
                <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                    <span role="img" aria-label="logo">🩺</span>
                    {dToken ? 'Doctor Panel' : aToken ? 'Admin Panel' : 'Welcome'}
                </h2>
            </div>
            {navLinks.length > 0 && (
                <ul className="flex flex-col gap-2 p-4">
                    {navLinks.map((link, idx) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-lg
                                    ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700 font-semibold shadow'
                                            : 'text-blue-700 hover:bg-blue-50 hover:text-blue-900'
                                    }`
                                }
                            >
                                {/* Simple icon for each nav item */}
                                <span className="inline-block w-5 h-5">
                                    {idx === 0 && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>}
                                    {idx === 1 && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>}
                                    {idx === 2 && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18" /></svg>}
                                </span>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default Sidebar;
