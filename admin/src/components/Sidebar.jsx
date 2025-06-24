import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets_admin/assets';

const Sidebar = () => {
    const location = useLocation();
    // A simple check to see if we are in a doctor's context vs an admin's
    const isDoctor = location.pathname.startsWith('/doctor');

    const getLinkClass = ({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-700 font-semibold' : ''}`;

    return (
        <div className='bg-white min-h-screen p-4 border-r border-gray-200'>
            <NavLink to={isDoctor ? "/doctor/dashboard" : "/admin/dashboard"}>
                <img className='w-36 mx-auto my-4' src={assets.logo} alt="Logo" />
            </NavLink>

            <nav className='w-full mt-8 flex flex-col gap-2'>
                {isDoctor ? (
                    <>
                        <NavLink to='/doctor/dashboard' className={getLinkClass}>
                            <img src={assets.home_icon} alt="Dashboard" />
                            <p className='hidden sm:block'>Dashboard</p>
                        </NavLink>
                        <NavLink to='/doctor/appointments' className={getLinkClass}>
                            <img src={assets.appointments_icon} alt="Appointments" />
                            <p className='hidden sm:block'>Appointments</p>
                        </NavLink>
                        <NavLink to='/doctor/add-article' className={getLinkClass}>
                            <img src={assets.add_icon} alt="Add Article" />
                            <p className='hidden sm:block'>New Article</p>
                        </NavLink>
                        <NavLink to='/doctor/profile' className={getLinkClass}>
                            <img src={assets.doctor_icon} alt="Profile" />
                            <p className='hidden sm:block'>My Profile</p>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to='/admin/dashboard' className={getLinkClass}>
                            <img src={assets.home_icon} alt="Dashboard" />
                            <p className='hidden sm:block'>Dashboard</p>
                        </NavLink>
                        <NavLink to='/admin/add-doctors' className={getLinkClass}>
                            <img src={assets.add_icon} alt="Add Doctors" />
                            <p className='hidden sm:block'>Add Doctors</p>
                        </NavLink>
                        <NavLink to='/admin/doctors' className={getLinkClass}>
                            <img src={assets.list_icon} alt="Doctors" />
                            <p className='hidden sm:block'>Doctors List</p>
                        </NavLink>
                        <NavLink to='/admin/add-article' className={getLinkClass}>
                            <img src={assets.add_icon} alt="Add Article" />
                            <p className='hidden sm:block'>New Article</p>
                        </NavLink>
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;
