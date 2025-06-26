// src/pages/Doctors.jsx

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { FiFilter } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
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
  const [filterOpen, setFilterOpen] = useState(false);

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
    <div className="min-h-screen bg-white w-full flex flex-col">
      <div className="w-full flex flex-col md:flex-row">
        {/* Sidebar / Drawer */}
        <aside className={`fixed inset-0 z-40 bg-black/40 md:bg-transparent md:static md:z-auto transition-all duration-300 ${filterOpen ? 'block' : 'hidden md:block'}`}
          onClick={() => setFilterOpen(false)}
        >
          <div
            className={`w-80 max-w-full h-full md:h-auto bg-white border-r border-gray-200 p-8 space-y-6 flex flex-col shadow-none md:shadow-none md:rounded-none transition-all duration-300 ${filterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:static fixed left-0 top-0`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-black">Filter by Specialty</h2>
              <button className="md:hidden p-2" onClick={() => setFilterOpen(false)}><IoClose className="text-2xl" /></button>
            </div>
            <ul className="space-y-1 w-full max-h-[70vh] overflow-y-auto pr-2">
              {[...specialityData]
                .sort((a, b) => a.speciality.localeCompare(b.speciality))
                .map((item) => {
                  const normSpec = normalizeSpeciality(item.speciality);
                  return (
                    <li key={item.speciality} className="flex">
                      <label className="inline-flex items-center w-full cursor-pointer py-2 px-2 rounded hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-black border-gray-400 focus:ring-black"
                          checked={selectedSpecs.includes(normSpec)}
                          onChange={() => toggleSpeciality(normSpec)}
                        />
                        <span className="ml-3 text-black font-normal">{item.speciality}</span>
                      </label>
                    </li>
                  );
                })}
            </ul>
            {selectedSpecs.length > 0 && (
              <button
                onClick={() => setSelectedSpecs([])}
                className="mt-6 text-sm text-black underline font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Filter Button for Mobile */}
        <button
          className="md:hidden fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg flex items-center gap-2"
          onClick={() => setFilterOpen(true)}
        >
          <FiFilter className="text-2xl" />
          <span className="font-semibold">Filter</span>
        </button>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-2 pt-8 pb-10 md:pl-0 w-full">
          <h1 className="text-3xl font-extrabold text-black mb-8 w-full px-2 text-left tracking-tight">
            {selectedSpecs.length > 0
              ? `Doctors: ${selectedSpecs.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`
              : 'Our Doctors'}
          </h1>

          {filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center mt-20 text-center">
              <p className="text-lg text-gray-600 font-medium">
                No doctors match your filter.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try clearing the filters or selecting a different specialty.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-2 transition-opacity duration-500">
              {filteredDoctors.map((doc) => {
                const isExpanded = expandedDescriptions.includes(doc._id);
                return (
                  <div
                    key={doc._id}
                    onClick={() => navigate(`/appointment/${doc._id}`)}
                    className="flex flex-col items-stretch cursor-pointer transition-all duration-200 group w-full max-w-2xl border border-gray-200 bg-white hover:shadow-lg p-6 gap-4 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {/* Doctor Image */}
                    <div className="h-40 w-full bg-gray-50 flex items-center justify-center">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-20 h-20 object-cover object-top rounded-full border-2 border-gray-200 mt-4 group-hover:scale-105 transition"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col items-start w-full">
                      <h2 className="text-lg font-bold text-black mb-1">
                        {doc.fullName}
                      </h2>
                      <p className="text-base text-gray-700 font-semibold mb-2">
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
                          className="mt-1 text-black text-xs font-medium underline focus:outline-none"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                      <div className="mt-auto w-full flex flex-col items-start">
                        <p className="mt-4 text-base text-black font-semibold">
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
