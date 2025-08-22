import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const handleNewMessage = async ({ senderId, conversationId, text }) => {
  // Save message
  const message = await Message.create({
    sender: senderId,
    conversation: conversationId,
    body: text
  });

  // Update last message in conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: { body: text, sender: senderId, at: new Date() }
  });

  return message;
};
