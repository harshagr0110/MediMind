import express from 'express';
import {
    loginDoctor,
    getDoctorDashboard,
    getDoctorDetails,
    updateProfile,
    updateDoctorAvailability,
    getDoctorAppointments,
    cancelAppointment,
    completeAppointment,
    getAllDoctors,
    getDoctorAvailability,
    getDoctorPatients
} from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// Log every incoming request to this router
router.use((req, res, next) => {
  console.log(`[DOCTOR ROUTE] ${req.method} ${req.originalUrl} | Headers:`, req.headers);
  next();
});

// PUBLIC ROUTES
router.post('/login', loginDoctor);
router.get('/list', getAllDoctors);
router.get('/availability/:id', getDoctorAvailability);
router.get('/public/:id', getDoctorDetails);

// PROTECTED DOCTOR ROUTES (require doctor token for all routes below)
router.use(authDoctor);

router.get('/dashboard', getDoctorDashboard);
router.get('/details', getDoctorDetails);
router.get('/appointments', getDoctorAppointments);
router.get('/patients', getDoctorPatients);
router.get('/profile', getDoctorDetails);

router.patch('/update-profile', upload.single('image'), updateProfile);
router.patch('/update-availability', updateDoctorAvailability);

router.post('/cancel-appointment', cancelAppointment);
router.post('/complete-appointment', completeAppointment);

router.get('/availability', getDoctorAvailability);
router.post('/availability', updateDoctorAvailability);

// DYNAMIC ROUTES MUST COME LAST
router.get('/:id', getDoctorDetails);

export default router;