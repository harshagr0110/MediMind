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
        if (!email || !fullName || !password) return res.status(400).json({ success: false, message: "All fields required" });
        if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email" });
        if (password.length < 8) return res.status(400).json({ success: false, message: "Password too short" });
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "User exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName, email, password: hash });
        const token = createToken(user._id);

        res.status(201).json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Wrong password" });
        
        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- User Profile ---
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
        res.json({ success: true, data: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Appointments ---
export const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime, amount } = req.body;
        const userId = req.user.id;
        
        // Prevent booking in the past
        const appointmentDateTime = new Date(`${slotDate} ${slotTime}`);
        const now = new Date();
        if (appointmentDateTime < now) {
            return res.status(400).json({ success: false, message: "Cannot book appointments in the past" });
        }

        const doctor = await Doctor.findById(docId);
        if (!doctor?.available) return res.status(404).json({ success: false, message: "Doctor unavailable" });

        const user = await User.findById(userId);
        
        // Clean up expired reservations first
        await Appointment.updateMany(
            {
                reservationExpiry: { $lt: new Date() },
                paymentStatus: 'pending',
                cancelled: false
            },
            {
                $set: { cancelled: true }
            }
        );
        
        // Check for existing paid or active reservation
        const existingAppointment = await Appointment.findOne({
            docId,
            slotDate,
            slotTime,
            cancelled: false,
            $or: [
                { paymentStatus: 'paid' },
                {
                    paymentStatus: 'pending',
                    reservationExpiry: { $gt: new Date() }
                }
            ]
        });
        
        if (existingAppointment) {
            return res.status(400).json({ 
                success: false, 
                message: "This slot is currently reserved or booked. Please select another slot." 
            });
        }

        // Create appointment with 10-minute reservation
        const reservationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        const newAppointment = new Appointment({
            userId,
            docId,
            slotDate,
            slotTime,
            userData: { fullName: user.fullName, email: user.email, image: user.image || '' },
            docData: { fullName: doctor.fullName, email: doctor.email, image: doctor.image || '', specialization: doctor.speciality },
            amount,
            date: new Date(),
            reservedAt: new Date(),
            reservedBy: userId,
            reservationExpiry: reservationExpiry,
            paymentStatus: 'pending'
        });
        await newAppointment.save();

        res.status(201).json({ 
            success: true, 
            appointmentId: newAppointment._id,
            reservationExpiry: reservationExpiry 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const listAppointment = async (req, res) => {
    try {
        // Sort by appointment date/time, most recent first
        const appointments = await Appointment.find({ userId: req.user.id })
            .sort({ slotDate: -1, slotTime: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: "Appointment already cancelled" });
        }
        
        if (appointment.isCompleted) {
            return res.status(400).json({ success: false, message: "Cannot cancel completed appointment" });
        }
        
        // Check if appointment is within 24 hours
        const appointmentDateTime = new Date(`${appointment.slotDate} ${appointment.slotTime}`);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
        
        if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot cancel appointment within 24 hours of scheduled time" 
            });
        }
        
        // Only allow cancellation if not paid
        if (appointment.paymentStatus === 'paid') {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot cancel paid appointment. Please contact support for refund." 
            });
        }
        
        await Appointment.findByIdAndUpdate(req.params.id, { cancelled: true });
        res.json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findOne({ _id: id, userId: req.user.id });
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        res.status(200).json({ success: true, appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while fetching appointment' });
    }
};

