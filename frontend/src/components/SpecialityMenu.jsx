// src/components/SpecialityMenu.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const SpecialityMenu = () => {
    const navigate = useNavigate();
    return (
        <section className="w-full flex flex-col items-center">
            <div className="max-w-3xl mx-auto text-center px-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 drop-shadow-sm">
                    Find by Specialty
                </h2>
                <p className="mt-3 text-gray-600 text-base md:text-lg font-medium">
                    Browse our trusted specialists and pick the perfect one for you.
                </p>
            </div>
            <div className="mt-10 w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 w-full px-2 md:px-8">
                    {specialityData.slice(0, 6).map((item, index) => (
                        <div
                            key={item.speciality || index}
                            onClick={() => navigate(`/doctors/${encodeURIComponent(item.speciality)}`)}
                            className="cursor-pointer flex flex-col items-center bg-white rounded-2xl shadow-lg border border-blue-100 my-3 p-6 transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl hover:ring-4 hover:ring-blue-100"
                            aria-label={`View doctors for ${item.speciality}`}
                        >
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-teal-100 bg-blue-50 flex items-center justify-center">
                                <img
                                    src={item.image}
                                    alt={item.speciality}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="mt-4 text-base md:text-lg font-semibold text-blue-700 text-center">
                                {item.speciality}
                            </p>
                        </div>
                    ))}
                </div>
                <div onClick={() => navigate('/doctors')} className="flex justify-center mt-8 text-base md:text-lg font-semibold text-blue-600 cursor-pointer hover:underline">
                    VIEW MORE
                </div>
            </div>
        </section>
    );
};

export default SpecialityMenu;
