import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    //console.log(token);

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    // Check for empty, 'null', or 'undefined' tokens
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure req.user.id is consistently set for all middleware
    req.user = { id: decoded.id, ...decoded };
    next();
  } catch (error) {
    console.error("adminAuth error:", error);
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

export default userAuth;
