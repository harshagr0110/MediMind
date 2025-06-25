import validator from 'validator';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import Doctor from '../models/doctorModel.js';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

// --- Doctor Management ---
export const addDoctor = async (req, res) => {
    try {
        const { fullName, email, password, speciality, degree, experience, about, fees, address, available } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: 'Doctor profile image is required' });
        if (!fullName || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: 'Invalid email format' });
        if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'doctors' }, (err, result) => {
                if (err) return reject(err);
                resolve(result.secure_url);
            });
            stream.end(req.file.buffer);
        });

        const newDoctor = new Doctor({
            ...req.body,
            password: hashedPassword,
            image: imageUrl,
        });
        const savedDoctor = await newDoctor.save();

        res.status(201).json({ success: true, message: 'Doctor added successfully', doctor: savedDoctor });
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({ success: false, message: 'Server error while adding doctor.' });
    }
};

export const allDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).select('-password');
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
    }
};

export const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await Doctor.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete doctor.' });
    }
};

export const updateDoctorStatus = async (req, res) => {
    try {
        const { doctorId, status } = req.body;
        const allowed = ['approved', 'rejected', 'pending'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        const doctor = await Doctor.findByIdAndUpdate(doctorId, { status }, { new: true });
        res.status(200).json({ success: true, message: `Doctor status updated to ${status}`, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update doctor status.' });
    }
};

// --- Admin Authentication ---
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.json({ success: true, token });
        }
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// --- Dashboard ---
export const getDashboardData = async (req, res) => {
    try {
        const totalDoctors = await Doctor.countDocuments();
        const totalPatients = await User.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const completedAppointments = await Appointment.find({ isCompleted: true });
        const totalEarnings = completedAppointments.reduce((sum, app) => sum + (app.amount || 0), 0);
        
        res.status(200).json({
            success: true,
            data: { totalDoctors, totalPatients, totalAppointments, totalEarnings }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
    }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, ...admin.toObject() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashed, fullName });
    res.json({ success: true, message: 'Admin registered successfully', data: { id: admin._id, email: admin.email, fullName: admin.fullName } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register admin' });
  }
};
