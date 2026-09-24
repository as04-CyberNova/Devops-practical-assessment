const feedbackStore = require('../models/feedbackStore');

/**
 * Controller for handling Student Feedback endpoints
 */

// Email regex pattern for valid email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/feedback - Retrieve list of all feedbacks with optional filtering
exports.getAllFeedbacks = (req, res) => {
  try {
    let feedbacks = feedbackStore.getFeedbacks();
    const { course, search, minRating } = req.query;

    if (course) {
      feedbacks = feedbacks.filter(f => f.course.toLowerCase() === course.toLowerCase());
    }

    if (minRating) {
      const min = Number(minRating);
      feedbacks = feedbacks.filter(f => f.rating >= min);
    }

    if (search) {
      const q = search.toLowerCase();
      feedbacks = feedbacks.filter(
        f => f.studentName.toLowerCase().includes(q) ||
             f.rollNumber.toLowerCase().includes(q) ||
             f.email.toLowerCase().includes(q) ||
             f.feedback.toLowerCase().includes(q) ||
             f.course.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /api/feedback - Submit new feedback
exports.createFeedback = (req, res) => {
  try {
    const { studentName, rollNumber, email, course, rating, feedback, category } = req.body;

    // Validation
    if (!studentName || !rollNumber || !email || !course || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided: studentName, rollNumber, email, course, and feedback'
      });
    }

    if (studentName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Student name must be at least 2 characters long'
      });
    }

    if (rollNumber.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid official Roll Number'
      });
    }

    if (!email.trim().toLowerCase().endsWith('.niet.co.in') && !email.trim().toLowerCase().endsWith('@niet.co.in')) {
      return res.status(400).json({
        success: false,
        message: 'Only official @niet.co.in email addresses are allowed.'
      });
    }

    if (feedback.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Feedback comment must be at least 5 characters long'
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }

    // Duplicate Check Rule
    const existing = feedbackStore.findDuplicate(studentName, rollNumber, email, course);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Duplicate submission rejected: A feedback has already been submitted for student '${studentName.trim()}' (Roll: ${rollNumber.trim().toUpperCase()}) in the course '${course.trim()}'. Duplicate submissions are not allowed.`
      });
    }

    const created = feedbackStore.addFeedback({
      studentName,
      rollNumber,
      email,
      course,
      rating: numRating,
      category,
      feedback
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: created
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /api/stats - Retrieve feedback aggregated analytics
exports.getFeedbackStats = (req, res) => {
  try {
    const stats = feedbackStore.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
