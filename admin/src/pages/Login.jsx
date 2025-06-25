import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/Admincontext';
import { DoctorContext } from '../context/Doctorcontext';
import logo from '../assets/assets_admin/admin_logo.svg';

const Login = ({ backendurl }) => {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setAToken } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = role === 'admin' ? '/api/admin/login' : '/api/doctor/login';
      const { data } = await axios.post(`${backendurl}${endpoint}`, { email, password });
      if (data.success && data.token) {
        if (role === 'admin') {
          setAToken(data.token);
          localStorage.setItem('admin_token', data.token);
          navigate('/admin-dashboard');
        } else {
          setDToken(data.token);
          localStorage.setItem('doctor_token', data.token);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = role === 'admin' ? '/api/admin/register' : '/api/doctor/register';
      const payload = { email, password, fullName };
      const { data } = await axios.post(`${backendurl}${endpoint}`, payload);
      if (data.success) {
        setSuccess('Registration successful! You can now log in.');
        setTab('login');
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-md border border-blue-200 flex flex-col items-center">
        <img src={logo} alt="MediMind Logo" className="w-16 h-16 mb-4" />
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center tracking-tight">MediMind Portal</h1>
        <div className="flex w-full mb-8 mt-4">
          <button
            className={`flex-1 py-3 rounded-l-lg font-bold text-lg transition-all duration-200 ${tab === 'login' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 rounded-r-lg font-bold text-lg transition-all duration-200 ${tab === 'register' ? 'bg-blue-600 text-white shadow' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
          >
            Register
          </button>
        </div>
        <div className="flex w-full mb-6">
          <button
            className={`flex-1 py-2 rounded-l-lg font-semibold text-base transition-all duration-200 ${role === 'admin' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg font-semibold text-base transition-all duration-200 ${role === 'doctor' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg text-lg font-bold mt-2 shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-5 w-full">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg text-lg font-bold mt-2 shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Registering...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>
        )}
        {error && <p className="text-red-500 mt-6 text-center font-semibold">{error}</p>}
        {success && <p className="text-green-600 mt-6 text-center font-semibold">{success}</p>}
      </div>
    </div>
  );
};

export default Login;