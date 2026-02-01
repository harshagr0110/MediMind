import React from 'react';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-blue-50 text-gray-900 flex flex-col w-full">
        <main className="w-full flex flex-col items-center gap-16 py-0 px-0">
          {/* Minimal Header Section */}
          <section className="w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-white py-16 px-4 md:px-16 border-b border-blue-100">
            <div className="flex-1 flex flex-col items-start gap-8">
              <h1 className="text-5xl md:text-7xl font-extrabold text-blue-800 leading-tight mb-4">
                Welcome to MediMind
              </h1>
              <p className="text-xl text-blue-700 max-w-2xl mb-2">
                Book appointments with top doctors and use our AI-powered disease prediction tool for instant, personalized insights. Your health, one click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
                <button onClick={() => navigate('/doctors')} className="w-full sm:w-auto px-8 py-3 bg-blue-100 text-blue-700 rounded-lg font-bold shadow hover:bg-blue-200 transition text-lg">Find Doctors</button>
                <button onClick={() => navigate('/disease-prediction')} className="w-full sm:w-auto px-8 py-3 bg-teal-100 text-teal-700 rounded-lg font-bold shadow hover:bg-teal-200 transition text-lg">Disease Prediction</button>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <div className="w-full max-w-md h-96 rounded-2xl shadow border-2 border-blue-100 bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <svg className="w-32 h-32 mx-auto text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-2xl font-bold text-blue-800">Your Health Journey</h3>
                  <p className="text-blue-600 mt-2">Starts Here</p>
                </div>
              </div>
            </div>
          </section>
          {/* Features Section */}
          <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mt-0">
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center border-t-4 border-blue-100">
              <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
              <h3 className="text-xl font-bold text-blue-700 mb-2">Instant Disease Prediction</h3>
              <p className="text-gray-500 text-center">AI-powered analysis for fast, accurate health insights.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center border-t-4 border-teal-100">
              <svg className="w-12 h-12 text-teal-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1h-6a1 1 0 00-1 1v9m0 0l4 4 4-4" /></svg>
              <h3 className="text-xl font-bold text-teal-600 mb-2">Top Doctors</h3>
              <p className="text-gray-500 text-center">Book appointments with trusted, highly-rated professionals.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center border-t-4 border-blue-100">
              <svg className="w-12 h-12 text-blue-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
              <h3 className="text-xl font-bold text-blue-500 mb-2">Seamless Experience</h3>
              <p className="text-gray-500 text-center">Modern, easy-to-use platform for all your healthcare needs.</p>
            </div>
          </section>
          {/* Featured Doctors */}
          <section id="doctors" className="w-full px-4 md:px-0">
            <TopDoctors />
          </section>
          {/* Speciality Menu */}
          <section className="w-full px-4 md:px-0">
            <SpecialityMenu />
          </section>
          {/* Disease Prediction Banner */}
          <section id="disease-prediction" className="w-full px-4 md:px-0">
            <Banner />
          </section>
        </main>
      </div>
  );
};

export default Home;
