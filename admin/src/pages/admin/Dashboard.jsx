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
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome, {admin?.fullName || 'Admin'}!</h1>
                <p className="text-gray-500">Here's a snapshot of your platform's activity.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className={`relative p-6 rounded-2xl overflow-hidden text-white shadow-lg transition-transform transform hover:scale-105 ${stat.color}`}>
                        <div className="relative z-10">
                            <p className="text-lg font-semibold">{stat.title}</p>
                            <p className="text-4xl font-bold mt-2">{stat.value}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 z-0">
                            {React.cloneElement(stat.icon, { size: '100' })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Overview</h2>
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

export default Dashboard;