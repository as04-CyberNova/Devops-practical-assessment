const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Define API routes
router.get('/feedback', feedbackController.getAllFeedbacks);
router.post('/feedback', feedbackController.createFeedback);
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router;
