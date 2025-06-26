import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: Number, required: true },
  about: { type: String, required: true },
  available: { type: Boolean, required: true },
  fees: { type: Number, required: true },
  address: { type: String },
  date: { type: Date, default: Date.now },
  slots_booked: { type: Object, default: {} }
}, { minimized: false });

const doctormodel = mongoose.models.doctors || mongoose.model('doctors', doctorSchema);

export default doctormodel;
