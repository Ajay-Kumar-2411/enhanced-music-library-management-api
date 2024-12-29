const jwt = require("jsonwebtoken");
const BlacklistToken = require("../models/blacklistedTokens");
const User = require("../models/user");

// Middleware to validate token
exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // If token doesn't exist (Unauthorized Access) or user has already logged out of the session (token is blacklisted)
    if (!token || (await BlacklistToken.findOne({ token }))) {
      return res.status(401).json({
        state: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;

      // If the old token of any deleted user is provided 
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(400).json({
          state: 400,
          data: null,
          message: "User currently logged in does not exist!",
          error: null,
        });
      }
    } catch (err) {
      // If token is invalid (Unauthorized Access)
      return res.status(401).json({
        state: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while validating token.",
    });
  }
};

// Middleware to validate Admin role
exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);

    if (userDetails.role !== "Admin") {
      return res.status(403).json({
        state: 403,
        data: null,
        message: "Forbidden Access/Operation not allowed.",
        error: null,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      state: 500,
      data: null,
      message: "User role can't be verified.",
      error: null,
    });
  }
};

// Middleware to validate editor & admin role
exports.isEditorOrAdmin = async (req, res, next) => {
  try {
    // Querying database instead of taking it from token decode
    const userDetails = await User.findById(req.user.id);
    
    if (userDetails.role !== "Editor" && userDetails.role !== "Admin") {
      return res.status(403).json({
        state: 403,
        data: null,
        message: "Forbidden Access/Operation not allowed.",
        error: null,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      state: 500,
      data: null,
      message: "User role can't be verified.",
      error: null,
    });
  }
};