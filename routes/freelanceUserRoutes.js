import express from "express";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/:freelancerId", async (req, res) => {
  const id = req.params.freelancerId;
  console.log(`id is here: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid freelancer ID" });
  }

  try {
    const freelancer = await User.findById(id).select("-hash");
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }
    res.json(freelancer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
