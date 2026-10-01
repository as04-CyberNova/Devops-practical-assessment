const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  email: { type: String, required: true },
  course: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  category: { type: String, default: 'General' },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
