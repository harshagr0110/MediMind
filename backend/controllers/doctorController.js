import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- Authentication ---
export const loginDoctor = async (req, res) => {
    const { email, password } = req.body;
    try {
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        if (doctor.status !== 'approved') {
            return res.status(403).json({ success: false, message: 'Your application is still pending approval.' });
        }

        const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.json({ success: true, token });
    } catch (error) {
        console.error("Doctor login error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// --- Dashboard ---
export const getDoctorDashboard = async (req, res) => {
    try {
        const doctorId = req.body.userId; // This ID comes from the authDoctor middleware

        const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });
        const uniquePatients = await Appointment.distinct('user', { doctor: doctorId });
        const totalPatients = uniquePatients.length;

        const completedAppointments = await Appointment.find({ doctor: doctorId, isCompleted: true });
        const totalEarnings = completedAppointments.reduce((acc, app) => acc + (app.amount || 0), 0);

        const upcomingAppointments = await Appointment.find({
            doctor: doctorId,
            slotDate: { $gte: new Date().setHours(0, 0, 0, 0) },
            isCompleted: false,
            cancelled: { $ne: true }
        })
        .populate('user', 'fullName')
        .sort({ slotDate: 1 })
        .limit(5);

        res.json({
            success: true,
            data: {
                totalAppointments,
                totalPatients,
                totalEarnings,
                upcomingAppointments: upcomingAppointments.map(app => ({
                    patientName: app.user ? app.user.fullName : 'Unknown Patient',
                    date: new Date(app.slotDate).toLocaleDateString(),
                    time: app.slotTime,
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching doctor dashboard stats:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard data.' });
    }
};

// --- Profile & Details ---
export const getDoctorDetails = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.body.userId).select('-password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.body.userId, req.body, { new: true }).select('-password');
        res.json({ success: true, message: 'Profile updated successfully', data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// --- Availability ---
export const updateDoctorAvailability = async (req, res) => {
    try {
        const { available } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(req.body.userId, { available }, { new: true });
        res.json({ success: true, message: `Availability updated`, data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update availability' });
    }
};

// --- Appointments ---
export const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.body.userId })
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.body.id, { cancelled: true });
        res.json({ success: true, message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
    }
};

export const completeAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.body.id, { isCompleted: true });
        res.json({ success: true, message: 'Appointment marked as completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to complete appointment' });
    }
};