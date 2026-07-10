import User from "../models/User.js";

// ---------- GET ALL USERS ----------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -resetOtpHash").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// ---------- DELETE USER ----------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User nahi mila." });
    }

    // Safety: admin khud ko ya kisi doosre admin ko delete na kar sake
    if (userToDelete.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin account delete nahi kiya ja sakta." });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "User delete ho gaya." });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};