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

router.route('/').get(getAllJobs).post(protect, createJob);

router.get('/my', protect, getMyJobs);

router
  .route('/:id')
  .get(protect, getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

export default router;
