import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
  proposedBudget: {
    type: Number,
    required: true,
    min: 0,
  },
  timeline: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  }
}, { timestamps: true });

// Prevent duplicate proposals from the same freelancer to the same job
proposalSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export default mongoose.model("Proposal", proposalSchema);
