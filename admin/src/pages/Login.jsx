import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/Admincontext';
import { DoctorContext } from '../context/Doctorcontext';
import logo from '../assets/assets_admin/logo.png';

const Login = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}${role === 'admin' ? '/api/admin/login' : '/api/doctor/login'}`;

      const { data } = await axios.post(endpoint, { email, password });
      if (data.success && data.token) {
        if (role === 'admin') {
          setAToken(data.token);
          localStorage.setItem('admin_token', data.token);
          navigate('/admin-dashboard');
        } else {
          setDToken(data.token);
          console.log('Doctor token after login:', data.token);
          navigate('/doctor-dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="bg-white/95 shadow-2xl rounded-3xl p-10 w-full max-w-md border border-blue-100 flex flex-col items-center backdrop-blur-md">
        <img src={logo} alt="MediMind Logo" className="w-20 h-20 mb-6 drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2 text-center tracking-tight">MediMind Portal</h1>
        <p className="text-blue-500 mb-8 text-center font-medium">Sign in as Admin or Doctor</p>
        <div className="flex w-full mb-8 gap-2">
          <button
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${role === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
            onClick={() => setRole('admin')}
          >
            Admin Login
          </button>
          <button
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${role === 'doctor' ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
            onClick={() => setRole('doctor')}
          >
            Doctor Login
          </button>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-4 rounded-xl text-lg font-bold mt-2 shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? `Logging in as ${role.charAt(0).toUpperCase() + role.slice(1)}...` : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
        {error && <p className="text-red-500 mt-6 text-center font-semibold">{error}</p>}
      </div>
    </div>
  );
};

export default Login;