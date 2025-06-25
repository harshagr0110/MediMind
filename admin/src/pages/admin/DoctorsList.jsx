import axios from 'axios';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaTrash, FaSearch } from 'react-icons/fa';
import { AdminContext } from '../../context/Admincontext';
import Spinner from '../../components/Spinner';

const DoctorsList = () => {
    const { backendurl } = useContext(AdminContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const getAllDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendurl}/api/admin/all-doctors`);
            if (response.data.success) {
                setDoctors(response.data.data || []);
            } else {
                toast.error(response.data.message);
                setDoctors([]);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error('Error fetching doctors list.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorStatus = async (doctorId, status) => {
        try {
            const response = await axios.post(`${backendurl}/api/admin/update-doctor-status`, { doctorId, status });
            if (response.data.success) {
                toast.success(response.data.message);
                getAllDoctors();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating doctor status:", error);
            toast.error('Error updating doctor status.');
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (window.confirm("Are you sure you want to delete this doctor? This action is permanent.")) {
            try {
                const response = await axios.delete(`${backendurl}/api/admin/delete-doctor/${id}`);
                if (response.data.success) {
                    toast.success('Doctor deleted successfully!');
                    getAllDoctors();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error deleting doctor:", error);
                toast.error('Failed to delete doctor.');
            }
        }
    };

    useEffect(() => {
        getAllDoctors();
    }, [backendurl]);

    const filteredDoctors = useMemo(() =>
        doctors.filter(doctor =>
            doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        ), [doctors, searchTerm]);

    if (loading) {
        return <Spinner />;
    }

    const StatusBadge = ({ status }) => {
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
                        <p className="text-gray-500 mt-1">Approve, reject, or remove doctor profiles.</p>
                    </div>
                    <div className="relative mt-4 sm:mt-0">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-2.5 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full sm:w-64"
                        />
                    </div>
                </div>

                {/* Doctors Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Specialization</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDoctors.length > 0 ? filteredDoctors.map((doctor) => (
                                    <tr key={doctor._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{doctor.fullName}</div>
                                            <div className="text-sm text-gray-500">{doctor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{doctor.specialization}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={doctor.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                {doctor.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleDoctorStatus(doctor._id, 'approved')}
                                                        className="p-2 rounded-full text-green-600 hover:bg-green-100 transition"
                                                        title="Approve"
                                                    >
                                                        <FaCheckCircle size={20} />
                                                    </button>
                                                )}
                                                {doctor.status !== 'rejected' && (
                                                     <button
                                                        onClick={() => handleDoctorStatus(doctor._id, 'rejected')}
                                                        className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition"
                                                        title="Reject"
                                                    >
                                                        <FaTimesCircle size={20} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteDoctor(doctor._id)}
                                                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12 text-gray-500">
                                            <p className="text-lg font-medium">No doctors found.</p>
                                            <p className="text-sm">Try adjusting your search or check back later.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorsList;
