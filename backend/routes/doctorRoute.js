import express from 'express';
import authDoctor from '../middleware/authDoctor.js';
import authUser from '../middleware/authUser.js';
import {
    getDoctor,
    getDoctors,
    updateProfile,
    getAppointments,
    updateAppointmentStatus,
    getAvailability,
    getDoctorProfile,
    updateDoctorAvailability,
    updateDoctorProfile,
    getDoctorDashboardData,
} from '../controllers/doctorController.js';

const router = express.Router();

// GET all doctors
router.get('/list', getDoctors);

// GET single doctor by id
router.get('/:id', getDoctor);

// DOCTOR-SPECIFIC ROUTES (require doctor authentication)
router.get('/profile/:id', authDoctor, getDoctorProfile);
router.post('/update-profile', authDoctor, updateDoctorProfile);
router.post('/update-availability', authDoctor, updateDoctorAvailability);

router.get('/appointments', authDoctor, getAppointments);
router.post('/update-appointment-status', authDoctor, updateAppointmentStatus);

// New route for fetching availability (can be called by authenticated users)
router.get('/availability/:id', authUser, getAvailability);

// New route for doctor-specific dashboard data
router.get('/dashboard', authDoctor, getDoctorDashboardData);

export default router;