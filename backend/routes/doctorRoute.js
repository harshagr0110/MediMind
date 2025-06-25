import express from 'express';
import {
    loginDoctor,
    getDoctorDashboard,
    getDoctorDetails,
    updateProfile,
    updateDoctorAvailability,
    getDoctorAppointments,
    cancelAppointment,
    completeAppointment
} from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';

const router = express.Router();

// PUBLIC ROUTE
router.post('/login', loginDoctor);

// PROTECTED DOCTOR ROUTES (require doctor token for all routes below)
router.use(authDoctor);

router.get('/dashboard', getDoctorDashboard);
router.get('/details', getDoctorDetails);
router.get('/appointments', getDoctorAppointments);

router.patch('/update-profile', updateProfile);
router.patch('/update-availability', updateDoctorAvailability);

router.post('/cancel-appointment', cancelAppointment);
router.post('/complete-appointment', completeAppointment);

export default router;