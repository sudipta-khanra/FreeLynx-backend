// routes/messages.js
import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/messages/:conversationId?limit=50&skip=0
router.get("/:conversationId", protect, async (req, res) => {
  const { conversationId } = req.params;
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
  const skip = parseInt(req.query.skip || "0", 10);

  try {
    // ✅ ensure user is part of the conversation
    const convo = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!convo) {
      return res.status(403).json({ error: "Not authorized for this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate("sender", "name avatar")
      .lean();

    // Return in chronological order (optional)
    messages.reverse();

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
