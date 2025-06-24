import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-10 px-2 w-full">
      <div className="w-full bg-white rounded-2xl shadow-2xl p-8 md:p-14 flex flex-col items-center border border-blue-100">
        <div className="flex flex-col items-center mb-8 w-full">
          <img
            src={assets.about_image}
            alt="About"
            className="w-36 md:w-48 rounded-2xl shadow-lg border-4 border-blue-100 mb-6"
          />
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-700 mb-2 text-center drop-shadow-sm">
            About MediMind
          </h1>
          <div className="w-20 h-1 bg-blue-200 rounded-full mb-2" />
        </div>
        <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed mb-8 font-medium w-full">
          MediMind is a modern healthcare platform that makes healthcare accessible and efficient. Book appointments with top doctors and use our AI-powered disease prediction tool for instant insights.
        </p>
        <ul className="w-full flex flex-col gap-5 text-base md:text-lg text-blue-800 mb-10">
          <li className="flex items-start gap-3">
            <span className="inline-block mt-1 text-teal-400">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#99f6e4"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span>
              <span className="font-semibold text-blue-700">AI-Powered Disease Detection:</span> Instantly analyze your symptoms and get accurate disease predictions.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block mt-1 text-teal-400">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#99f6e4"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span>
              <span className="font-semibold text-blue-700">Personalized Doctor Recommendations:</span> Find the right specialists based on your diagnosis and location.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block mt-1 text-teal-400">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#99f6e4"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span>
              <span className="font-semibold text-blue-700">Seamless Appointment Booking:</span> Book slots with top doctors in just a few clicks.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-block mt-1 text-teal-400">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#99f6e4"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span>
              <span className="font-semibold text-blue-700">Secure &amp; Private:</span> Your health data is encrypted and handled with utmost confidentiality.
            </span>
          </li>
        </ul>
        <div className="w-full bg-blue-50 rounded-2xl p-6 md:p-8 text-center shadow-md border border-blue-100">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-3">Why Choose MediMind?</h2>
          <p className="text-gray-700 mb-2 font-medium">
            Our platform combines advanced AI with a user-friendly interface to empower you to take control of your health journey.
          </p>
          <p className="text-teal-600 font-semibold">
            Start your path to better health today—fast, easy, and reliable!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
