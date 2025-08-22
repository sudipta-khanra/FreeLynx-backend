import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js";
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
      proposals = await Proposal.find()
        .populate("freelancerId", "name email")
        .populate("jobId", "title client");
    } else if (req.user.role === "client") {
      const jobs = await Job.find({ client: req.user._id }).select("_id");
      const jobIds = jobs.map((job) => job._id);
      if (!jobIds.length) return res.json([]); // No jobs, return empty array

      proposals = await Proposal.find({ jobId: { $in: jobIds } })
        .populate("freelancerId", "name email")
        .populate("jobId", "title client");
    } else if (req.user.role === "freelancer") {
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

// Get proposals by freelancer — keep this before /:jobId
router.get("/", protect, getProposalsByFreelancer);

// Get proposals by job
router.get("/:jobId", protect, getProposalsByJob);

// Delete a proposal
router.delete("/:proposalId", protect, deleteProposalById);

// Accept/reject a proposal
router.post("/:proposalId/accept", protect, acceptProposal);
router.post("/:proposalId/reject", protect, rejectProposal);

export default router;
