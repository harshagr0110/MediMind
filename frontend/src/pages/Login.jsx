import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
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

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", fullName: "", password: "" });
  const { backendurl, token, setToken, setUserId } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [location.pathname]);

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
        if (!isRegister) {
          setToken(data.token);
          let userId = data.userId;
          if (!userId && data.token) {
            try {
              const decoded = jwtDecode(data.token);
              userId = decoded.id;
            } catch {}
          }
          setUserId(userId);
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", userId);
        }
        // Handle successful registration - maybe navigate to login or show message
        if(isRegister) {
          setTimeout(() => navigate('/login'), 2000);
        }
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">{isRegister ? "Create an Account" : "Login to MediMind"}</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {isRegister && (
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              type="text"
              placeholder="Full Name"
              required
              className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          )}
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
            required
            className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            required
            className="p-3 rounded-xl border border-blue-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-teal-300 transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-bold mt-2 shadow-md transition-all"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
        <div className="mt-6 text-gray-700 text-sm">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Link to={isRegister ? "/login" : "/register"} className="text-blue-600 hover:underline font-semibold">
            {isRegister ? "Login" : "Register"}
          </Link>
        </div>
      </div>
    </div>
  );
};

const LoginPage = (props) => (
  <ErrorBoundary>
    <Login {...props} />
  </ErrorBoundary>
);

export default LoginPage;
