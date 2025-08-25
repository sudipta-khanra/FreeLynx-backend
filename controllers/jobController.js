import Job from "../models/Job.js";

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate("postedBy", "name") // ✅ populate only the name field
      .populate("client", "name"); // optional if you want client name too

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

    // Create the job
    let job = await Job.create({
      title,
      description,
      budget,
      category,
      deadline,
      client: req.user._id,
      postedBy: req.user._id, // ✅ Add postedBy
    });

    // Populate the postedBy field
    job = await Job.findById(job._id).populate("postedBy", "name");

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Failed to create job" });
  }
};
