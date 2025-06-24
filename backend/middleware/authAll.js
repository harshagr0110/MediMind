import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';
import adminModel from '../models/adminModel.js'; // Assuming you have an admin model

const authAll = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token is required.' });
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's a doctor
        let user = await doctorModel.findById(decoded.id).select('fullName');
        if (user) {
            req.user = { id: user._id, model: 'Doctor', name: user.fullName };
            return next();
        }

        // Check if it's an admin
        user = await adminModel.findById(decoded.id).select('name'); // Assuming admin has 'name' field
        if (user) {
            req.user = { id: user._id, model: 'Admin', name: user.name };
            return next();
        }

        return res.status(404).json({ success: false, message: 'User not found or not authorized.' });

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
};

export default authAll; 