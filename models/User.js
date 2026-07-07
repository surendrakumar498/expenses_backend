import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // already hashed (bcrypt)

    // --- Forgot password fields ---
    resetOtpHash: { type: String, default: null },   // hashed OTP (never store plain OTP)
    resetOtpExpiry: { type: Date, default: null },   // OTP validity (e.g. 5 min)
    resetOtpAttempts: { type: Number, default: 0 },  // wrong attempts count
    resetVerified: { type: Boolean, default: false }, // OTP verify hone ke baad true, reset ke liye allow karta hai
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);