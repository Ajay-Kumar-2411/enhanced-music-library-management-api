const User = require("../models/user");
const validator = require("validator");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
  try {
    const { limit = 5, offset = 0, role } = req.query;

    const validRoles = ["Admin", "Editor", "Viewer"];

    // Bad Request, Invalid query parameters
    if (
      isNaN(limit) ||
      limit < 0 ||
      isNaN(offset) ||
      offset < 0 ||
      (role && !validRoles.includes(role))
    ) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Retrieve all users except ADMIN
    const users = await User.find({
      role: role
        ? role
        : {
            $in: ["Viewer", "Editor"],
          },
    })
      .skip(offset)
      .limit(limit);

    const outputResponse = users.map((user) => ({
      user_id: user._id,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
    }));

    // Return Success Response
    return res.status(200).json({
      status: 200,
      data: outputResponse,
      message: "Users retrieved successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error while retrieving users details.",
      error: err,
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check missing fields
    if (!email || !password || !role || role === "Admin") {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if user already exists
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        state: 409,
        data: null,
        message: "Email already exists.",
        error: null,
      });
    }

    // Check if the format of email is correct
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Email not valid!",
        error: null,
      });
    }

    // Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    await User.create({
      email,
      password: hashedPassword,
      role,
    });

    // Return success response
    return res.status(201).json({
      state: 201,
      data: null,
      message: "User created successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while creating user",
      error: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check missing field
    if (!userId) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Return success response
    return res.status(200).json({
      state: 200,
      data: null,
      message: "User deleted successfully.",
      error: null,
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while deleting user",
      error: err,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const user = await User.findById(req.user.id);

    // Check missing fields
    if (!old_password || !new_password) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Bad Request",
        error: null,
      });
    }

    // Check password length
    if (new_password.length <= 4) {
      return res.status(400).json({
        state: 400,
        data: null,
        message: "Password length can't be less than 4",
        error: null,
      });
    }
    
    // If the user doesn't exist
    if (!user) {
      return res.status(404).json({
        state: 404,
        data: null,
        message: "User not found.",
        error: null,
      });
    }

    // If old password does not match
    const isPasswordMatch = await bcrypt.compare(old_password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        state: 401,
        data: null,
        message: "Unauthorized Access",
        error: null,
      });
    }

    // Encrypt new Password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update Password
    user.password = hashedPassword;
    await user.save();

    // Password updated successfully status
    return res.sendStatus(204);
  } catch (err) {
    // Return error response
    return res.status(500).json({
      state: 500,
      data: null,
      message: "Internal server error while updating password",
      error: err,
    });
  }
};
