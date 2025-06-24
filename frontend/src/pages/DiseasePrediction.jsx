import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Spinner from "../components/Spinner";
import { FaStethoscope, FaExclamationTriangle, FaLightbulb, FaCamera, FaTimes } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const DiseasePrediction = () => {
    const { backendurl, token } = useContext(AppContext);
    const [symptoms, setSymptoms] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        if (!symptoms.trim() && !image) {
            return toast.error("Please enter symptoms or upload an image.");
        }
        setLoading(true);
        setPrediction(null);

        const formData = new FormData();
        formData.append('symptoms', symptoms);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await axios.post(`${backendurl}/api/user/disease-prediction`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                setPrediction(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "An error occurred.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">AI Symptom Analyzer</h1>
                <p className="text-center text-gray-600 mb-8">Enter symptoms and/or upload an image, and our AI will suggest a specialist to consult. This is not a medical diagnosis.</p>

                <form onSubmit={handlePredict}>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                        rows="4"
                        placeholder="For example: 'I have a persistent headache, dizziness, and blurred vision...'"
                    />
                    
                    <div className="mt-6">
                        <label className="block text-gray-700 font-semibold mb-2">Upload an Image (Optional)</label>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                                <FaCamera /> Choose Image
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
                            {imagePreview && (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                                    <button type="button" onClick={() => { setImage(null); setImagePreview(''); fileInputRef.current.value = null;}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-105">
                            {loading ? <Spinner /> : 'Analyze Symptoms'}
                        </button>
                    </div>
                </form>

                {prediction && (
                    <div className="mt-10 animate-fade-in">
                        {/* Disclaimer */}
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-6" role="alert">
                            <div className="flex">
                                <FaExclamationTriangle className="text-2xl mr-3" />
                                <div>
                                    <p className="font-bold">Important Disclaimer</p>
                                    <p>{prediction.disclaimer}</p>
                                </div>
                            </div>
                        </div>

                        {/* Specialist Suggestion */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center"><FaStethoscope className="mr-2" /> Suggested Specialist</h2>
                            <p className="text-2xl font-semibold text-gray-900">{prediction.specialist.name}</p>
                            <p className="text-gray-600 mt-1">{prediction.specialist.reason}</p>
                            <div className="mt-4 text-center">
                                <button onClick={() => navigate(`/doctors/${prediction.specialist.name}`)} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600">
                                    Find a {prediction.specialist.name}
                                </button>
                            </div>
                        </div>
                        
                        {/* Potential Conditions */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> For Your Information</h2>
                            <p className="text-gray-600 mb-3">To help guide your conversation with a doctor, here are some general conditions related to your symptoms:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {prediction.potential_conditions.map((condition, index) => (
                                    <li key={index}>{condition}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiseasePrediction;
