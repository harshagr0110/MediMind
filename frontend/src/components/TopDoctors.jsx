import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TopDoctors = () => {
    const navigate = useNavigate();
    const { doctors } = useContext(AppContext);

    return (
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Top Doctors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
                {doctors.slice(0, 6).map((doc) => (
                    <div
                        key={doc._id}
                        className="bg-blue-50 rounded-xl shadow p-6 flex flex-col items-center text-center border border-blue-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-200 hover:-translate-y-2"
                    >
                        <img
                            src={doc.image}
                            alt={doc.fullName}
                            className="w-20 h-20 object-cover rounded-full mb-3 border-2 border-teal-200 shadow"
                        />
                        <h3 className="text-lg font-semibold text-blue-800">{doc.fullName}</h3>
                        <p className="text-teal-600 font-medium">{doc.speciality}</p>
                        <button
                            onClick={() => navigate(`/appointment/${doc._id}`)}
                            className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all"
                        >
                            Book Appointment
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopDoctors;
