import Proposal from "../models/Proposal.js";

// Submit a proposal (freelancers only)
export const submitProposal = async (req, res) => {
  console.log("req.params:", req.params);

  try {
    const { jobId, coverLetter, proposedBudget } = req.body;
    const freelancerId = req.user._id;
    console.log(req.body);

    // Only freelancers can submit proposals
    if (req.user.role !== "freelancer") {
      return res
        .status(403)
        .json({ message: "Only freelancers can submit proposals." });
    }

    // Check if the freelancer already submitted a proposal for this job
    const existingProposal = await Proposal.findOne({ jobId, freelancerId });
    if (existingProposal) {
      return res.status(409).json({
        message: "You have already submitted a proposal for this job.",
      });
    }

    // Create new proposal
    const proposal = new Proposal({
      jobId,
      freelancerId,
      coverLetter,
      proposedBudget,
    });

    await proposal.save();

    res.status(201).json({ message: "Proposal submitted successfully." });
  } catch (error) {
    console.error("Error submitting proposal:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
  console.log(req.body);
};

// Get proposals for a specific job (clients/admin only)
// export const getProposalsByJob = async (req, res) => {
//   console.log("Request body:", req.body);
//   console.log("req.params:", req.params);
//   try {
//     const { jobId } = req.params;
//     if (req.user.role !== "client" && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Access denied." });
//     }
//     const proposals = await Proposal.find({ jobId }).populate(
//       "freelancerId",
//       "name email"
//     );
//     res.json(proposals);
//   } catch (error) {
//     console.error("Error fetching proposals:", error);
//     res.status(500).json({ message: "Server error, please try again later." });
//   }
// };
// Get proposals for a specific job (clients/admin only)
export const getProposalsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Fetch the job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only allow client (who owns job) or admin
    if (req.user.role === "client" && job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You don't own this job." });
    }

    if (req.user.role === "freelancer") {
      return res.status(403).json({ message: "Freelancers cannot view proposals for others' jobs." });
    }

    // Fetch proposals and populate freelancer details
    const proposals = await Proposal.find({ jobId }).populate("freelancerId", "name email");

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get proposals submitted by logged-in freelancer
export const getProposalsByFreelancer = async (req, res) => {
  console.log("Request body:", req.params); // <-- Add this line to print req.body
  console.log("req.params:", req.params);

  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Access denied." });
    }
    const freelancerId = req.user._id;
    // fetch proposals submitted by this freelancer, populate job details if you want
    const proposals = await Proposal.find({ freelancerId }).populate(
      "jobId",
      "title"
    );
    res.json(proposals);
  } catch (error) {
    console.error("Error fetching freelancer proposals:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const deleteProposalById = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Find the proposal
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found." });
    }

    // Check if the logged-in user is the owner of this proposal
    if (proposal.freelancerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this proposal." });
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
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

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
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    proposal.status = "rejected";
    await proposal.save();

    res.json({ message: "Proposal rejected successfully" });
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
