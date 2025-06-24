import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-blue-100 text-gray-700 pt-12 pb-6 px-4 md:px-16 shadow-inner relative overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-teal-300 to-blue-200 opacity-60" />
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center md:items-start gap-12 md:gap-8 z-10">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start flex-1 min-w-[220px]">
          <img src={assets.logo} alt="Logo" className="h-24 mb-4 rounded-lg shadow bg-white p-2" />
          <p className="text-gray-700 text-sm text-center md:text-left max-w-xs">
            Your trusted healthcare partner.<br />
            Providing quality care and support for your well-being.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-1 justify-center md:justify-between gap-8 w-full md:w-auto">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold mb-3 text-blue-700">Company</h4>
            <ul className="space-y-2 text-gray-700">
              <li>
                <a href="/about" className="hover:text-blue-600 transition font-medium">About Us</a>
              </li>
              <li>
                <a href="/careers" className="hover:text-blue-600 transition font-medium">Careers</a>
              </li>
              <li>
                <a href="/blog" className="hover:text-blue-600 transition font-medium">Blog</a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold mb-3 text-blue-700">Support</h4>
            <ul className="space-y-2 text-gray-700">
              <li>
                <a href="/contact" className="hover:text-blue-600 transition font-medium">Contact</a>
              </li>
              <li>
                <a href="/faq" className="hover:text-blue-600 transition font-medium">FAQ</a>
              </li>
              <li>
                <a href="/help" className="hover:text-blue-600 transition font-medium">Help Center</a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-bold mb-3 text-blue-700">Legal</h4>
            <ul className="space-y-2 text-gray-700">
              <li>
                <a href="/privacy" className="hover:text-blue-600 transition font-medium">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-600 transition font-medium">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social */}
        <div className="flex flex-col items-center md:items-end flex-1 min-w-[180px]">
          <h4 className="text-lg font-bold mb-3 text-blue-700">Follow Us</h4>
          <div className="flex space-x-4 mt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              {/* Facebook SVG */}
              <span className="inline-block bg-blue-50 rounded-full p-1 shadow">
                <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"/></svg>
              </span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              {/* X (Twitter) SVG */}
              <span className="inline-block bg-blue-50 rounded-full p-1 shadow">
                <svg className="h-8 w-8 text-gray-900" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="16" fill="white"/>
                  <path d="M10 10L22 22M22 10L10 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              {/* Instagram SVG */}
              <span className="inline-block bg-blue-50 rounded-full p-1 shadow">
                <svg className="h-8 w-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm6 1.25a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-200 mt-10 pt-6 text-center text-gray-700 text-sm">
        © {new Date().getFullYear()} <span className="font-semibold text-blue-700">MediMind</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;