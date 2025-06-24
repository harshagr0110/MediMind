import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/Admincontext';
import Spinner from '../../components/Spinner';

const DoctorsList = () => {
    const { backendurl } = useContext(AdminContext);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendurl}/api/admin/all-doctors`);
            if (response.data.success) {
                setDoctors(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error('Error fetching doctors list.');
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorStatus = async (doctorId, status) => {
        try {
            const response = await axios.post(`${backendurl}/api/admin/update-doctor-status`, { doctorId, status });
            if (response.data.success) {
                toast.success(response.data.message);
                getAllDoctors(); // Refresh the list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error updating doctor status:", error);
            toast.error('Error updating doctor status.');
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
            try {
                const response = await axios.delete(`${backendurl}/api/admin/delete-doctor/${id}`);
                if (response.data.success) {
                    toast.success('Doctor deleted successfully!');
                    getAllDoctors(); // Refresh the list
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

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Doctors List</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Specialization</th>
                            <th className="py-2 px-4 border-b">Status</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doctor) => (
                            <tr key={doctor._id}>
                                <td className="py-2 px-4 border-b">{doctor.fullName}</td>
                                <td className="py-2 px-4 border-b">{doctor.email}</td>
                                <td className="py-2 px-4 border-b">{doctor.specialization}</td>
                                <td className="py-2 px-4 border-b">{doctor.status}</td>
                                <td className="py-2 px-4 border-b">
                                    {doctor.status === 'pending' ? (
                                        <button
                                            onClick={() => handleDoctorStatus(doctor._id, 'approved')}
                                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                        >
                                            Approve
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDoctorStatus(doctor._id, 'rejected')}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                        >
                                            Reject
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteDoctor(doctor._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DoctorsList;
