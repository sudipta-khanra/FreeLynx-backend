import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getAllJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';

const router = express.Router();

// Root routes (/api/jobs)
router.route('/').get(getAllJobs).post(protect, createJob);

// Specific routes
router.get('/my', protect, getMyJobs);

// ID based routes (/api/jobs/:id)
router
  .route('/:id')
  .get(protect, getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;
