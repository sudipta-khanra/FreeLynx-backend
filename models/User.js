import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hash: { type: String },
    role: { type: String },
    avatar: { type: String, default: '' },
    bio: { type: String },
    skills: { type: [String], default: [] },
    experience: { type: String },
    portfolio: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
