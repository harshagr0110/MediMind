import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AdminContext } from "../../context/Admincontext";
import { FaUserMd, FaUser, FaFileMedical, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import Spinner from "../../components/Spinner"; // Assuming you have a Spinner component

const Dashboard = () => {
    const { backendurl } = useContext(AdminContext);
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
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (!dashboardData) {
        return <div className="p-8 text-center text-gray-500">No dashboard data available.</div>;
    }

    const stats = [
        { title: 'Total Doctors', value: dashboardData.totalDoctors, icon: <FaUserMd className="text-4xl" /> },
        { title: 'Total Patients', value: dashboardData.totalPatients, icon: <FaUser className="text-4xl" /> },
        { title: 'Total Appointments', value: dashboardData.totalAppointments, icon: <FaFileMedical className="text-4xl" /> },
        { title: 'Total Earnings', value: `₹${dashboardData.totalEarnings.toFixed(2)}`, icon: <FaRupeeSign className="text-4xl" /> },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between hover:shadow-xl transition-shadow duration-300">
                        <div>
                            <p className="text-lg font-semibold text-gray-600">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className="text-blue-500">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
