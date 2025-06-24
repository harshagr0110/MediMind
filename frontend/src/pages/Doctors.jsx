// src/pages/Doctors.jsx

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import 'react-toastify/dist/ReactToastify.css';

const Doctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const { speciality: initialSpeciality } = useParams();

  // Normalization function for specialities
  const normalizeSpeciality = (spec) =>
    spec
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\bphysicians\b/, 'physician')
      .replace(/\bpediatricians\b/, 'pediatrician')
      .replace(/\bgynecologists\b/, 'gynecologist')
      .replace(/\bdermatologists\b/, 'dermatologist')
      .replace(/\bneurologists\b/, 'neurologist')
      .replace(/\bcardiologists\b/, 'cardiologist')
      .replace(/\bsurgeons\b/, 'surgeon')
      .replace(/\bdoctors\b/, 'doctor')
      .replace(/\sspecialist\s*$/, '')
      .trim();

  // Unique, sorted specialties (normalized)
  // (Removed unused allSpecialities variable)

  // State
  const [selectedSpecs, setSelectedSpecs] = useState(() =>
    initialSpeciality ? [normalizeSpeciality(decodeURIComponent(initialSpeciality))] : []
  );
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState([]);

  // (Removed unused filterOpen and setFilterOpen state)
  useEffect(() => {
    const availableDoctors = doctors.filter(doc => doc.available);
    if (selectedSpecs.length === 0) {
      setFilteredDoctors(availableDoctors);
    } else {
      setFilteredDoctors(
        availableDoctors.filter((doc) => selectedSpecs.includes(normalizeSpeciality(doc.speciality)))
      );
    }
  }, [selectedSpecs, doctors]);

  // Toggle specialty (normalized)
  const toggleSpeciality = (spec) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );
  };

  // Toggle description
  const toggleDescription = (docId) => {
    setExpandedDescriptions((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Truncate helper
  const truncate = (text, length = 100) =>
    text.length <= length ? text : text.slice(0, length).trimEnd() + '…';

  return (
    <div className="min-h-screen bg-blue-50 w-full flex flex-col">
      <div className="w-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="bg-white border-r border-blue-100 w-full md:w-80 p-8 space-y-6 flex flex-col shadow-lg rounded-r-2xl">
          <h2 className="text-xl font-semibold text-blue-700 mb-2 text-left">
            Filter by Specialty
          </h2>
          <ul className="space-y-1 w-full max-h-[70vh] overflow-y-auto">
            {[...specialityData]
              .sort((a, b) => a.speciality.localeCompare(b.speciality))
              .map((item) => {
                const normSpec = normalizeSpeciality(item.speciality);
                return (
                  <li key={item.speciality} className="flex">
                    <label className="inline-flex items-center w-full cursor-pointer py-2 px-2 rounded hover:bg-blue-50 transition">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-700"
                        checked={selectedSpecs.includes(normSpec)}
                        onChange={() => toggleSpeciality(normSpec)}
                      />
                      <span className="ml-3 text-blue-700 font-normal">{item.speciality}</span>
                    </label>
                  </li>
                );
              })}
          </ul>
          {selectedSpecs.length > 0 && (
            <button
              onClick={() => setSelectedSpecs([])}
              className="mt-6 text-sm text-orange-600 hover:text-blue-700 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-2 pt-8 pb-10 md:pl-0 w-full">
          <h1 className="text-3xl font-bold text-left text-blue-700 mb-8 w-full px-2">
            {selectedSpecs.length > 0
              ? `Doctors: ${selectedSpecs.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`
              : 'Our Doctors'}
          </h1>

          {filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center mt-20 text-center">
              <img
                src={assets.no_doctors_found}
                alt="No doctors found"
                className="w-24 h-24 opacity-60 mb-4"
              />
              <p className="text-lg text-gray-600 font-medium">
                No doctors match your filter.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try clearing the filters or selecting a different specialty.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 w-full px-2 transition-opacity duration-500">
              {filteredDoctors.map((doc, idx) => {
                const isExpanded = expandedDescriptions.includes(doc._id);
                return (
                  <div
                    key={doc._id}
                    onClick={() => navigate(`/appointment/${doc._id}`)}
                    className={`flex flex-col items-stretch cursor-pointer transition-all duration-200 group w-full max-w-2xl border shadow-lg rounded-2xl p-6 gap-4 ${idx % 2 === 0 ? 'bg-white border-blue-100 hover:border-blue-300' : 'bg-teal-50 border-teal-100 hover:border-teal-300'}`}
                  >
                    {/* Doctor Image */}
                    <div className="h-44 w-full bg-blue-50 flex items-center justify-center rounded-xl">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-24 h-24 object-cover object-top rounded-full border-2 border-blue-200 shadow mt-4 group-hover:scale-105 transition"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col items-start w-full">
                      <h2 className="text-lg font-bold text-blue-700 mb-1">
                        {doc.fullName}
                      </h2>
                      <p className="text-base text-orange-600 font-semibold mb-2">
                        {doc.speciality}
                      </p>
                      <div className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Degree:</span> {doc.degree}
                        <br />
                        <span className="font-medium">Experience:</span> {doc.experience}
                      </div>
                      <p className="mt-2 text-gray-700 text-sm">
                        {isExpanded ? doc.about : truncate(doc.about, 120)}
                      </p>
                      {doc.about.length > 120 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDescription(doc._id);
                          }}
                          className="mt-1 text-blue-600 text-xs font-medium hover:underline focus:outline-none"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                      <div className="mt-auto w-full flex flex-col items-start">
                        <p className="mt-4 text-base text-teal-700 font-semibold">
                          ₹{doc.fees}{' '}
                          <span className="text-sm text-gray-500 font-normal">
                            Consultation Fee
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Doctors;
