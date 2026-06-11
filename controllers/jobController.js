import Job from '../models/Job.js';

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });

    console.log('🔐 Authenticated User:', req.user);
    console.log('📦 Jobs found:', jobs.length);

    res.status(200).json(jobs);
  } catch (error) {
    console.error('❌ Failed to fetch jobs:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, description, budget, category, deadline } = req.body;

    const job = await Job.create({
      title,
      description,
      budget,
      category,
      deadline,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
};
