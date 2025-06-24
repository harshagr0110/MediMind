import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctormodel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    // Validate input fields
    if (!email || !fullName || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ fullName, email, password: hash });

    // Generate JWT token
    const token = createToken(user._id);

    return res.status(201).json({ success: true, message: "User registered", token, userId: user._id });
  } catch (err) {
    console.error("Register User Error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    return res.json({ success: true, message: "Login successful", token, userId: user._id });
  } catch (err) {
    console.error("Login User Error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }

    const userId = req.user.id;
    const userData = await User.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, userData });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }

    const { fullName, phone, address, dob, gender } = req.body;
    const userId = req.user.id;

    if (!fullName || !phone || !address || !dob || !gender) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const updates = { fullName, phone, address, dob, gender };

    // Handle image upload if provided
    if (req.file) {
      try {
        updates.image = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, result) => {
            if (err) return reject(err);
            resolve(result.secure_url);
          });
          stream.end(req.file.buffer);
        });
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, userData: updatedUser });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating profile" });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

   // console.log("➡️ bookAppointment called with:", req.body);

    const docDataRaw = await doctormodel.findById(docId).select('-password');
    if (!docDataRaw) {
     // console.log("❌ Doctor not found");
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (!docDataRaw.available) {
    
      console.log("⚠️ Doctor not available");
      return res.status(400).json({ success: false, message: "Doctor is not available" });
    }

    let slots_booked = docDataRaw.slots_booked || {};
    if (slots_booked[slotDate]) {
      console.log("this dayyy");
      if (slots_booked[slotDate].includes(slotTime)) {
        console.log("⚠️ Slot already booked");
       // toast.error("Slot is already booked");
        return res.status(200).json({ success: false, message: "Slot is already booked" });
      } else {
        console.log("linewwwwww");
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }
    console.log("linewwwwww");
    const userData = await User.findById(userId).select('-password');
    if (!userData) {
     // console.log("❌ User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const docData = docDataRaw.toObject();
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      date: Date.now(),
    };

//    console.log("📝 Saving appointment:", appointmentData);

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

   // console.log("✅ Appointment saved. Updating doctor slots...");
    await doctormodel.findByIdAndUpdate(docId, { slots_booked });

 //   console.log("✅ Doctor updated");
 const doctordata=await doctormodel.findById(docId)
    console.log(doctordata);
    return res.status(200).json({ success: true, appointmentId: newAppointment._id });
   
  } catch (error) {
   // console.error("🔥 ERROR in bookAppointment:", error);
    return res.status(500).json({ success: false, message: "Server error while booking appointment" });
  }
};

export const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await appointmentModel.find({userId});
    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("🔥 ERROR in listAppointment:", error);
    return res.status(500).json({ success: false, message: "Server error while listing appointments" });
  }
};

export const cancelAppointment=async(req,res)=>{
  try{
    const {appointmentId}=req.body
    const userId=req.user.id
    const appointment=await appointmentModel.findById(appointmentId)
    if(appointment.userId!==userId){
      return res.status(401).json({success:false,message:"Unauthorized: Invalid token"});
    }
    else{
      await appointmentModel.findByIdAndDelete(appointmentId,{cancelled:true})
      const {docId,slotDate,slotTime}=appointment
      const docdata=await doctormodel.findById(docId)
      const slots_booked=docdata.slots_booked
      if(slots_booked[slotDate]){
        slots_booked[slotDate]=slots_booked[slotDate].filter((time)=>time!==slotTime)
        await doctormodel.findByIdAndUpdate(docId,{slots_booked})
      }
      return res.status(200).json({success:true,message:"Appointment cancelled"})

    }
  }
  catch(error){
    console.error("🔥 ERROR in cancelAppointment:", error);
    return res.status(500).json({ success: false, message: "Server error while cancelling appointment" });
  }
}


