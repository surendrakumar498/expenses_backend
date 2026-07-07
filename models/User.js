import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // --- Forgot password fields ---
    resetOtpHash: { type: String, default: null },  
    resetOtpExpiry: { type: Date, default: null },  
    resetOtpAttempts: { type: Number, default: 0 },
    resetVerified: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);