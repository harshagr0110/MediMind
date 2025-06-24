import mongoose from 'mongoose';
import validator from 'validator';

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: 'Admin'
    }
}, { timestamps: true });

const adminModel = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default adminModel; 