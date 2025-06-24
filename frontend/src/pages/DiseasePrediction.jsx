import React, { useState, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
// --- Frontend Configuration ---
// The backend URL where your Node.js server will be running.
// Make sure this matches the port your backend server listens on.


// --- Speciality Data (Using Emojis/Text as placeholders for SVGs) ---
const specialityData = [
  { speciality: "General Practitioner", icon: "👨‍⚕️", urlPath: "/doctors/general-practitioner" },
  { speciality: "Dermatologist", icon: "🧴", urlPath: "/doctors/dermatologist" },
  { speciality: "Cardiologist", icon: "❤️", urlPath: "/doctors/cardiology" },
  { speciality: "Neurologist", icon: "🧠", urlPath: "/doctors/neurologist" },
  { speciality: "Orthopedic", icon: "🦴", urlPath: "/doctors/orthopedic" },
  { speciality: "Pediatrician", icon: "👶", urlPath: "/doctors/pediatrician" },
  { speciality: "Gastroenterologist", icon: "🍽️", urlPath: "/doctors/gastroenterologist" },
  { speciality: "Ophthalmologist", icon: "👁️", urlPath: "/doctors/ophthalmologist" },
  { speciality: "ENT Specialist", icon: "👂👃", urlPath: "/doctors/ent-specialist" },
  { speciality: "Psychiatrist", icon: "🛋️", urlPath: "/doctors/psychiatrist" },
  { speciality: "Urologist", icon: "💧", urlPath: "/doctors/urologist" },
  { speciality: "Nephrologist", icon: "💧", urlPath: "/doctors/nephrologist" }, 
  { speciality: "Endocrinologist", icon: "💉", urlPath: "/doctors/endocrinologist" },
  { speciality: "Oncologist", icon: "🔬", urlPath: "/doctors/oncologist" },
  { speciality: "Pulmonologist", icon: "🌬️", urlPath: "/doctors/pulmonologist" }, // Corrected icon for Pulmonologist
  { speciality: "Hematologist", icon: "🩸", urlPath: "/doctors/hematologist" },
  { speciality: "Rheumatologist", icon: "💪", urlPath: "/doctors/rheumatologist" },
  { speciality: "Allergist", icon: "🤧", urlPath: "/doctors/allergist" },
  { speciality: "ID Specialist", icon: "🦠", urlPath: "/doctors/id-specialist" },
  { speciality: "Plastic Surgeon", icon: "✨", urlPath: "/doctors/plastic-surgeon" },
  { speciality: "Anesthesiologist", icon: "😴", urlPath: "/doctors/anesthesiologist" },
  { speciality: "Pathologist", icon: "📜", urlPath: "/doctors/pathologist" },
  { speciality: "Radiologist", icon: "☢️", urlPath: "/doctors/radiologist" },
  { speciality: "Orthodontist", icon: "🦷", urlPath: "/doctors/orthodontist" },
  { speciality: "Dentist", icon: "🦷", urlPath: "/doctors/dentist" },
];

// Function to parse the AI's detailed response into displayable HTML.
const extractDiseaseInfo = (fullText) => {
  if (!fullText) return "";
  // Corrected regex for bold text. Matches text between double asterisks.
  let formattedText = fullText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Add line breaks for readability from markdown newlines.
  formattedText = formattedText.replace(/\n/g, '<br/>');
  return formattedText;
};

// Main DiseasePrediction Component
const DiseasePrediction = () => {
  const navigate = useNavigate();
  const {backendurl}=useContext(AppContext);
  const [prompt, setPrompt] = useState("");
  const [selectedImages, setSelectedImages] = useState([]); // File objects
  // const [base64Images, setBase64Images] = useState([]); // Base64 strings for API
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [specialistResult, setSpecialistResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null); // Ref for file input element

  // State to manage current view: 'prediction' or 'doctorList' or 'doctorDetail'
  const [currentPage, setCurrentPage] = useState('prediction');

  // Handles image file selection and conversion to Base64
  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setSelectedImages(prev => [...prev, ...files]);
  };

  // Removes a selected image by index
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  const handleclick=async()=>{
        navigate('/doctors/'+specialistResult);
        //console.log(selectedDoctor);
    }
  // Handles API submission
  const handleSubmit = async () => {
    if (!prompt.trim() && selectedImages.length === 0) {
      return setError("Please describe your symptoms or upload images.");
    }

    setLoading(true);
    setError(null);
    setDiseaseInfo(null);
    setSpecialistResult(null);
    setCurrentPage('prediction'); // Ensure we are on the prediction page view

    try {
      let response;
      if (selectedImages.length > 0) {
        // Use FormData for images
        const formData = new FormData();
        formData.append('symptoms', prompt);
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });
        formData.append('specialitiesList', JSON.stringify(specialityData.map(d => d.speciality)));
        response = await axios.post(`${backendurl}/api/user/predict`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Use JSON for text-only
        response = await axios.post(`${backendurl}/api/user/predict`,
          {
            symptoms: prompt,
            images: [],
            specialitiesList: specialityData.map(d => d.speciality)
          },
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const { diseaseInfo: backendDiseaseInfo, specialistResult: backendSpecialistResult } = response.data;

      if (!backendDiseaseInfo) {
        throw new Error("No disease information returned from backend.");
      }
      setDiseaseInfo(extractDiseaseInfo(backendDiseaseInfo));

      if (!backendSpecialistResult) {
        throw new Error("No specialist suggestion returned from backend.");
      }
      // Attempt to map the AI's response to an existing specialty for navigation
      const matchedSpecialty = specialityData.find(s =>
        backendSpecialistResult.trim().toLowerCase().includes(s.speciality.toLowerCase()) ||
        s.speciality.toLowerCase().includes(backendSpecialistResult.trim().toLowerCase())
      );
      setSpecialistResult(matchedSpecialty ? matchedSpecialty.speciality : backendSpecialistResult.trim());

    } catch (err) {
      console.error("Prediction error:", err);
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Network Error: Could not connect to the backend. Please ensure your backend server is running.');
        } else if (err.response.status >= 400 && err.response.status < 500) {
          setError(`Backend Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.message}. Double check your API key in the backend's .env file.`);
        } else {
          setError(`Server Error ${err.response.status}: ${err.response.data?.error || err.response.data?.message || err.message}.`);
        }
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render the Prediction Form
  const renderPredictionForm = () => (
    <div className="p-8 w-full max-w-2xl bg-white bg-opacity-90 rounded-2xl shadow-xl border border-blue-100 backdrop-blur-sm">
      <h2 className="text-4xl font-extrabold mb-8 text-blue-800 text-center drop-shadow-md">
        MediMind AI Assistant
      </h2>

      {/* Symptoms Textarea */}
      <div className="mb-6">
        <label htmlFor="symptoms" className="block text-lg font-semibold text-gray-700 mb-2">
          Describe your symptoms:
        </label>
        <textarea
          id="symptoms"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: I have a persistent cough, shortness of breath, and a low-grade fever for the past three days..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-800 shadow-sm text-base h-32 resize-y"
        ></textarea>
      </div>

      {/* Image Upload Section */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Upload relevant images (optional):
        </label>
        <input
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 cursor-pointer"
          ref={fileInputRef}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          {selectedImages.map((file, index) => (
            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={URL.createObjectURL(file)}
                alt={`Uploaded ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-60 transition-all duration-300 font-extrabold text-lg shadow-lg transform hover:scale-105"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </span>
        ) : (
          "Predict Disease"
        )}
      </button>

      {/* Error Message */}
      {error && <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 text-sm font-medium animate-pulse">{error}</div>}

      {/* Disease Information Result */}
      {diseaseInfo && (
        <div className="mt-8 bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-bold mb-4 text-blue-700">Possible Condition Information</h3>
          <p className="text-gray-800 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: diseaseInfo }}></p>
        </div>
      )}

      {/* Specialist Recommendation and Doctor Button */}
      {specialistResult && (
        <div className="mt-6 p-6 bg-green-50 rounded-xl shadow-inner border border-green-200 flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-3 text-green-700 text-center">Recommended Specialist:</h3>
          <p className="text-green-800 font-extrabold text-3xl mb-4">{specialistResult}</p>
          <button
            onClick={() =>handleclick()}
            className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors duration-200 font-semibold shadow-lg transform hover:scale-105"
          >
            Show Doctors
          </button>
        </div>
      )}
    </div>
  );

  
  // Render the Doctor Detail Page (Simulated)
  

  // Main component render based on currentPage state
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-blue-50 font-inter">
      {currentPage === 'prediction' && renderPredictionForm()}
    </div>
  );
};

export default DiseasePrediction;
