import React from 'react';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import { useNavigate } from 'react-router-dom';
import HeaderImg from '../assets/header_img.png';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-700" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Home = () => {
  const navigate = useNavigate();
  return (
    <ErrorBoundary>
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
              <img
                src={HeaderImg}
                alt="Doctor Booking Hero"
                className="w-full max-w-md rounded-2xl shadow border-2 border-blue-100 bg-white"
                loading="lazy"
              />
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
    </ErrorBoundary>
  );
};

const HomePage = (props) => (
  <ErrorBoundary>
    <Home {...props} />
  </ErrorBoundary>
);

export default HomePage;
