import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [
      { type: Types.ObjectId, ref: "User", required: true }
    ], // Array of 2 users in a conversation
    lastMessage: {
      body: { type: String, default: "" },
      sender: { type: Types.ObjectId, ref: "User" },
      at: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

// ✅ Helpful index for fast lookup (latest chats first)
ConversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
