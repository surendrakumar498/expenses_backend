import express from "express";
import { getAllUsers, deleteUser } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ab sirf logged-in admin hi ye routes hit kar sakta hai
router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;