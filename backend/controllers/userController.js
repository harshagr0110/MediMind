import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import { GoogleGenerativeAI } from '@google/generative-ai';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });

// --- Authentication ---
export const registerUser = async (req, res) => {
    try {
        const { email, fullName, password } = req.body;
        if (!email || !fullName || !password) return res.status(400).json({ success: false, message: "All fields are required" });
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email format" });
        if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user = await User.create({ fullName, email, password: hash });
        const token = createToken(user._id);

        res.status(201).json({ success: true, message: "User registered", token });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error during registration" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
        
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });
        
        const token = createToken(user._id);
        res.json({ success: true, message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error during login" });
    }
};

// --- User Profile ---
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error while fetching profile" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        let updates = req.body;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ folder: 'users' }, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
                stream.end(req.file.buffer);
            });
            updates.image = result.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Profile updated successfully", data: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error while updating profile" });
    }
};

// --- Appointments ---
export const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime, amount } = req.body;
        const userId = req.user.id;

        const doctor = await Doctor.findById(docId);
        if (!doctor || !doctor.available) return res.status(404).json({ success: false, message: "Doctor not found or is unavailable" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const existingAppointment = await Appointment.findOne({ docId, slotDate, slotTime });
        if (existingAppointment) return res.status(400).json({ success: false, message: "This slot is already booked" });

        const newAppointment = new Appointment({
            userId,
            docId,
            slotDate,
            slotTime,
            userData: {
                fullName: user.fullName,
                email: user.email,
                image: user.image || '',
            },
            docData: {
                fullName: doctor.fullName,
                email: doctor.email,
                image: doctor.image || '',
                specialization: doctor.specialization || doctor.speciality || '',
            },
            amount,
            date: new Date(),
        });
        await newAppointment.save();

        res.status(201).json({ success: true, message: "Appointment booked, pending payment", appointmentId: newAppointment._id });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error while booking appointment" });
    }
};

export const listAppointment = async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user.id });
        res.status(200).json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error while listing appointments" });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete appointment." });
    }
};

// --- Payment ---
export const createStripeSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `Appointment with Dr. ${appointment.docData.fullName}`,
                        description: `On ${appointment.slotDate} at ${appointment.slotTime}`,
                    },
                    unit_amount: appointment.amount * 100, // Amount in paise
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/verify?success=true&appointmentId=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&appointmentId=${appointmentId}`,
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating Stripe session" });
    }
};

export const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.query;
        if (success === "true") {
            await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'Paid' });
            res.redirect(`${process.env.FRONTEND_URL}/my-appointments?payment=success`);
        } else {
            await Appointment.findByIdAndDelete(appointmentId);
            res.redirect(`${process.env.FRONTEND_URL}/my-appointments?payment=failed`);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error verifying payment" });
    }
};

// --- AI Disease Prediction ---
async function fileToGenerativePart(buffer, mimeType) {
    return { inlineData: { data: buffer.toString("base64"), mimeType } };
}

export const diseasePrediction = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "AI service unavailable: Missing GEMINI_API_KEY." });
        }
        const symptoms = req.body.symptoms || '';
        const hasSymptoms = symptoms && symptoms.trim().length > 0;
        const hasImage = !!req.file;
        if (!hasSymptoms && !hasImage) {
            return res.status(400).json({ success: false, message: "Please provide symptoms or upload an image." });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let prompt = '';
        let input = [];
        if (hasSymptoms && hasImage) {
            prompt = `Analyze the following symptoms and medical image. Symptoms: ${symptoms}\nBased on both the text and visual evidence, identify potential diseases, conditions, or abnormalities. Describe your findings, including the indicators that support your assessment. Recommend a type of medical specialist (e.g., Dermatologist, Cardiologist, Neurologist) a person should consult. Structure your response in clear sections: 'Disease/Condition Analysis', 'Evidence', and 'Recommended Specialist'.`;
            const imagePart = await fileToGenerativePart(req.file.buffer, req.file.mimetype);
            input = [prompt, imagePart];
        } else if (hasSymptoms) {
            prompt = `Analyze the following symptoms: ${symptoms}\nBased on these, identify potential diseases, conditions, or abnormalities. Recommend a type of medical specialist (e.g., Dermatologist, Cardiologist, Neurologist) a person should consult. Structure your response in clear sections: 'Disease/Condition Analysis', 'Recommended Specialist', and 'For Your Information'.`;
            input = [prompt];
        } else if (hasImage) {
            prompt = "Analyze this medical image. Based on visual evidence, identify potential diseases, conditions, or abnormalities. Describe your findings, including the visual indicators that support your assessment. Finally, based on your analysis, recommend a type of medical specialist (e.g., Dermatologist, Cardiologist, Neurologist) a person should consult for these symptoms. Structure your response in clear sections: 'Disease/Condition Analysis', 'Visual Evidence', and 'Recommended Specialist'.";
            const imagePart = await fileToGenerativePart(req.file.buffer, req.file.mimetype);
            input = [prompt, imagePart];
        }
        const result = await model.generateContent(input);
        const responseText = result.response.text();
        res.json({ success: true, data: { raw: responseText } });
    } catch (error) {
        console.error("DiseasePrediction error:", error);
        res.status(500).json({ success: false, message: error.message || "Error in disease prediction." });
    }
};