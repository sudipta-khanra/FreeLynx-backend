import Job from "../models/Job.js";

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id });

    console.log("🔐 Authenticated User:", req.user);
    console.log("📦 Jobs found:", jobs.length);

    res.status(200).json(jobs);
  } catch (error) {
    console.error("❌ Failed to fetch jobs:", error.message);
    res.status(500).json({ message: "Server error" });
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
      deadline, // add deadline
      client: req.user._id, // use 'client' instead of 'createdBy'
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Failed to create job" });
  }
};