export const createStripeSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;

    // Validate appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access" 
      });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed" 
      });
    }

    if (appointment.cancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot pay for cancelled appointment" 
      });
    }

    // Get doctor details
    const doctor = await doctormodel.findById(appointment.docId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL;

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Appointment with Dr. ${doctor.fullName}`,
              description: `Appointment on ${appointment.slotDate} at ${appointment.slotTime}`
            },
            unit_amount: Math.round(appointment.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: userId.toString()
      },
      success_url: `${origin}/payment-success?success=true&appointmentId=${appointmentId}`,
      cancel_url: `${origin}/payment-success?success=false&appointmentId=${appointmentId}`,
    });

    return res.status(200).json({ 
      success: true, 
      url: session.url 
    });

  } catch (error) {
    console.error("Stripe Session Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error creating payment session",
      error: error.message 
    });
  }
};

export const verifyStripe = async (req, res) => {
  try {
    const { appointmentId, success } = req.body;

    // Validate input
    if (!appointmentId || typeof success !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid parameters" 
      });
    }

    // Find and update appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (success === "true") {
      appointment.paymentStatus = 'paid';
      await appointment.save();
      
      return res.status(200).json({ 
        success: true, 
        message: "Payment confirmed successfully" 
      });
    } else {
      return res.status(200).json({ 
        success: false, 
        message: "Payment not completed" 
      });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error verifying payment",
      error: error.message 
    });
  }
};


const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const GEMINI_MODEL = "gemini-2.0-flash"; 

// --- Main Prediction Endpoint ---
export const predict= async (req, res) => {
    // Validate API Key is available
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    let symptoms = req.body.symptoms;
    let specialitiesList = req.body.specialitiesList;
    let images = [];

    // If specialitiesList is a string (from FormData), parse it
    if (typeof specialitiesList === 'string') {
        try {
            specialitiesList = JSON.parse(specialitiesList);
        } catch (e) {
            specialitiesList = [];
        }
    }

    // If files are present (from multer), convert to Gemini inlineData
    if (req.files && req.files.length > 0) {
        images = req.files.map(file => ({
            inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString('base64')
            }
        }));
    } else if (req.body.images) {
        // If images are sent as JSON (base64), use them directly
        images = req.body.images;
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch (e) {
                images = [];
            }
        }
    }

    if (!symptoms && (!images || images.length === 0)) {
        return res.status(400).json({ error: 'Please provide symptoms or images.' });
    }

    try {
        // --- Prepare parts for Gemini API ---
        let diseaseParts = [{ text: `Based on these symptoms: "${symptoms}" ${images && images.length > 0 ? "and the provided images," : ""}, provide a brief description of the possible condition, its causes, prevention, and treatment. Keep it concise, under 200 words. Format with **bold** section headers.` }];
        if (images && images.length > 0) {
            diseaseParts.push(...images); // Add inlineData objects for images
        }

        let specialistParts = [{ text: `Based on these symptoms: "${symptoms}" ${images && images.length > 0 ? "and the provided images," : ""}, which medical specialist should the patient see? Respond with JUST the specialty name from this exact list: ${specialitiesList.join(', ')}. Provide only the specialty name, one word if possible, or the most common short form.` }];
        if (images && images.length > 0) {
            specialistParts.push(...images); // Add inlineData objects for images
        }

        // --- First Gemini API Call: Disease Info ---
        const diseasePayload = { contents: [{ role: "user", parts: diseaseParts }] };
        const diseaseResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            diseasePayload,
            { headers: { "Content-Type": "application/json" } }
        );
        const diseaseText = diseaseResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!diseaseText) {
            throw new Error("No disease information received from Gemini API.");
        }

        // --- Second Gemini API Call: Specialist Info ---
        const specialistPayload = { contents: [{ role: "user", parts: specialistParts }] };
        const specialistResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            specialistPayload,
            { headers: { "Content-Type": "application/json" } }
        );
        const specialistText = specialistResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!specialistText) {
            throw new Error("No specialist suggestion received from Gemini API.");
        }

        // --- Send combined response back to frontend ---
        res.json({
            diseaseInfo: diseaseText,
            specialistResult: specialistText
        });

    } catch (error) {
        console.error('Error calling Gemini API from backend:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        const errorMessage = error.response ? error.response.data.error?.message || error.response.data?.message : 'Internal Server Error';
        res.status(status).json({ error: errorMessage });
    }
};

// Delete appointment by ID
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow user to delete their own appointment
    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    await appointmentModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
