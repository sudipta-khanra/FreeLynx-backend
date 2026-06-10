import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Proposal from "../models/Proposal.js";
import {
  submitProposal,
  getProposalsByJob,
  getProposalsByFreelancer,
  deleteProposalById,
  acceptProposal,
  rejectProposal,
} from "../controllers/proposalController.js";

const router = express.Router();

// ✅ Special route first — avoids conflict with /:jobId
router.get("/all-populated", protect, async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate("freelancerId", "name email") // freelancer details
      .populate("jobId", "title") // job details
      .exec();

    const formattedProposals = proposals.map((p) => ({
  _id: p._id,  // keep original _id key
  jobPostId: p.jobId?._id || null,
  jobTitle: p.jobId?.title || "Untitled",
  freelancerName: p.freelancerId?.name || "Unknown",
  freelancerMail: p.freelancerId?.email || "N/A",
  coverLetter: p.coverLetter,
  bidAmount: p.proposedBudget,
  timeline: p.timeline,
  status: p.status,
}));


    res.json(formattedProposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a proposal
router.post("/", protect, submitProposal);

// Get proposals by job
router.get("/:jobId", protect, getProposalsByJob);

// Get proposals by freelancer
router.get("/", protect, getProposalsByFreelancer);

// Delete a proposal
router.delete("/:proposalId", protect, deleteProposalById);

// Add accept/reject routes here
router.post("/:proposalId/accept", protect, acceptProposal);
router.post("/:proposalId/reject", protect, rejectProposal);
export default router;
