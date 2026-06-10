import express from 'express';
import { loginController, registerController, getProfile, updateProfileController  } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileController);


// router.post('/register', registerUser);
// router.post('/login', loginUser);

export default router;
