import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Proposal from '../models/Proposal.js';
import {
  submitProposal,
  getProposalsByJob,
  getProposalsByFreelancer,
  deleteProposalById,
  acceptProposal,
  rejectProposal,
} from '../controllers/proposalController.js';

const router = express.Router();

router.get('/all-populated', protect, async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title')
      .exec();

    const formattedProposals = proposals.map((p) => ({
      _id: p._id,
      jobPostId: p.jobId?._id || null,
      jobTitle: p.jobId?.title || 'Untitled',
      freelancerName: p.freelancerId?.name || 'Unknown',
      freelancerMail: p.freelancerId?.email || 'N/A',
      coverLetter: p.coverLetter,
      bidAmount: p.proposedBudget,
      timeline: p.timeline,
      status: p.status,
    }));

    res.json(formattedProposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', protect, submitProposal);

router.get('/:jobId', protect, getProposalsByJob);

router.get('/', protect, getProposalsByFreelancer);

router.delete('/:proposalId', protect, deleteProposalById);

router.post('/:proposalId/accept', protect, acceptProposal);
router.post('/:proposalId/reject', protect, rejectProposal);
export default router;
