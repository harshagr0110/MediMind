import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    let aToken = req.headers.authorization || req.headers.aToken;
    if (!aToken) {
      return res.status(401).json({ message: "Unauthorized: No aToken provided" });
    }

    // Remove "Bearer " prefix if present
    if (aToken.startsWith("Bearer ")) {
      aToken = aToken.slice(7).trim();
    }

    const decoded = jwt.verify(aToken, process.env.JWT_SECRET);
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    next();
  } catch (error) {
    console.error("adminAuth error:", error);
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

export default adminAuth;
