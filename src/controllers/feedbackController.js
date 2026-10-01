const Feedback = require('../models/feedbackStore');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.getAllFeedbacks = async (req, res) => {
  try {
    const { course, search, minRating } = req.query;
    let query = {};

    if (course) query.course = new RegExp(`^${course}$`, 'i');
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (search) {
      const q = new RegExp(search, 'i');
      query.$or = [
        { studentName: q },
        { rollNumber: q },
        { email: q },
        { feedback: q },
        { course: q }
      ];
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { studentName, rollNumber, email, course, rating, feedback, category } = req.body;

    if (!studentName || !rollNumber || !email || !course || !feedback) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    const existing = await Feedback.findOne({
      course: new RegExp(`^${course}$`, 'i'),
      $or: [
        { studentName: new RegExp(`^${studentName}$`, 'i') },
        { rollNumber: new RegExp(`^${rollNumber}$`, 'i') },
        { email: new RegExp(`^${email}$`, 'i') }
      ]
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Duplicate submission rejected' });
    }

    const created = await Feedback.create({
      studentName, rollNumber, email, course, rating: numRating, category, feedback
    });

    return res.status(201).json({ success: true, message: 'Feedback submitted', data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    if (total === 0) {
      return res.status(200).json({ success: true, data: { total: 0, avgRating: "0.0", courseCount: 0, ratingDistribution: {} } });
    }

    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          courses: { $addToSet: "$course" }
        }
      }
    ]);

    const dist = await Feedback.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    dist.forEach(d => ratingDistribution[d._id] = d.count);

    return res.status(200).json({
      success: true,
      data: {
        total,
        avgRating: stats[0].avgRating.toFixed(1),
        courseCount: stats[0].courses.length,
        ratingDistribution
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
