import express from "express";
import {
  getProfileController,
  updateProfileController,
  uploadAvatarController,
  deleteAccountController,
  registerController
} from "../controllers/userController.js";
import upload from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Public route
router.post("/register", registerController);

// Protected routes
router.get("/profile", protect, getProfileController);
router.put("/profile", protect, updateProfileController);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatarController);
router.delete("/delete", protect, deleteAccountController);

// Get all users (except the logged-in user)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
