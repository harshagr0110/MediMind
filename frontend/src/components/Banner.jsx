import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Banner = () => {
    const navigate = useNavigate();
    const { token, userData } = useContext(AppContext);

    return (
        <div className="flex justify-center items-center my-8 px-4">
            <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-white border border-blue-100">
                {/* Left: Text Content */}
                <div className="flex flex-col justify-center items-center md:items-start w-full md:w-1/2 p-8 bg-blue-50">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-blue-800 drop-shadow-lg text-center md:text-left">
                        Your <span className="text-teal-500">Health</span>,<br />
                        Our <span className="text-blue-600">Priority</span>
                    </h1>
                    <p className="text-md md:text-lg mb-6 text-blue-700 max-w-md text-center md:text-left">
                        Book appointments with top-rated doctors and get the care you deserve. Trusted, compassionate, and always here for you.
                    </p>
                    {!token && !userData && (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 hover:bg-teal-500 text-white transition px-8 py-3 rounded-lg font-bold shadow-lg mt-2"
                        >
                            Create Account
                        </button>
                    )}
                </div>

                {/* Right: Full Image */}
                <div className="flex items-center justify-center w-full md:w-1/2 bg-white">
                    <img
                        src={assets.logo}
                        alt="Doctor Appointment"
                        className="w-full h-64 md:h-full object-cover object-center rounded-b-3xl md:rounded-b-none md:rounded-r-3xl shadow-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default Banner;
