import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendOtpEmail from "../utils/sendEmail.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// Helper: JWT token generate karta hai
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ---------- REGISTER ----------
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email aur password required hain." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password kam se kam 8 characters ka hona chahiye." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Ye email pehle se registered hai." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// ---------- LOGIN ----------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// ---------- FORGOT PASSWORD: Request OTP ----------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: "If this email is registered, an OTP has been sent to it." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    user.resetOtpAttempts = 0;
    user.resetVerified = false;
    await user.save();

    await sendOtpEmail(user.email, otp);

    return res.status(200).json({ message: "If this email is registered, an OTP has been sent to your email." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ---------- FORGOT PASSWORD: Verify OTP ----------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtpHash || !user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP request" });
    }
    if (user.resetOtpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ message: "Your OTP has expired. Please request a new OTP." });
    }
    if (user.resetOtpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOtpHash);
    if (!isMatch) {
      user.resetOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Wrong OTP" });
    }

    user.resetVerified = true;
    user.resetOtpHash = null;
    user.resetOtpExpiry = null;
    user.resetOtpAttempts = 0;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully. You can now set a new password." });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ message: "Something went wrong please try again." });
  }
};

// ---------- FORGOT PASSWORD: Reset Password ----------
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetVerified) {
      return res.status(400).json({ message: "Please verify the OTP first." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password has been reset successfully. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};