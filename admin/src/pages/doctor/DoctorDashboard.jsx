import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';
import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';
import { FaUserInjured, FaCalendarCheck, FaRupeeSign, FaClock } from 'react-icons/fa';

const StatCard = ({ icon, title, value, color }) => (
    <div className={`relative p-6 rounded-2xl overflow-hidden text-white shadow-lg transform transition-transform hover:scale-105 ${color}`}>
        <div className="relative z-10">
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 z-0">
            {React.cloneElement(icon, { size: '100' })}
        </div>
    </div>
);

const DoctorDashboard = () => {
    const { backendurl, dToken, doctor } = useContext(DoctorContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!dToken) {
                setLoading(false);
                return;
            };

            try {
                const { data } = await axios.get(`${backendurl}/api/doctor/dashboard`, {
                    headers: { Authorization: `Bearer ${dToken}` }
                });

                if (data.success) {
                    setDashboardData(data.data);
                } else {
                    toast.error(data.message || "Failed to fetch dashboard data.");
                }
            } catch (error) {
                toast.error("An error occurred while fetching dashboard data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [backendurl, dToken]);

    if (loading) {
        return <Spinner />;
    }

    if (!dashboardData) {
        return (
            <div className="p-8 text-center bg-gray-100 min-h-screen">
                <h1 className="text-2xl text-gray-600">Could not load dashboard data.</h1>
                <p className="text-gray-500">Please try refreshing the page or contact support.</p>
            </div>
        );
    }

    const { totalAppointments, totalPatients, totalEarnings, upcomingAppointments } = dashboardData;

    const stats = [
        { title: 'Total Patients', value: totalPatients, icon: <FaUserInjured />, color: 'bg-green-500' },
        { title: 'Total Appointments', value: totalAppointments, icon: <FaCalendarCheck />, color: 'bg-blue-500' },
        { title: 'Total Earnings', value: `₹${totalEarnings.toFixed(2)}`, icon: <FaRupeeSign />, color: 'bg-red-500' },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, Dr. {doctor?.fullName || 'Doctor'}!</h1>
                <p className="text-gray-500">Here's what's happening today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
                {upcomingAppointments && upcomingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Patient Name</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingAppointments.map((app, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.patientName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            <span className="flex items-center gap-2">
                                                <FaClock className="text-blue-500" />
                                                {app.time}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">You have no upcoming appointments.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;