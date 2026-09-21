import Job from '../models/Job.js';

// Get logged-in client's jobs
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [{ client: req.user._id }, { postedBy: req.user._id }],
    }).sort({ createdAt: -1 });

    console.log('🔐 Authenticated User:', req.user._id);
    console.log('📦 Jobs found:', jobs.length);

    res.status(200).json(jobs);
  } catch (error) {
    console.error('❌ Failed to fetch jobs:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new job

// controllers/jobController.js

export const createJob = async (req, res) => {
  try {
    const { title, description, budget, category, deadline } = req.body;

    // 🔒 Auth verification
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // 🔑 Job creation with both postedBy and client
    const job = await Job.create({
      title,
      description,
      budget: Number(budget),
      category,
      deadline,
      postedBy: req.user._id, // 👈 এটি অত্যন্ত জরুরি (Schema failure আটকাবে)
      client: req.user._id, // 👈 client field set
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get all jobs (with search & pagination)
export const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    const jobs = await Job.find(query)
      .populate('client', 'name email')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('❌ Fetch jobs error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'client',
      'name email'
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('❌ Get job error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Job ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update job
export const updateJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Owner check (client বা postedBy এর সাথে ম্যাচ করা)
    const ownerId = job.client?.toString() || job.postedBy?.toString();
    if (ownerId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this job' });
    }

    // Security: client ও postedBy পরিবর্তন হওয়া আটকানো
    const { client, postedBy, ...updateData } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Job ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Owner check
    const ownerId = job.client?.toString() || job.postedBy?.toString();
    if (ownerId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('❌ Delete job error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Job ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
