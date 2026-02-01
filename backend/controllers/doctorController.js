import Doctor from '../models/doctorModel.js';
import Appointment from '../models/appointmentModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// --- Authentication ---
export const loginDoctor = async (req, res) => {
    console.log('[loginDoctor] called. req.body:', req.body);
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

        const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET, { expiresIn: '3d' });
        res.json({ success: true, token });
    } catch (error) {
        console.error("Doctor login error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// --- Dashboard ---
export const getDoctorDashboard = async (req, res) => {
    console.log('[getDoctorDashboard] called. req.user:', req.user);
    try {
        const doctorId = req.user.id;
        console.log('DoctorDashboard doctorId:', doctorId);
        const totalAppointments = await Appointment.countDocuments({ docId: doctorId });
        const uniquePatients = await Appointment.distinct('userId', { docId: doctorId });
        const totalPatients = uniquePatients.length;
        const paidAppointments = await Appointment.find({ docId: doctorId, paymentStatus: 'paid', isCompleted: true });
        const totalEarnings = paidAppointments.reduce((acc, app) => acc + (app.amount || 0), 0);
        const upcomingAppointments = await Appointment.find({
            docId: doctorId,
            slotDate: { $gte: new Date().toISOString().slice(0, 10) },
            isCompleted: false,
            cancelled: { $ne: true }
        })
        .sort({ slotDate: 1 })
        .limit(5);
        res.json({
            success: true,
            data: {
                totalAppointments,
                totalPatients,
                totalEarnings,
                upcomingAppointments: upcomingAppointments.map(app => ({
                    patientName: app.userData ? app.userData.fullName : 'Unknown Patient',
                    date: app.slotDate,
                    time: app.slotTime,
                }))
            }
        });
    } catch (error) {
        console.error('[getDoctorDashboard] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Server error while fetching dashboard data.', error: error.message, stack: error.stack });
    }
};

// --- Profile & Details ---
export const getDoctorDetails = async (req, res) => {
    console.log('[getDoctorDetails] called. req.user:', req.user, 'req.params:', req.params);
    try {
        const doctorId = req.params.id || req.user?.id;
        if (!doctorId) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }
        const doctor = await Doctor.findById(doctorId).select('-password');
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.json({ success: true, data: doctor });
    } catch (error) {
        console.error('[getDoctorDetails] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Server error', error: error.message, stack: error.stack });
    }
};

export const updateProfile = async (req, res) => {
    console.log('[updateProfile] called. req.user:', req.user, 'req.body:', req.body, 'req.file:', req.file);
    try {
        let updates = req.body;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'doctors' }, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
                stream.end(req.file.buffer);
            });
            updates = { ...updates, image: result.secure_url };
        }
        const doctor = await Doctor.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json({ success: true, message: 'Profile updated successfully', data: doctor });
    } catch (error) {
        console.error('[updateProfile] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message, stack: error.stack });
    }
};

// --- Availability ---
export const updateDoctorAvailability = async (req, res) => {
    console.log('[updateDoctorAvailability] called. req.user:', req.user, 'req.body:', req.body);
    try {
        const { available } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(req.user.id, { available }, { new: true });
        res.json({ success: true, message: `Availability updated`, data: doctor });
    } catch (error) {
        console.error('[updateDoctorAvailability] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to update availability', error: error.message, stack: error.stack });
    }
};

// --- Appointments ---
export const getDoctorAppointments = async (req, res) => {
    console.log('[getDoctorAppointments] called. req.user:', req.user);
    try {
        const appointments = await Appointment.find({ docId: req.user.id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: appointments });
    } catch (error) {
        console.error('[getDoctorAppointments] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message, stack: error.stack });
    }
};

export const cancelAppointment = async (req, res) => {
    console.log('[cancelAppointment] called. req.body:', req.body, 'req.user:', req.user);
    try {
        const { appointmentId } = req.body;
        
        // First, find the appointment and verify it belongs to this doctor
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        
        // Security check: ensure the appointment belongs to this doctor
        if (appointment.docId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized: This appointment does not belong to you' });
        }
        
        const result = await Appointment.findByIdAndUpdate(appointmentId, { cancelled: true, isCompleted: false });
        res.json({ success: true, message: 'Appointment cancelled' });
    } catch (error) {
        console.error('[cancelAppointment] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to cancel appointment', error: error.message, stack: error.stack });
    }
};

export const completeAppointment = async (req, res) => {
    console.log('[completeAppointment] called. req.body:', req.body, 'req.user:', req.user);
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        
        // Security check: ensure the appointment belongs to this doctor
        if (appointment.docId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized: This appointment does not belong to you' });
        }
        
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: 'Cannot complete cancelled appointment' });
        }
        
        if (appointment.paymentStatus !== 'paid') {
            return res.status(400).json({ success: false, message: 'Cannot complete unpaid appointment' });
        }
        
        if (appointment.isCompleted) {
            return res.status(400).json({ success: false, message: 'Appointment already completed' });
        }
        
        const result = await Appointment.findByIdAndUpdate(appointmentId, { isCompleted: true }, { new: true });
        res.json({ success: true, message: 'Appointment marked as completed', data: result });
    } catch (error) {
        console.error('[completeAppointment] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to complete appointment', error: error.message });
    }
};

export const getAllDoctors = async (req, res) => {
    console.log('[getAllDoctors] called. req.user:', req.user);
    try {
        const doctors = await Doctor.find({ available: true }).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        console.error('[getAllDoctors] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch doctors', error: error.message, stack: error.stack });
    }
};

export const getDoctorAvailability = async (req, res) => {
    console.log('[getDoctorAvailability] called. req.user:', req.user, 'req.params:', req.params, 'req.query:', req.query);
    try {
        const doctorId = req.params.id;
        const date = req.query.date;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }
        
        // Clean up expired reservations first
        await Appointment.updateMany(
            {
                reservationExpiry: { $lt: new Date() },
                paymentStatus: 'pending',
                cancelled: false
            },
            {
                $set: { cancelled: true }
            }
        );
        
        // Find paid appointments or active reservations (not expired, not cancelled)
        const appointments = await Appointment.find({
            docId: doctorId,
            slotDate: date,
            cancelled: false,
            $or: [
                { paymentStatus: 'paid' },
                {
                    paymentStatus: 'pending',
                    reservationExpiry: { $gt: new Date() }
                }
            ]
        });
        
        // Return the booked slot times
        const bookedSlots = appointments.map(app => app.slotTime);
        res.json({ success: true, data: bookedSlots });
    } catch (error) {
        console.error('[getDoctorAvailability] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch availability', error: error.message, stack: error.stack });
    }
};

export const getDoctorPatients = async (req, res) => {
    console.log('[getDoctorPatients] called. req.user:', req.user);
    try {
        const doctorId = req.user.id;
        // Find all appointments for this doctor
        const appointments = await Appointment.find({ docId: doctorId });
        // Get unique patients
        const uniquePatients = {};
        appointments.forEach(app => {
            const user = app.userData;
            if (user && user.email && !uniquePatients[user.email]) {
                uniquePatients[user.email] = user;
            }
        });
        res.json({ success: true, patients: Object.values(uniquePatients) });
    } catch (error) {
        console.error('[getDoctorPatients] Error:', error, error?.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch patients', error: error.message, stack: error.stack });
    }
};
