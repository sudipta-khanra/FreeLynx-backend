import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import freelancerRoutes from './routes/freelanceUserRoutes.js';
import userRoutes from './routes/userRoutes.js';
import path from 'path';
const app = express();

dotenv.config();

// Serve uploads folder statically
app.use('/uploads', express.static(path.resolve('uploads')));


// Middleware
// app.use(cors());
const corsOptions = {
  origin: 'http://localhost:5173',  // your frontend URL
  credentials: true,                 // allow cookies/auth headers
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes); // This covers GET /api/proposals/:jobId and other proposal endpoints
app.use('/api/jobs', jobRoutes);

app.use('/api/users', userRoutes);

app.use('/api/freelancers', freelancerRoutes);
// Connect to DB
connectDB();
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
