const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/models.js");

class UserController {
  /**
   * User login
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      // if (!user.isActive) {
      //   return res.status(401).json({
      //     status: "error",
      //     message: "Account is disabled",
      //   });
      // }

      // Generate JWT token
      const EXPRIES_IN = process.env.JWT_EXPIRATION || "72h";
      const JWT_SECRET = process.env.JWT_SECRET;

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: EXPRIES_IN }
      );

      // Update last login
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
      });

      res.json({
        status: "success",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during login",
      });
    }
  }

  /**
   * User logout
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async logout(req, res) {
    try {
      // In a more complex implementation, you might want to:
      // 1. Add token to a blacklist
      // 2. Clear any session data
      // 3. Perform cleanup operations

      res.json({
        status: "success",
        message: "Successfully logged out",
      });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during logout",
      });
    }
  }

  /**
   * Change password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      await User.findByIdAndUpdate(userId, {
        passwordHash: newPasswordHash,
      });

      res.json({
        status: "success",
        message: "Password successfully updated",
      });
    } catch (error) {
      console.error("Change Password Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while changing password",
      });
    }
  }
}

module.exports = UserController;
