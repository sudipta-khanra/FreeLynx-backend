import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // salt: { type: String },
    hash: { type: String },
    role: { type: String },
    avatar: { type: String, default: "" },
    bio: { type: String },                  // string is fine
    skills: { type: [String], default: [] }, // array of strings
    experience: { type: String },           // string is fine
    portfolio: { type: [String], default: [] }, // array of strings
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
