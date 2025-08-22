import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js"; // <-- Add this
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
    let proposals;

    if (req.user.role === "admin") {
      // Admin sees everything
      proposals = await Proposal.find()
        .populate("freelancerId", "name email")
        .populate("jobId", "title client");
    } else if (req.user.role === "client") {
      // Client sees only proposals for their jobs
      const jobs = await Job.find({ client: req.user._id }).select("_id");
      const jobIds = jobs.map((job) => job._id);

      proposals = await Proposal.find({ jobId: { $in: jobIds } })
        .populate("freelancerId", "name email")
        .populate("jobId", "title client");
    } else if (req.user.role === "freelancer") {
      // Freelancer sees only their proposals
      proposals = await Proposal.find({ freelancerId: req.user._id })
        .populate("jobId", "title client")
        .populate("freelancerId", "name email");
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    const formattedProposals = proposals.map((p) => ({
      _id: p._id,
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
