const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const validator = require("validator");
const BlacklistToken = require("../models/blacklistedTokens");

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if required fields are missing
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason:${Missing Field}",
        error: null,
      });
    }

    // Check if the email already exists
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Email already exists.",
        error: null,
      });
    }

    // Check if the format of the email is correct
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Email not valid!",
        error: null,
      });
    }

    // Check password length
    if (password.length <= 4) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Password length can't be less than 4",
        error: null,
      });
    }

    // Check if the user is first user in the system
    const numUsers = await User.countDocuments();

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    await User.create({
      email,
      password: hashedPassword,
      role: numUsers === 0 ? "Admin" : "Viewer",
    });

    // Return success response
    return res.status(201).json({
      status: 201,
      data: null,
      message: "User created successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error while signing up",
      error: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all the required fields are present
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request, Reason: ${Missing Field}",
        error: null,
      });
    }

    // Check if the user is not registered
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    // Validate password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 401,
        data: null,
        message: "Invalid Password.",
        error: null,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Return login success response
    return res.status(200).json({
      status: 200,
      data: {
        token,
      },
      message: "Login successful.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error while logging.",
      error: err,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // One must login to logout of the system
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decode.exp * 1000);

    // Mark the token as blacklist so that this token can't be used to login again
    await BlacklistToken.create({ token, expiresAt });

    // Return success response
    return res.status(200).json({
      state: 200,
      data: null,
      message: "User logged out successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while logging out.",
      error: err,
    });
  }
};