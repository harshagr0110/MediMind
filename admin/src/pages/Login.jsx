import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AdminContext } from "../context/Admincontext";
import { DoctorContext } from "../context/Doctorcontext";
import { assets } from "../assets/assets_admin/assets.js";

const Login = () => {
  const { backendurl: adminBackendUrl, setAToken } = useContext(AdminContext);
  const { backendurl: doctorBackendUrl, setDToken } = useContext(DoctorContext);

  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loginType, setLoginType] = useState("admin"); // "admin" or "doctor"
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setForm({ email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isDoctor = loginType === "doctor";
    const url = isDoctor 
      ? `${doctorBackendUrl}/api/doctor/login` 
      : `${adminBackendUrl}/api/admin/login`;
    
    try {
      const response = await axios.post(url, form);

      if (response.data.success) {
        toast.success("Login successful!");
        if (isDoctor) {
          localStorage.setItem("dToken", response.data.token);
          setDToken(response.data.token);
          localStorage.removeItem("aToken");
          setAToken(null);
          navigate("/doctor/dashboard");
        } else {
          localStorage.setItem("aToken", response.data.token);
          setAToken(response.data.token);
          localStorage.removeItem("dToken");
          setDToken(null);
          navigate("/admin/dashboard");
        }
      } else {
        toast.error(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <img src={assets.logo} alt="MediMind Logo" className="w-48 mb-8" />
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* TABS */}
            <div className="flex">
                <button
                    type="button"
                    onClick={() => handleLoginTypeChange("admin")}
                    className={`flex-1 p-4 text-center font-semibold transition-colors duration-300 ${
                        loginType === "admin"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    Admin
                </button>
                <button
                    type="button"
                    onClick={() => handleLoginTypeChange("doctor")}
                    className={`flex-1 p-4 text-center font-semibold transition-colors duration-300 ${
                        loginType === "doctor"
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    Doctor
                </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    {loginType === "admin" ? "Administrator Login" : "Doctor Login"}
                </h2>
                
                {/* Email Input */}
                <div className="relative">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-transparent"
                        placeholder="Email"
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-4 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm bg-white px-1"
                    >
                        Email Address
                    </label>
                </div>

                {/* Password Input */}
                <div className="relative">
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="peer w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-transparent"
                        placeholder="Password"
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-4 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm bg-white px-1"
                    >
                        Password
                    </label>
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 text-lg text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                        loginType === "admin" ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </button>
            </form>
        </div>
    </div>
  );
};

export default Login;