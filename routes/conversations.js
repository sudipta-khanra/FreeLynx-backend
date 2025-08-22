import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { protect } from "../middlewares/authMiddleware.js";  // ✅ import

const router = express.Router();

// GET /api/conversations  → list my conversations
router.get("/", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;   // ✅ use _id (Mongoose object id)
    const convos = await Conversation.find({ participants: userId })
      .populate("participants", "_id name")
      .sort({ updatedAt: -1 })
      .lean();

    res.json(convos);
  } catch (e) {
    next(e);
  }
});

// GET /api/conversations/:id/messages?limit=50
router.get("/:id/messages", protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

    // Ensure user is part of the conversation
    const convo = await Conversation.findOne({ _id: id, participants: req.user._id });
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate("sender", "name")
      .lean();

    res.json(messages);
  } catch (e) {
    next(e);
  }
});
// POST /api/conversations/init
router.post("/init", protect, async (req, res) => {
  const { receiverId } = req.body;

  let convo = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] }
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [req.user._id, receiverId]
    });
  }

  res.json(convo);
});

export default router;
