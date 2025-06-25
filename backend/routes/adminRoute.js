import express from 'express';
import { upload } from '../middleware/multer.js';
import { 
    addDoctor, 
    adminLogin, 
    deleteDoctor, 
    updateDoctorStatus,
    allDoctors,
    getDashboardData
} from '../controllers/adminController.js';
import adminAuth from '../middleware/authAdmin.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);

// All routes below are protected
adminRouter.use(adminAuth);

adminRouter.get('/dashboard', getDashboardData);
adminRouter.get('/all-doctors', allDoctors);
adminRouter.post('/add-doctor', upload.single('image'), addDoctor);
adminRouter.post('/update-doctor-status', updateDoctorStatus);
adminRouter.delete('/delete-doctor/:id', deleteDoctor);

export default adminRouter;
