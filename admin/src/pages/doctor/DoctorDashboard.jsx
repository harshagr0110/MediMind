import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';
// import Spinner from '../../components/Spinner';
import { toast } from 'react-toastify';
import { FaUserInjured, FaCalendarCheck, FaRupeeSign } from 'react-icons/fa';

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 border-l-4 ${color}`}>
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DoctorDashboard = () => {
    const { backendurl } = useContext(DoctorContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await axios.get(`${backendurl}/api/doctor/dashboard`);
                if (data.success) {
                    setDashboardData(data.data);
                } else {
                    toast.error("Failed to fetch dashboard data.");
                }
            } catch (error) {
                toast.error("An error occurred while fetching dashboard data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [backendurl]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!dashboardData) return <div className="p-8 text-center">Could not load dashboard data.</div>;

    const { totalAppointments, totalPatients, totalEarnings, upcomingAppointments } = dashboardData;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<FaCalendarCheck className="text-blue-500"/>} title="Total Appointments" value={totalAppointments} color="border-blue-500" />
                <StatCard icon={<FaUserInjured className="text-green-500"/>} title="Total Patients" value={totalPatients} color="border-green-500" />
                <StatCard icon={<FaRupeeSign className="text-red-500"/>} title="Total Earnings" value={`₹${totalEarnings.toFixed(2)}`} color="border-red-500" />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Upcoming Appointments</h2>
                {upcomingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3">Patient Name</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingAppointments.map((app, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{app.patientName}</td>
                                        <td className="p-3">{app.date}</td>
                                        <td className="p-3">{app.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No upcoming appointments.</p>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
