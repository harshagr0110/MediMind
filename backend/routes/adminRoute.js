import express from 'express';
import { upload } from '../middleware/multer.js';
import { addDoctor, adminLogin, deleteDoctor, updateDoctorStatus } from '../controllers/adminController.js';
import adminAuth from '../middleware/authAdmin.js';
import { allDoctors } from '../controllers/adminController.js';
import { updateDoctorAvailability } from '../controllers/doctorController.js';
import { dashboarddata } from '../controllers/adminController.js';

const adminRouter = express.Router();

// ✅ Ensure image field is processed and token is verified
adminRouter.post('/add-doctor', adminAuth, upload.single('image'), addDoctor);
adminRouter.post('/login', adminLogin);
adminRouter.get('/all-doctors', adminAuth, allDoctors);
adminRouter.post('/change-availability', adminAuth, updateDoctorAvailability);
adminRouter.get('/dashboard', adminAuth, dashboarddata);
adminRouter.delete('/delete-doctor/:id', adminAuth, deleteDoctor);
adminRouter.post('/update-doctor-status', adminAuth, updateDoctorStatus);

export default adminRouter;
