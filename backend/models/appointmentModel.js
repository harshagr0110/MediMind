import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },
  slotDate: {
    type: String,
    required: true,
  },
  slotTime: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
  docData: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  paymentStatus: {  // Changed from 'payment' to be more descriptive
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  reservedAt: {
    type: Date,
    default: null
  },
  reservedBy: {
    type: String,
    default: null
  },
  reservationExpiry: {
    type: Date,
    default: null
  }
}, { timestamps: true });  // Added timestamps for createdAt and updatedAt

// Indexes for better query performance
appointmentSchema.index({ docId: 1, slotDate: 1, slotTime: 1 });
appointmentSchema.index({ userId: 1, slotDate: -1 });
appointmentSchema.index({ paymentStatus: 1, cancelled: 1 });
appointmentSchema.index({ reservationExpiry: 1 });

export default mongoose.model('appointment', appointmentSchema);  // Capitalized model name