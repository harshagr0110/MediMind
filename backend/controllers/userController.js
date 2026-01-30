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
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
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
        console.error('Stripe session error:', error, {
            appointmentId: req.body?.appointmentId,
            appointment: typeof appointment !== 'undefined' ? appointment : 'not loaded',
            stripeKey: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
        });
        res.status(500).json({ success: false, message: error.message || "Error creating Stripe session" });
    }
};

export const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        console.log('verifyStripe called with:', { appointmentId, success });
        if (success === "true") {
            const updated = await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'paid' }, { new: true });
            console.log('Appointment update result:', updated);
            if (!updated) {
                // Appointment not found
                return res.redirect(`${frontendUrl}/verify?success=false&appointmentId=${appointmentId}`);
            }
            return res.redirect(`${frontendUrl}/verify?success=true&appointmentId=${appointmentId}`);
        } else {
            await Appointment.findByIdAndDelete(appointmentId);
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

// List of allowed specialties (copy from frontend)
const allowedSpecialities = [
  'General Physician', 'Gynecologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Gastroenterologist',
  'Cardiologist', 'Orthopedic Surgeon', 'Psychiatrist', 'ENT Specialist', 'Ophthalmologist', 'Endocrinologist',
  'Nephrologist', 'Oncologist', 'Pulmonologist', 'Urologist', 'Hematologist', 'Rheumatologist', 'Allergist',
  'Infectious Disease Specialist', 'Plastic Surgeon', 'Dentist', 'Anesthesiologist', 'Pathologist', 'Radiologist', 'Orthodontist'
];
const synonyms = {
  'physician': 'General Physician',
  'doctor': 'General Physician',
  'obgyn': 'Gynecologist',
  'skin': 'Dermatologist',
  'child': 'Pediatrician',
  'neuro': 'Neurologist',
  'gastro': 'Gastroenterologist',
  'heart': 'Cardiologist',
  'bone': 'Orthopedic Surgeon',
  'mental': 'Psychiatrist',
  'ent': 'ENT Specialist',
  'eye': 'Ophthalmologist',
  'hormone': 'Endocrinologist',
  'kidney': 'Nephrologist',
  'cancer': 'Oncologist',
  'lung': 'Pulmonologist',
  'urinary': 'Urologist',
  'blood': 'Hematologist',
  'autoimmune': 'Rheumatologist',
  'allergy': 'Allergist',
  'infection': 'Infectious Disease Specialist',
  'plastic': 'Plastic Surgeon',
  'dental': 'Dentist',
  'anesthesia': 'Anesthesiologist',
  'lab': 'Pathologist',
  'scan': 'Radiologist',
  'braces': 'Orthodontist'
};

// Mapping of keywords/diseases to specialties (Ophthalmologist prioritized for eye symptoms)
const diseaseToSpecialist = [
  { keywords: ['eye', 'red eye', 'watering eye', 'vision', 'conjunctivitis', 'blurred vision', 'dry eye', 'itchy eye', 'ophthalmology', 'eye pain', 'double vision', 'visual disturbance', 'foreign body in eye'], specialist: 'Ophthalmologist' },
  { keywords: ['skin', 'rash', 'lesion', 'eczema', 'psoriasis', 'acne', 'dermatitis', 'blister'], specialist: 'Dermatologist' },
  { keywords: ['pregnancy', 'menstruation', 'gynecology', 'uterus', 'ovary', 'female reproductive'], specialist: 'Gynecologist' },
  { keywords: ['child', 'pediatric', 'infant', 'baby', 'toddler'], specialist: 'Pediatrician' },
  { keywords: ['brain', 'seizure', 'stroke', 'parkinson', 'epilepsy', 'neurology', 'migraine', 'headache'], specialist: 'Neurologist' },
  { keywords: ['heart', 'cardio', 'chest pain', 'hypertension', 'arrhythmia'], specialist: 'Cardiologist' },
  { keywords: ['bone', 'joint', 'fracture', 'arthritis', 'orthopedic', 'sprain'], specialist: 'Orthopedic Surgeon' },
  { keywords: ['mental', 'depression', 'anxiety', 'psychiatry', 'bipolar', 'schizophrenia'], specialist: 'Psychiatrist' },
  { keywords: ['ear', 'nose', 'throat', 'sinus', 'hearing', 'ent', 'sore throat', 'runny nose', 'nasal', 'tonsil', 'ear pain', 'hoarseness', 'snoring'], specialist: 'ENT Specialist' },
  { keywords: ['hormone', 'thyroid', 'diabetes', 'endocrine', 'endocrinology'], specialist: 'Endocrinologist' },
  { keywords: ['kidney', 'renal', 'nephro', 'dialysis'], specialist: 'Nephrologist' },
  { keywords: ['cancer', 'tumor', 'oncology', 'chemotherapy'], specialist: 'Oncologist' },
  { keywords: ['lung', 'asthma', 'pulmonary', 'respiratory', 'pulmonology'], specialist: 'Pulmonologist' },
  { keywords: ['urinary', 'prostate', 'urology', 'bladder'], specialist: 'Urologist' },
  { keywords: ['blood', 'anemia', 'hemato', 'leukemia'], specialist: 'Hematologist' },
  { keywords: ['autoimmune', 'rheumatoid', 'lupus', 'rheumatology'], specialist: 'Rheumatologist' },
  { keywords: ['allergy', 'asthma', 'allergic'], specialist: 'Allergist' },
  { keywords: ['infection', 'infectious', 'fever', 'sepsis'], specialist: 'Infectious Disease Specialist' },
  { keywords: ['plastic surgery', 'cosmetic', 'reconstructive'], specialist: 'Plastic Surgeon' },
  { keywords: ['dental', 'tooth', 'teeth', 'gum', 'dentist'], specialist: 'Dentist' },
  { keywords: ['anesthesia', 'anesthesiology'], specialist: 'Anesthesiologist' },
  { keywords: ['lab', 'biopsy', 'pathology'], specialist: 'Pathologist' },
  { keywords: ['scan', 'radiology', 'x-ray', 'mri', 'ct', 'ultrasound'], specialist: 'Radiologist' },
  { keywords: ['braces', 'orthodontics'], specialist: 'Orthodontist' },
  { keywords: ['gastro', 'liver', 'stomach', 'intestine', 'hepatitis', 'colitis'], specialist: 'Gastroenterologist' },
  { keywords: ['physician', 'general', 'checkup', 'fever', 'cough', 'cold', 'flu'], specialist: 'General Physician' },
];

function extractSpecialist(text) {
  const norm = s => s.toLowerCase();
  const normText = norm(text);
  // Disease/symptom keyword mapping
  for (const entry of diseaseToSpecialist) {
    for (const kw of entry.keywords) {
      if (normText.includes(kw)) return entry.specialist;
    }
  }
  // Exact match from allowedSpecialities
  for (const spec of allowedSpecialities) {
    if (normText.includes(norm(spec))) return spec;
  }
  // Synonym/partial match
  for (const [key, value] of Object.entries(synonyms)) {
    if (normText.includes(key)) {
      const match = allowedSpecialities.find(s => s.toLowerCase() === value.toLowerCase());
      return match || value;
    }
  }
  return 'General Physician';
}

function parseAIResponse(text, userInput = '') {
  // Try to parse as JSON
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = text.slice(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);
      // Map fields to expected frontend structure
      return {
        disclaimer: 'This is an AI-generated suggestion. Please consult a real doctor.',
        analysis: data.disease_analysis || [],
        symptoms: data.symptoms || [],
        causes: data.causes || [],
        prevention: data.prevention || [],
        evidence: data.evidence || [],
        potential_conditions: data.potential_conditions || [],
        specialist: { name: data.recommended_specialist || '', reason: `Consult a ${data.recommended_specialist || ''} for your symptoms.` },
      };
    }
  } catch (e) {
    // Fallback: return a single box with the raw text
    return {
      disclaimer: 'This is an AI-generated suggestion. Please consult a real doctor.',
      analysis: [text],
      symptoms: [],
      causes: [],
      prevention: [],
      evidence: [],
      potential_conditions: [],
      specialist: { name: '', reason: '' },
    };
  }
  // If not JSON, fallback to previous parser or show raw
  return {
    disclaimer: 'This is an AI-generated suggestion. Please consult a real doctor.',
    analysis: [text],
    symptoms: [],
    causes: [],
    prevention: [],
    evidence: [],
    potential_conditions: [],
    specialist: { name: '', reason: '' },
  };
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
        const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });
        let prompt = '';
        let input = [];
        // Strict JSON prompt
        if (hasSymptoms && hasImage) {
            prompt = `Given the following symptoms: ${symptoms}. Analyze the symptoms and the attached medical image. Return a JSON object with the following fields, each containing 2-3 concise, medically plausible lines (never empty, never generic, never 'no conditions found'):\n- "disease_analysis": [ ... ]\n- "symptoms": [ ... ]\n- "causes": [ ... ]\n- "prevention": [ ... ]\n- "potential_conditions": [ ... ]\n- "recommended_specialist": "..."\nDo not include any markdown, bullet points, or explanations—just the JSON.`;
            const imagePart = await fileToGenerativePart(req.file.buffer, req.file.mimetype);
            input = [prompt, imagePart];
        } else if (hasSymptoms) {
            prompt = `Given the following symptoms: ${symptoms}. Return a JSON object with the following fields, each containing 2-3 concise, medically plausible lines (never empty, never generic, never 'no conditions found'):\n- "disease_analysis": [ ... ]\n- "symptoms": [ ... ]\n- "causes": [ ... ]\n- "prevention": [ ... ]\n- "potential_conditions": [ ... ]\n- "recommended_specialist": "..."\nDo not include any markdown, bullet points, or explanations—just the JSON.`;
            input = [prompt];
        } else if (hasImage) {
            prompt = `Analyze the attached medical image. Return a JSON object with the following fields, each containing 2-3 concise, medically plausible lines (never empty, never generic, never 'no conditions found'):\n- "disease_analysis": [ ... ]\n- "evidence": [ ... ]\n- "potential_conditions": [ ... ]\n- "recommended_specialist": "..."\nDo not include any markdown, bullet points, or explanations—just the JSON.`;
            const imagePart = await fileToGenerativePart(req.file.buffer, req.file.mimetype);
            input = [prompt, imagePart];
        }
        const result = await model.generateContent(input);
        const responseText = result.response.text();
        const structured = parseAIResponse(responseText, symptoms);
        res.json({ success: true, data: structured });
    } catch (error) {
        console.error("DiseasePrediction error:", error);
        res.status(500).json({ success: false, message: error.message || "Error in disease prediction." });
    }
};
