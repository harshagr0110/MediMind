import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    createStripeSession,
    verifyStripe,
    diseasePrediction,
    deleteAppointment
} from '../controllers/userController.js';
import userAuth from '../middleware/authUser.js';
import { upload } from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/get-profile', userAuth, getProfile);
userRouter.post('/update-profile', upload.single('image'), userAuth, updateProfile);
userRouter.post('/book-appointment', userAuth, bookAppointment);
userRouter.get('/appointments', userAuth, listAppointment);
userRouter.post('/cancel-appointment', userAuth, cancelAppointment);
userRouter.post("/create-stripe-session", userAuth, createStripeSession);
userRouter.post("/verifystripe", verifyStripe);
userRouter.post("/predict", userAuth, upload.array('images', 3), diseasePrediction);
userRouter.delete('/delete-appointment/:id', userAuth, deleteAppointment);

export default userRouter;