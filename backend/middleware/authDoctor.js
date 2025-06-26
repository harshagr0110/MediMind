import jwt from "jsonwebtoken";

// Frontend must send doctor token as Authorization: Bearer <token>
const authDoctor = (req, res, next) => {
  try {
    console.log('authDoctor middleware called. Headers:', req.headers);
    let dToken = req.headers.authorization || req.headers.dToken;
    console.log('authDoctor: Incoming token:', dToken);
    if (!dToken) {
      console.error('authDoctor: No dToken provided');
      return res.status(401).json({ message: "Unauthorized: No dToken provided" });
    }
    // Remove "Bearer " prefix if present
    if (dToken.startsWith("Bearer ")) {
      dToken = dToken.slice(7).trim();
    }
    let decoded;
    try {
      decoded = jwt.verify(dToken, process.env.JWT_SECRET);
      console.log('authDoctor: Decoded payload:', decoded);
    } catch (err) {
      console.error('authDoctor: Token verification failed:', err.message);
      return res.status(401).json({ message: "Unauthorized: Token verification failed", error: err.message });
    }
    // Ensure req.user.id is set
    if (!decoded.id) {
      console.error('authDoctor: Token missing doctor id');
      return res.status(401).json({ message: "Unauthorized: Token missing doctor id" });
    }
    req.user = { id: decoded.id, role: decoded.role };
    console.log('authDoctor: req.user set to:', req.user);
    next();
  } catch (error) {
    console.error("authDoctor: Unexpected error:", error, error?.stack);
    return res.status(401).json({ message: "Unauthorized: Unexpected error", error: error.message, stack: error.stack });
  }
};

export default authDoctor;
