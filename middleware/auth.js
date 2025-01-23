const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User } = require("../models/models");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Authorization header missing",
      });
    }

    // Check if
    // token follows Bearer scheme
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        status: "error",
        message: "Invalid authorization format. Use: Bearer <token>",
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    // Find user 
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // Update last login time
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Request Validation Middleware
 * Validates request data against defined rules using express-validator
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);

    // If there are validation errors
    if (!errors.isEmpty()) {
      // Format errors for better readability
      const formattedErrors = errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      }));

      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: formattedErrors,
      });
    }

    // Sanitize request body to prevent XSS
    if (req.body) {
      Object.keys(req.body).forEach((key) => {
        if (typeof req.body[key] === "string") {
          req.body[key] = req.body[key].trim();
        }
      });
    }

    next();
  } catch (error) {
    console.error("Validation Middleware Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error during validation",
    });
  }
};

/**
 * Role-based Authorization Middleware Factory
 * Creates middleware to check if user has required role
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          status: "error",
          message: "User not authenticated",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: "Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      console.error("Role Authorization Error:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Rate Limiting Middleware
 * Basic implementation - consider using redis for production
 */
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  store: new Map(),
};

const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  // Clean up old entries
  if (rateLimit.store.has(ip)) {
    const requests = rateLimit.store
      .get(ip)
      .filter((time) => now - time < rateLimit.windowMs);

    if (requests.length >= rateLimit.max) {
      return res.status(429).json({
        status: "error",
        message: rateLimit.message,
      });
    }

    requests.push(now);
    rateLimit.store.set(ip, requests);
  } else {
    rateLimit.store.set(ip, [now]);
  }

  next();
};

module.exports = {
  authMiddleware,
  validateRequest,
  requireRole,
  rateLimitMiddleware,
};
