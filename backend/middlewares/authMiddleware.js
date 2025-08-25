// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔹 Protect Middleware - Verify Token & Attach User
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    // ✅ Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user by ID (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired",
    });
  }
};

// 🔹 Role-based Access Middlewares
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({
    success: false,
    message: "Access denied: Admins only",
  });
};

export const recruiterOnly = (req, res, next) => {
  if (req.user && req.user.role === "recruiter") return next();
  return res.status(403).json({
    success: false,
    message: "Access denied: Recruiters only",
  });
};

export const jobseekerOnly = (req, res, next) => {
  if (req.user && req.user.role === "jobseeker") return next();
  return res.status(403).json({
    success: false,
    message: "Access denied: Jobseekers only",
  });
};
