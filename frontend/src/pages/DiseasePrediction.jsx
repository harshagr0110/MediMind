import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Spinner from "../components/Spinner";
import { FaStethoscope, FaExclamationTriangle, FaLightbulb, FaCamera, FaTimes } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

// ErrorBoundary for this page
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {}
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-400 to-blue-700">
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
            console.log('[DiseasePrediction] Response received:', response.data);
            if (response.data.success) {
                console.log('[DiseasePrediction] Data to set:', response.data.data);
                setPrediction(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "An error occurred.";
            console.error('[DiseasePrediction] Error:', err);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Robust guards for prediction rendering
    let disclaimer = '';
    let diseaseName = '';
    let diseaseDescription = '';
    let specialist = null;
    let analysis = [];
    let symptomsList = [];
    let causesList = [];
    let preventionList = [];
    let evidenceList = [];
    let potentialConditions = [];
    
    if (prediction) {
        console.log('[DiseasePrediction] Processing prediction:', prediction);
        console.log('[DiseasePrediction] Causes from prediction:', prediction.causes);
        console.log('[DiseasePrediction] Prevention from prediction:', prediction.prevention);
        
        if (prediction.raw) {
            disclaimer = 'This is an AI-generated suggestion. Please consult a real doctor.';
            diseaseName = 'Analysis Result';
            diseaseDescription = '';
            specialist = { name: 'Specialist', reason: 'Consult a specialist for your symptoms.' };
            analysis = [];
            symptomsList = [];
            causesList = [];
            preventionList = [];
            evidenceList = [];
            potentialConditions = [prediction.raw];
        } else {
            disclaimer = prediction.disclaimer || 'This is an AI-generated suggestion. Please consult a real doctor.';
            diseaseName = prediction.disease_name || 'Unknown Disease';
            diseaseDescription = prediction.disease_description || '';
            specialist = prediction.specialist || { name: 'Specialist', reason: 'Consult a specialist for your symptoms.' };
            analysis = Array.isArray(prediction.analysis) ? prediction.analysis : (prediction.analysis ? [prediction.analysis] : []);
            symptomsList = Array.isArray(prediction.symptoms) ? prediction.symptoms : [];
            causesList = Array.isArray(prediction.causes) ? prediction.causes : [];
            preventionList = Array.isArray(prediction.prevention) ? prediction.prevention : [];
            evidenceList = Array.isArray(prediction.evidence) ? prediction.evidence : [];
            potentialConditions = Array.isArray(prediction.potential_conditions) ? prediction.potential_conditions : [prediction.potential_conditions || 'No conditions found.'];
            
            console.log('[DiseasePrediction] Extracted causesList:', causesList);
            console.log('[DiseasePrediction] Extracted preventionList:', preventionList);
        }
    }

    return (
        <ErrorBoundary>
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
            <div className="w-full max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Medical Symptom Analysis</h1>
                    <p className="text-lg text-gray-600">AI-assisted preliminary assessment - Not a substitute for professional medical advice</p>
                </div>

                {/* Input Form */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-12 border border-gray-200">
                    <form onSubmit={handlePredict} className="w-full">
                        <div className="mb-6">
                            <label className="block text-gray-800 font-semibold mb-3 text-lg">Describe Your Symptoms</label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 resize-none"
                                rows="5"
                                placeholder="Example: I have a persistent headache for 3 days, accompanied by dizziness and sensitivity to light..."
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-gray-800 font-semibold mb-3 text-lg">Upload Medical Image (Optional)</label>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition">
                                    <FaCamera className="text-lg" /> Choose Image
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
                                {imagePreview && (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border-2 border-gray-300 shadow" />
                                        <button type="button" onClick={() => { setImage(null); setImagePreview(''); fileInputRef.current.value = null;}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white font-semibold py-4 px-16 rounded-lg text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md">
                                {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results */}
                {prediction && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Disease Name & Description */}
                        {prediction.disease_name && prediction.disease_name !== 'Analysis Unavailable' ? (
                            <div className="bg-blue-50 rounded-lg shadow-md p-8 border-l-4 border-blue-600">
                                <h2 className="text-3xl font-bold text-blue-900 mb-3">Identified Condition: {prediction.disease_name}</h2>
                                {prediction.disease_description && (
                                    <p className="text-gray-700 text-lg leading-relaxed">{prediction.disease_description}</p>
                                )}
                            </div>
                        ) : null}

                        {/* Causes Section */}
                        {causesList.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Causes</h3>
                                <ul className="space-y-3">
                                    {causesList.map((cause, idx) => (
                                        <li key={idx} className="flex gap-3 text-gray-700">
                                            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                                            <span className="text-lg">{cause}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Precautions Section */}
                        {preventionList.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Recommended Precautions</h3>
                                <ul className="space-y-3">
                                    {preventionList.map((item, idx) => (
                                        <li key={idx} className="flex gap-3 text-gray-700">
                                            <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                                            <span className="text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recommended Specialist */}
                        {specialist?.name && (
                            <div className="bg-blue-600 text-white rounded-lg shadow-md p-8">
                                <h3 className="text-2xl font-bold mb-3">Recommended Specialist</h3>
                                <p className="text-xl mb-2">{specialist.name}</p>
                                <p className="text-blue-100 mb-6">{specialist.reason}</p>
                                <button 
                                    onClick={() => navigate(`/doctors/${specialist.name}`)} 
                                    className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
                                >
                                    Find a {specialist.name}
                                </button>
                            </div>
                        )}

                        {/* Medical Disclaimer */}
                        <div className="bg-yellow-50 rounded-lg shadow-md p-8 border-l-4 border-yellow-600">
                            <div className="flex gap-4">
                                <FaExclamationTriangle className="text-2xl text-yellow-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-900 mb-2">Important Medical Disclaimer</h3>
                                    <p className="text-gray-700">{disclaimer}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </ErrorBoundary>
    );
};

export default DiseasePrediction;
