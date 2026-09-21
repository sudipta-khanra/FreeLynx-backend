import Job from '../models/Job.js';

// Get logged-in client's jobs
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('❌ Failed to fetch my jobs:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new job
// controllers/jobController.js

export const createJob = async (req, res) => {
  try {
    const { title, description, budget, deadline, category } = req.body;

    // 🔑 Mongoose Validation Error রোধ করতে client ফিল্ডে req.user._id দিতে হবে
    const job = await Job.create({
      title,
      description,
      budget,
      deadline,
      category,
      client: req.user._id, // 👈 এই লাইনটি মিসিং থাকার কারণেই Render-এ 500 Error পাচ্ছিলেন
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all jobs (with search & pagination)
export const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    const jobs = await Job.find(query)
      .populate('client', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('❌ Fetch jobs error:', error);
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
    console.error('❌ Get job error:', error);
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

    // Owner check
    if (job.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
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
    if (job.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
