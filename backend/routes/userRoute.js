import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile,
    bookAppointment,
    listAppointment,
    deleteAppointment,
    createStripeSession,
    verifyStripe,
    diseasePrediction
} from '../controllers/userController.js';
import userAuth from '../middleware/authUser.js';
import { upload } from '../middleware/multer.js';

const userRouter = express.Router();

// PUBLIC
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post("/verifystripe", verifyStripe);

// PROTECTED
userRouter.use(userAuth);

userRouter.get('/get-profile', getProfile);
userRouter.post('/update-profile', upload.single('image'), updateProfile);
userRouter.post('/book-appointment', bookAppointment);
userRouter.get('/appointments', listAppointment);
userRouter.delete('/delete-appointment/:id', deleteAppointment);
userRouter.post("/create-stripe-session", createStripeSession);
userRouter.post('/disease-prediction', upload.single('image'), diseasePrediction);

export default userRouter;