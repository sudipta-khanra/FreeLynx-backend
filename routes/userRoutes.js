import express from "express";
import {
  getProfileController,
  updateProfileController,
  uploadAvatarController,
  deleteAccountController,
  registerController
} from "../controllers/userController.js";
import upload from '../middlewares/upload.js';

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route
router.post("/register", registerController);

// Protected routes
router.get("/profile", protect, getProfileController);
router.put("/profile", protect, updateProfileController);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatarController);
router.delete("/delete", protect, deleteAccountController);

export default router;
