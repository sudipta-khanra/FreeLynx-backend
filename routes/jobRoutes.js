import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMyJobs, createJob } from "../controllers/jobController.js";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/my", protect, getMyJobs);
router.post("/", protect, createJob);
// GET /api/jobs — Public or protected route to fetch all jobs
router.get("/", async (req, res) => {
  try {
    // Optional query params for filtering, pagination etc.
    const { page = 1, limit = 20, search = "" } = req.query;

    // Basic search example on job title
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const jobs = await Job.find(query)
      .populate("client", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // Sort newest first

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Fetch jobs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/jobs/:id — Protected Route to update a job
// router.get("/:id", protect, async (req, res) => {

//   try {

//     const job = await Job.findById(req.params.id).populate('postedBy', 'name');
//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }
//      res.json(job);
//   } catch (error) {
//     console.error("❌ Get job error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("client", "name");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("❌ Get job error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a job by ID
router.put("/:id", protect, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Optionally, verify the user is authorized to update this job
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // If you want to restrict update only to the job owner (client):
    if (job.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/jobs/:id — Protected Route
router.delete("/:id", protect, async (req, res) => {
  try {
    const jobId = req.params.id; // Extract the id string
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ✅ Ensure only the job creator can delete
    if (job.client.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("❌ Delete job error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
