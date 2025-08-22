import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register user
export const registerController = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills, experience, portfolio } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password with bcrypt (no separate salt needed)
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      // hash,
      password: hash, // ✅ clear and consistent
      role,
      bio,
      skills,
      experience,
      portfolio,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get profile
export const getProfileController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
export const updateProfileController = async (req, res) => {
  try {
    let { bio, skills, experience, portfolio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (bio && bio.trim() !== "") user.bio = bio.trim();

    if (
      skills &&
      (Array.isArray(skills) ? skills.length > 0 : skills.trim() !== "")
    ) {
      if (typeof skills === "string") {
        skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      user.skills = Array.isArray(skills) ? skills : [];
    }

    if (experience && experience.trim() !== "")
      user.experience = experience.trim();

    if (
      portfolio &&
      (Array.isArray(portfolio)
        ? portfolio.length > 0
        : portfolio.trim() !== "")
    ) {
      if (typeof portfolio === "string") {
        portfolio = portfolio
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
      user.portfolio = Array.isArray(portfolio) ? portfolio : [];
    }

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload avatar
export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({ message: "Avatar uploaded", avatar: user.avatar });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete account
export const deleteAccountController = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error deleting account" });
  }
};
