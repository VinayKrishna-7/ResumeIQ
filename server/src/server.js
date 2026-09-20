require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in dev
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ResumeIQ API is running healthy',
    timestamp: new Date().toISOString()
  });
});

// Route registration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/analyses', require('./routes/analysisRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server after database connection
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 ResumeIQ Server running on port ${PORT}`);
    console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });

  return server;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
