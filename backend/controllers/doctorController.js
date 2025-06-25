import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const getDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ status: 'approved' }).select('-password');
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getDoctor = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.params.id).select('-password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }
        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        console.error("Error fetching doctor:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.params.id).select('-password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, data: doctor });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateDoctorProfile = async (req, res) => {
    try {
        const updates = req.body;
        const doctor = await doctorModel.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, data: doctor });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateDoctorAvailability = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.user.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        doctor.available = !doctor.available;
        await doctor.save();
        res.json({ success: true, data: { available: doctor.available } });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ docId: req.user.id })
            .populate('userId', 'fullName image'); // Populate user details

        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        console.error("Error fetching appointments:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const appointment = await appointmentModel.findByIdAndUpdate(appointmentId, { status }, { new: true });
        
        // Notify user
        const user = await userModel.findById(appointment.userId);
        user.notifications.push({
            type: 'appointment-status-updated',
            message: `Your appointment with Dr. ${req.user.fullName} has been ${status}.`,
            onClickPath: '/my-appointments'
        });
        await user.save();

        res.status(200).json({ success: true, message: "Status updated successfully.", data: appointment });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getAvailability = async (req, res) => {
    try {
        const { id } = req.params; // Doctor's ID
        const { date } = req.query;  // Date in "YYYY-MM-DD" format

        if (!date) {
            return res.status(400).json({ success: false, message: 'A date query parameter is required.' });
        }

        const appointmentsOnDate = await appointmentModel.find({
            docId: id,
            slotDate: date,
            status: { $in: ['approved', 'pending'] }
        });

        const bookedTimeSlots = appointmentsOnDate.map(app => app.slotTime);
        res.status(200).json({ success: true, data: bookedTimeSlots });
    } catch (error) {
        console.error("Error fetching doctor availability:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const getDoctorDashboardData = async (req, res) => {
    try {
        const doctorId = req.user.id;

        // 1. Get all appointments for the doctor
        const appointments = await appointmentModel.find({ docId: doctorId });

        // 2. Calculate stats
        const totalAppointments = appointments.length;
        const totalPatients = new Set(appointments.map(app => app.userId.toString())).size;
        
        const totalEarnings = appointments
            .filter(app => app.status === 'approved' && app.isCompleted) // Or however you define a "paid" appointment
            .reduce((sum, app) => sum + app.amount, 0);

        // 3. Get upcoming appointments
        const upcomingAppointments = appointments
            .filter(app => new Date(app.slotDate) >= new Date() && !app.isCompleted && app.status === 'approved')
            .sort((a, b) => new Date(a.slotDate) - new Date(b.slotDate))
            .slice(0, 5) // Get the next 5
            .map(app => ({
                patientName: app.userData.fullName,
                date: app.slotDate,
                time: app.slotTime,
            }));

        res.status(200).json({
            success: true,
            data: {
                totalAppointments,
                totalPatients,
                totalEarnings,
                upcomingAppointments,
            },
        });

    } catch (error) {
        console.error("Error fetching doctor dashboard data:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const doctor = await doctorModel.findOne({ email });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found.' });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        if (doctor.status !== 'approved') {
            return res.status(403).json({ success: false, message: 'Your application is pending approval.' });
        }

        const token = createToken(doctor._id);
        res.status(200).json({ success: true, token, doctorId: doctor._id });

    } catch (error) {
        console.error("Doctor login error:", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export {
    getDoctor,
    getDoctors,
    getDoctorProfile,
    updateDoctorProfile,
    updateDoctorAvailability,
    getAppointments,
    updateAppointmentStatus,
    getAvailability,
    getDoctorDashboardData,
    loginDoctor,
};
 