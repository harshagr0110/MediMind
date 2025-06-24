import React from 'react';
import { useContext, useState } from 'react';
import { AdminContext } from '../context/Admincontext';
import { DoctorContext } from '../context/Doctorcontext';
// Import a toast library (react-hot-toast is popular and works well with Tailwind)
import { toast } from 'react-hot-toast';
import logo from '../assets/logo.png';

// If you use this Navbar as fixed, add 'mt-20' or 'pt-20' to your main content wrapper to prevent overlap.
export const NAVBAR_HEIGHT = 80; // px

const Navbar = () => {
    const { setAToken, isAdmin } = useContext(AdminContext);
    const { setDToken, isDoctor } = useContext(DoctorContext);
    const [sidebar, setSidebar] = useState(false);

    const handleLogout = () => {
        setAToken('');
        setDToken('');
        toast.success('Logged out successfully!', {
            style: {
                background: 'blue',
                color: '#fff',
            },
            iconTheme: {
                primary: '#38b2ac',
                secondary: '#fff',
            },
        });
    };

    return (
        <nav className="w-full shadow-md fixed top-0 z-50 bg-white border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
                {/* Logo and Panel Title */}
                <div className="flex items-center space-x-3">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-10 w-10 rounded-full border-2 border-blue-200 shadow cursor-pointer"
                        onClick={() => window.location.pathname = isAdmin ? '/admin-dashboard' : isDoctor ? '/doctor-dashboard' : '/'}
                    />
                    <span className="font-extrabold text-2xl tracking-wide text-blue-700 select-none">
                        <span className="inline-block align-middle mr-2">🩺</span>
                        {isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Admin/Doctor'} Panel
                    </span>
                </div>
                {/* Desktop Logout Button */}
                <div className="hidden md:flex items-center">
                    <button
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
                {/* Mobile Hamburger */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setSidebar(true)}
                        aria-label="Open menu"
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                    >
                        <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>
            {/* Mobile Sidebar */}
            {sidebar && (
                <div className="fixed inset-0 z-50 bg-blue-900 bg-opacity-30 flex" onClick={() => setSidebar(false)}>
                    <div className="bg-white w-64 h-full p-6 flex flex-col shadow-2xl border-r border-blue-100" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-extrabold text-xl text-blue-700">{isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Admin/Doctor'} Panel</span>
                            <button
                                onClick={() => setSidebar(false)}
                                aria-label="Close menu"
                                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                            >
                                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <button
                            className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
                            onClick={() => { handleLogout(); setSidebar(false); }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;