import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile } from '../controllers/userController.js';
import userAuth from '../middleware/authUser.js';
import { upload } from '../middleware/multer.js';
import { bookAppointment } from '../controllers/userController.js';
import { listAppointment } from '../controllers/userController.js';
import { cancelAppointment } from '../controllers/userController.js';
import { createStripeSession } from '../controllers/userController.js';
import { verifyStripe } from '../controllers/userController.js';
import { diseasePrediction } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/get-profile', userAuth, getProfile);
userRouter.post('/update-profile', upload.single('image'), userAuth, updateProfile);
userRouter.post('/book-appointment', userAuth, bookAppointment);
userRouter.get('/appointments', userAuth, listAppointment);
userRouter.post('/cancel-appointment', userAuth, cancelAppointment);
userRouter.post("/create-stripe-session", userAuth, createStripeSession);
userRouter.post("/verifystripe", verifyStripe); // No auth needed here
userRouter.post("/predict", diseasePrediction);

export default userRouter;