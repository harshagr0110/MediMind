import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", fullName: "", password: "" });
  const { backendurl, token, setToken, setUserId } = useContext(AppContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const endpoint = isRegister ? "register" : "login";
    const url = `${backendurl}/api/user/${endpoint}`;
    const payload = isRegister
      ? { email: form.email, fullName: form.fullName, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const response = await axios.post(url, payload);
      const data = response?.data;
      if (data?.success) {
        setSuccess(data.message || "Success!");
        setToken(data.token);
        setUserId(data.userId);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
      } else {
        setError(data?.message || "Operation failed");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unexpected error occurred"
      );
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center w-full py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-blue-100 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Login to MediMind</h1>
        <form className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="p-3 rounded-xl border border-blue-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-bold mt-2 shadow-md transition-all"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-gray-700 text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-semibold">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
