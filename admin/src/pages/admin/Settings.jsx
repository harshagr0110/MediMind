import React from 'react';

const Settings = () => (
  <div className="p-2 sm:p-8 md:p-12 bg-white min-h-screen flex flex-col items-center">
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-black mb-6 sm:mb-10">Settings</h1>
      <div className="bg-white border border-gray-200 p-4 sm:p-10">
        <h2 className="text-lg sm:text-2xl font-bold text-black mb-4">Panel Settings</h2>
        <p className="text-gray-700 text-base sm:text-lg">Settings options will be available here.</p>
      </div>
    </div>
  </div>
);

export default Settings;