// --- Payment ---
export const createStripeSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
        
        // Security: Verify appointment belongs to the requesting user
        if (appointment.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized: This appointment does not belong to you." });
        }
        
        // Prevent payment for cancelled appointments
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: "This appointment has been cancelled." });
        }
        
        // Prevent creating payment session for already-paid appointments
        if (appointment.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: "This appointment has already been paid." });
        }
        
        // Prevent payment if reservation has expired
        if (appointment.reservationExpiry && new Date() > new Date(appointment.reservationExpiry)) {
            return res.status(400).json({ success: false, message: "Your reservation has expired. Please book again." });
        }
        // Guard: check required fields
        if (!appointment.amount || isNaN(appointment.amount)) {
            return res.status(400).json({ success: false, message: "Invalid or missing appointment amount." });
        }
        if (!appointment.docData || !appointment.docData.fullName) {
            return res.status(400).json({ success: false, message: "Missing doctor name in appointment." });
        }
        if (!appointment.slotDate || !appointment.slotTime) {
            return res.status(400).json({ success: false, message: "Missing slot date or time in appointment." });
        }
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ success: false, message: "Stripe secret key not configured." });
        }

        // Use process.env.FRONTEND_URL everywhere for frontend redirects
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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
            // Redirect to backend for verification, then backend redirects to frontend
            success_url: `${backendUrl}/api/user/verifystripe?appointmentId=${appointmentId}&success=true`,
            cancel_url: `${backendUrl}/api/user/verifystripe?appointmentId=${appointmentId}&success=false`,
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe session error:', error.message, {
            appointmentId: req.body?.appointmentId,
            stripeKey: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
        });
        res.status(500).json({ success: false, message: error.message || "Error creating payment session" });
    }
};

