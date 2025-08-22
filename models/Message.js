import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const MessageSchema = new Schema(
  {
    conversation: { 
      type: Types.ObjectId, 
      ref: "Conversation", 
      required: true 
    },
    sender: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    body: { 
      type: String, 
      trim: true, 
      default: "" 
    },
    attachments: [
      {
        url: { type: String },
        name: { type: String },
        size: { type: Number }
      }
    ],
    readBy: [{ type: Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

// ✅ Index for faster queries: get latest messages quickly
MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model("Message", MessageSchema);

export default Message;
