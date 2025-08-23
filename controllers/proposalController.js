import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js";

// Submit a proposal (freelancers only)
export const submitProposal = async (req, res) => {
  try {
    const { jobId, coverLetter, proposedBudget, timeline } = req.body;
    const freelancerId = req.user._id;

    // Only freelancers can submit proposals
    if (req.user.role !== "freelancer") {
      return res
        .status(403)
        .json({ message: "Only freelancers can submit proposals." });
    }

    // Check if the freelancer already submitted a proposal for this job
    let proposal = await Proposal.findOne({ jobId, freelancerId });
    if (proposal) {
      // Update existing proposal
      proposal.coverLetter = coverLetter;
      proposal.proposedBudget = proposedBudget;
      proposal.timeline = timeline;
      proposal.status = "pending"; // reset status if needed
      await proposal.save();

      return res.status(200).json({ message: "Proposal updated successfully." });
    }

    // Create new proposal
    proposal = new Proposal({
      jobId,
      freelancerId,
      coverLetter,
      proposedBudget,
      timeline,
    });

    await proposal.save();

    res.status(201).json({ message: "Proposal submitted successfully." });
  } catch (error) {
    console.error("Error submitting proposal:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

// Get proposals for a specific job (clients/admin only)
export const getProposalsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only allow client (who owns job) or admin
    if (req.user.role === "client" && job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You don't own this job." });
    }

    if (req.user.role === "freelancer") {
      return res.status(403).json({ message: "Freelancers cannot view proposals for others' jobs." });
    }

    const proposals = await Proposal.find({ jobId }).populate("freelancerId", "name email");

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get proposals submitted by logged-in freelancer
export const getProposalsByFreelancer = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Access denied." });
    }

    const freelancerId = req.user._id;
    const proposals = await Proposal.find({ freelancerId }).populate("jobId", "title");

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching freelancer proposals:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

// Delete a proposal
export const deleteProposalById = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found." });
    }

    if (proposal.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this proposal." });
    }

    await Proposal.findByIdAndDelete(proposalId);
    res.json({ message: "Proposal deleted successfully." });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

// Accept proposal
export const acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    proposal.status = "accepted";
    await proposal.save();

    res.json({ message: "Proposal accepted successfully" });
  } catch (error) {
    console.error("Error accepting proposal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject proposal
export const rejectProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    proposal.status = "rejected";
    await proposal.save();

    res.json({ message: "Proposal rejected successfully" });
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
