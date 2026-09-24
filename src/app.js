const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint for containerization/K8s/CI probes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'EduPulse Student Feedback Portal',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', feedbackRoutes);

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

module.exports = app;
