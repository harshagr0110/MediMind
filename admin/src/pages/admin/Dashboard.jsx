import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AdminContext } from "../../context/Admincontext";
import { toast } from 'react-toastify';
import { FaUserMd, FaUser, FaFileMedical, FaRupeeSign } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Spinner from "../../components/Spinner";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const { backendurl, admin } = useContext(AdminContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${backendurl}/api/admin/dashboard`);
                if (data.success) {
                    setDashboardData(data.data);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error("Error fetching dashboard data.");
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [backendurl]);

    if (loading) {
        return <Spinner />;
    }

    if (!dashboardData) {
        return <div className="p-8 text-center text-gray-500">No dashboard data available.</div>;
    }

    const stats = [
        { title: 'Total Doctors', value: dashboardData.totalDoctors, icon: <FaUserMd />, color: 'bg-blue-500' },
        { title: 'Total Patients', value: dashboardData.totalPatients, icon: <FaUser />, color: 'bg-green-500' },
        { title: 'Appointments', value: dashboardData.totalAppointments, icon: <FaFileMedical />, color: 'bg-yellow-500' },
        { title: 'Total Revenue', value: `₹${dashboardData.totalEarnings.toFixed(2)}`, icon: <FaRupeeSign />, color: 'bg-red-500' },
    ];

    const chartData = {
        labels: ['Doctors', 'Patients', 'Appointments'],
        datasets: [
            {
                label: 'Statistics',
                data: [dashboardData.totalDoctors, dashboardData.totalPatients, dashboardData.totalAppointments],
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Platform Overview' },
        },
    };

    return (
        <div className="p-4 md:p-10 bg-gradient-to-br from-blue-50 to-white min-h-screen">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1 drop-shadow-sm">Welcome, {admin?.fullName || 'Admin'}!</h1>
                    <p className="text-gray-500 text-lg">Here's a snapshot of your platform's activity.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow border border-blue-100">
                    <FaUserMd className="text-blue-500 mr-2" />
                    <span className="font-semibold text-gray-700">Admin Panel</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                {stats.map((stat, index) => (
                    <div key={index} className={`relative p-8 rounded-3xl overflow-hidden text-white shadow-xl border-2 border-white hover:border-blue-200 transition-all duration-200 bg-opacity-90 ${stat.color}`}>
                        <div className="relative z-10">
                            <p className="text-lg font-semibold tracking-wide opacity-90">{stat.title}</p>
                            <p className="text-5xl font-extrabold mt-2 drop-shadow">{stat.value}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 z-0 pointer-events-none">
                            {React.cloneElement(stat.icon, { size: '110' })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity Overview</h2>
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

export default Dashboard;