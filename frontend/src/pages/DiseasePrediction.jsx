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

    // Robust guards for prediction rendering
    let disclaimer = '';
    let specialist = null;
    let analysis = [];
    let symptomsList = [];
    let causesList = [];
    let preventionList = [];
    let evidenceList = [];
    let potentialConditions = [];
    if (prediction) {
        if (prediction.raw) {
            disclaimer = 'This is an AI-generated suggestion. Please consult a real doctor.';
            specialist = { name: 'Specialist', reason: 'Consult a specialist for your symptoms.' };
            analysis = [];
            symptomsList = [];
            causesList = [];
            preventionList = [];
            evidenceList = [];
            potentialConditions = [prediction.raw];
        } else {
            disclaimer = prediction.disclaimer || 'This is an AI-generated suggestion. Please consult a real doctor.';
            specialist = prediction.specialist || { name: 'Specialist', reason: 'Consult a specialist for your symptoms.' };
            analysis = Array.isArray(prediction.analysis) ? prediction.analysis : (prediction.analysis ? [prediction.analysis] : []);
            symptomsList = Array.isArray(prediction.symptoms) ? prediction.symptoms : [];
            causesList = Array.isArray(prediction.causes) ? prediction.causes : [];
            preventionList = Array.isArray(prediction.prevention) ? prediction.prevention : [];
            evidenceList = Array.isArray(prediction.evidence) ? prediction.evidence : [];
            potentialConditions = Array.isArray(prediction.potential_conditions) ? prediction.potential_conditions : [prediction.potential_conditions || 'No conditions found.'];
        }
    }

    return (
        <ErrorBoundary>
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-400 to-blue-700">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10 md:p-16 flex flex-col items-center">
                <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-6 drop-shadow-lg">AI Symptom Analyzer</h1>
                <p className="text-center text-gray-600 mb-8 text-lg">Enter symptoms and/or upload an image, and our AI will suggest a specialist to consult. This is not a medical diagnosis.</p>
                <form onSubmit={handlePredict} className="w-full">
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full p-5 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-400 transition-shadow text-lg min-h-[120px] resize-none mb-6 shadow-sm"
                        rows="5"
                        placeholder="For example: 'I have a persistent headache, dizziness, and blurred vision...'"
                    />
                    <div className="mt-4">
                        <label className="block text-blue-700 font-semibold mb-2">Upload an Image (Optional)</label>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-lg shadow">
                                <FaCamera /> Choose Image
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
                            {imagePreview && (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-blue-300 shadow" />
                                    <button type="button" onClick={() => { setImage(null); setImagePreview(''); fileInputRef.current.value = null;}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-4 px-12 rounded-xl text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-transform transform hover:scale-105 shadow-lg">
                            {loading ? <Spinner /> : 'Analyze Symptoms'}
                        </button>
                    </div>
                </form>
                {prediction && (
                    <div className="mt-12 w-full animate-fade-in">
                        {/* Disease/Condition Analysis */}
                        {analysis.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-6 shadow">
                                <h2 className="text-2xl font-bold text-blue-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> Disease/Condition Analysis</h2>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
                                    {analysis.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        {/* Symptoms */}
                        {symptomsList.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> Symptoms</h2>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
                                    {symptomsList.map((symptom, idx) => <li key={idx}>{symptom}</li>)}
                                </ul>
                            </div>
                        )}
                        {/* Causes */}
                        {causesList.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> Causes</h2>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
                                    {causesList.map((cause, idx) => <li key={idx}>{cause}</li>)}
                                </ul>
                            </div>
                        )}
                        {/* Prevention */}
                        {preventionList.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> Prevention</h2>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
                                    {preventionList.map((item, idx) => <li key={idx}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        {/* Evidence */}
                        {evidenceList.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> Evidence</h2>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
                                    {evidenceList.map((evidence, idx) => <li key={idx}>{evidence}</li>)}
                                </ul>
                            </div>
                        )}
                        {/* Potential Conditions */}
                        {potentialConditions.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 shadow">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center"><FaLightbulb className="mr-2" /> Potential Conditions</h2>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-lg">
                                    {potentialConditions.map((condition, index) => (
                                        <li key={index}>{condition}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Specialist Suggestion */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-6 shadow">
                            <h2 className="text-2xl font-bold text-blue-800 mb-3 flex items-center"><FaStethoscope className="mr-2" /> Suggested Specialist</h2>
                            <p className="text-3xl font-semibold text-gray-900">{specialist?.name || 'Specialist'}</p>
                            <p className="text-gray-600 mt-1 text-lg">{specialist?.reason || 'Consult a specialist for your symptoms.'}</p>
                            <div className="mt-6 text-center">
                                <button onClick={() => navigate(`/doctors/${specialist?.name || 'Specialist'}`)} className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 text-lg shadow">
                                    Find a {specialist?.name || 'Specialist'}
                                </button>
                            </div>
                        </div>
                        {/* Disclaimer */}
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mt-6" role="alert">
                            <div className="flex">
                                <FaExclamationTriangle className="text-2xl mr-3" />
                                <div>
                                    <p className="font-bold">Important Disclaimer</p>
                                    <p>{disclaimer}</p>
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
