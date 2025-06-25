import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminContext } from "../context/Admincontext";
import { DoctorContext } from "../context/Doctorcontext";
import { assets } from "../assets/assets_admin/assets.js";
import { FaUserShield, FaUserMd, FaEnvelope, FaLock } from 'react-icons/fa';
import Spinner from "../components/Spinner";

const Login = () => {
    const { setAToken } = useContext(AdminContext);
    const { setDToken } = useContext(DoctorContext);
    const backendurl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loginType, setLoginType] = useState("admin");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isDoctor = loginType === "doctor";
        const url = isDoctor
            ? `${backendurl}/api/doctor/login`
            : `${backendurl}/api/admin/login`;

        try {
            const response = await axios.post(url, form);
            if (response.data.success) {
                toast.success(`Welcome, ${loginType}!`);
                if (isDoctor) {
                    localStorage.setItem("dToken", response.data.token);
                    setDToken(response.data.token);
                    navigate("/doctor/dashboard");
                } else {
                    localStorage.setItem("aToken", response.data.token);
                    setAToken(response.data.token);
                    navigate("/admin/dashboard");
                }
            } else {
                toast.error(response.data.message || "Login failed.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center p-4">
            <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side - Branding */}
                <div className="w-full md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-center items-center text-center" style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)' }}>
                    <img src={assets.logo} alt="MediMind Logo" className="w-32 mb-4 invert brightness-0" />
                    <h1 className="text-4xl font-bold mb-2">MediMind</h1>
                    <p className="text-lg text-blue-100">Management Portal</p>
                    <p className="mt-6 text-blue-200 text-sm max-w-sm">
                        Access the control panel for managing doctors, appointments, and content. Your central hub for platform administration.
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                    <p className="text-gray-500 mb-8">Please select your role and enter your details.</p>

                    <div className="flex border border-gray-300 rounded-lg p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setLoginType("admin")}
                            className={`w-1/2 p-2 rounded-md text-center font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${loginType === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
                        >
                            <FaUserShield /> Admin
                        </button>
                        <button
                             type="button"
                            onClick={() => setLoginType("doctor")}
                            className={`w-1/2 p-2 rounded-md text-center font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${loginType === 'doctor' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
                        >
                            <FaUserMd /> Doctor
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="relative">
                            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 text-lg text-white font-bold rounded-lg transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                        >
                            {loading && <Spinner sm />}
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500">
                           Need assistance? <a href="#" className="font-semibold text-blue-600 hover:underline">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;