export const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        console.log('verifyStripe called with:', { appointmentId, success });
        if (success === "true") {
            const updated = await Appointment.findByIdAndUpdate(
                appointmentId, 
                { 
                    paymentStatus: 'paid',
                    reservedAt: null,
                    reservedBy: null,
                    reservationExpiry: null
                }, 
                { new: true }
            );
            console.log('Appointment update result:', updated);
            if (!updated) {
                // Appointment not found
                return res.redirect(`${frontendUrl}/verify?success=false&appointmentId=${appointmentId}`);
            }
            return res.redirect(`${frontendUrl}/verify?success=true&appointmentId=${appointmentId}`);
        } else {
            // Payment cancelled - mark as cancelled instead of deleting
            await Appointment.findByIdAndUpdate(appointmentId, { 
                cancelled: true,
                paymentStatus: 'failed'
            });
            return res.redirect(`${frontendUrl}/verify?success=false&appointmentId=${appointmentId}`);
        }
    } catch (error) {
        console.error("Error in verifyStripe:", error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/verify?success=false&appointmentId=${req.query.appointmentId}`);
    }
};

// --- AI Disease Prediction ---
async function fileToGenerativePart(buffer, mimeType) {
    return { inlineData: { data: buffer.toString("base64"), mimeType } };
}


function parseAIResponse(text, userInput = '') {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    // Extract JSON
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error('No JSON found in response');
        }
    
    const jsonString = cleanText.slice(jsonStart, jsonEnd + 1);
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (parseErr) {
      throw new Error('Invalid JSON format: ' + parseErr.message);
    }
    
    // Get disease name (required)
    const diseaseName = (data.disease_name || '').trim();
    if (!diseaseName || diseaseName.toLowerCase().includes('unknown') || diseaseName === '') {
      throw new Error('Invalid disease name: ' + data.disease_name);
    }
    
    // Get disease description (required)
    const diseaseDescription = (data.disease_description || '').trim();
    if (!diseaseDescription || diseaseDescription === '') {
      throw new Error('Missing disease description');
    }
    
    // Process causes - very flexible
    let causes = [];
    if (Array.isArray(data.causes)) {
      causes = data.causes
        .filter(c => c && (typeof c === 'string' ? c.trim() !== '' : true))
        .map(c => typeof c === 'string' ? c.trim() : String(c))
        .filter(c => c.length > 0);
    } else if (typeof data.causes === 'string' && data.causes.trim()) {
      causes = [data.causes.trim()];
    }
    // Process precautions - very flexible
    let precautions = [];
    if (Array.isArray(data.precautions)) {
      precautions = data.precautions
        .filter(p => p && (typeof p === 'string' ? p.trim() !== '' : true))
        .map(p => typeof p === 'string' ? p.trim() : String(p))
        .filter(p => p.length > 0);
    } else if (typeof data.precautions === 'string' && data.precautions.trim()) {
      precautions = [data.precautions.trim()];
    }
    // If still empty, this is a real problem
    if (causes.length === 0) {
      throw new Error('No valid causes found in response');
    }
    if (precautions.length === 0) {
      throw new Error('No valid precautions found in response');
    }
    
        // Determine specialist - use AI output only (no keyword-based fallback)
        const aiSpecialistRaw = (data.recommended_specialist || '').trim();

        let specialtyName = null;
        if (aiSpecialistRaw) {
            const directMatch = AVAILABLE_SPECIALTIES.find(
                (spec) => spec.toLowerCase() === aiSpecialistRaw.toLowerCase()
            );
            if (directMatch) {
                specialtyName = directMatch;
            }
        }
    
    const result = {
      disclaimer: 'This is an AI-generated analysis. Please consult a qualified healthcare professional for diagnosis and treatment.',
      disease_name: diseaseName,
      disease_description: diseaseDescription,
      analysis: [diseaseDescription],
      symptoms: [],
      causes: causes,
      prevention: precautions,
      evidence: [],
      potential_conditions: [],
            specialist: specialtyName
                ? { name: specialtyName, reason: `We recommend consulting a ${specialtyName} to discuss your symptoms and medical history.` }
                : null,
    };
    
    return result;
    
  } catch (e) {
    // Return error response with default specialist
    const errorResult = {
      disclaimer: 'Unable to fully analyze symptoms. Please consult a qualified healthcare professional.',
      disease_name: 'Analysis Unavailable',
      disease_description: 'The AI could not process your request properly. Please provide more specific symptoms and try again.',
      analysis: [],
      symptoms: [],
      causes: [],
      prevention: [],
      evidence: [],
      potential_conditions: [],
    specialist: null,
    };
    
    return errorResult;
  }
}

// Allowed specialties in the system (must match DB values)
const AVAILABLE_SPECIALTIES = [
    'General Physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Gastroenterologist',
    'Cardiologist',
    'Orthopedic Surgeon',
    'Psychiatrist',
    'ENT Specialist',
    'Ophthalmologist',
    'Endocrinologist',
    'Nephrologist',
    'Oncologist',
    'Pulmonologist',
    'Urologist',
    'Hematologist',
    'Rheumatologist',
    'Allergist',
    'Infectious Disease Specialist',
    'Plastic Surgeon',
    'Dentist',
    'Anesthesiologist',
    'Pathologist',
    'Radiologist',
    'Orthodontist'
];


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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        let prompt = '';
        let input = [];
        
                // Simple JSON-only prompt with strict specialist list
                const jsonPrompt = `RESPOND ONLY WITH JSON. NOTHING ELSE.

{
  "disease_name": "Medical condition name",
  "disease_description": "One sentence description",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "precautions": ["precaution 1", "precaution 2", "precaution 3"],
    "recommended_specialist": "One specialist from this list: ${AVAILABLE_SPECIALTIES.join(', ')}"
}

EXAMPLE:
{
  "disease_name": "Migraine Headache",
  "disease_description": "A neurological disorder causing intense headaches.",
  "causes": ["Stress", "Sleep deprivation", "Dietary triggers"],
  "precautions": ["Avoid triggers", "Regular sleep", "Hydrate well"],
  "recommended_specialist": "Neurologist"
}

IMPORTANT: recommended_specialist MUST be EXACTLY one of: ${AVAILABLE_SPECIALTIES.join(', ')}
IMPORTANT: Choose the MOST SPECIFIC specialist possible based on symptoms and/or image.
IMPORTANT: Do NOT choose "General Physician" unless the symptoms are truly vague or non-specific.
IMPORTANT: If unsure, choose the closest matching specialist rather than General Physician.

Now analyze the patient symptoms and return ONLY the JSON above.`;
        
        // Different prompts based on input type
        if (hasSymptoms && hasImage) {
            prompt = `${jsonPrompt}\n\nPatient symptoms: ${symptoms}\n\nAlso analyze the medical image provided.`;
            const imagePart = await fileToGenerativePart(req.file.buffer, req.file.mimetype);
            input = [prompt, imagePart];
        } else if (hasSymptoms) {
            prompt = `${jsonPrompt}\n\nPatient symptoms: ${symptoms}`;
            input = [prompt];
        } else if (hasImage) {
            prompt = `${jsonPrompt}\n\nAnalyze the provided medical image and suggest diagnosis.`;
            const imagePart = await fileToGenerativePart(req.file.buffer, req.file.mimetype);
            input = [prompt, imagePart];
        }
        
        let result;
        try {
            result = await model.generateContent(input);
        } catch (apiError) {
            throw apiError;
        }
        
        const responseText = result.response.text();
        const structured = parseAIResponse(responseText, symptoms);
        res.json({ success: true, data: structured });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error in disease prediction.",
            errorType: error.name,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
