// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // Check for Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token missing" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach user to request object
      req.user = user;
      next();
    } else {
      return res
        .status(401)
        .json({ message: "Authorization header missing or malformed" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else {
      return res.status(500).json({ message: "Server error" });
    }
  }
};
