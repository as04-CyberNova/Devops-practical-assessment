/**
 * In-memory Feedback Data Store with duplicate prevention & student credentials.
 */
let feedbackList = [
  {
    id: "fb-101",
    studentName: "Alex Rivera",
    rollNumber: "2024-CS-101",
    email: "alex.rivera@niet.co.in",
    course: "DevOps & Cloud Engineering",
    rating: 5,
    category: "Course Content",
    feedback: "The hands-on Docker and CI/CD labs were incredible! Learned how to automate build and deployment pipelines smoothly.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "fb-102",
    studentName: "Sophia Chen",
    rollNumber: "2024-SE-204",
    email: "sophia.chen@niet.co.in",
    course: "Full Stack Web Development",
    rating: 4,
    category: "Teaching Quality",
    feedback: "Great explanations on async Javascript and Express microservices. Would love more live coding sessions on state management.",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "fb-103",
    studentName: "Marcus Johnson",
    rollNumber: "2024-DS-309",
    email: "marcus.j@niet.co.in",
    course: "Data Science & AI Foundations",
    rating: 5,
    category: "Assignments & Support",
    feedback: "Outstanding course structure. The mentor feedback on Python data visualization projects was quick and super detailed!",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

const getFeedbacks = () => [...feedbackList];

const findDuplicate = (studentName, rollNumber, email, course) => {
  const normName = studentName.trim().toLowerCase();
  const normRoll = rollNumber.trim().toLowerCase();
  const normEmail = email.trim().toLowerCase();
  const normCourse = course.trim().toLowerCase();

  return feedbackList.find(f => 
    f.course.toLowerCase() === normCourse &&
    (f.studentName.toLowerCase() === normName ||
     f.rollNumber.toLowerCase() === normRoll ||
     f.email.toLowerCase() === normEmail)
  );
};

const addFeedback = (data) => {
  const newFeedback = {
    id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    studentName: data.studentName.trim(),
    rollNumber: data.rollNumber.trim().toUpperCase(),
    email: data.email.trim().toLowerCase(),
    course: data.course.trim(),
    rating: Number(data.rating) || 5,
    category: data.category || "General",
    feedback: data.feedback.trim(),
    createdAt: new Date().toISOString()
  };
  feedbackList.unshift(newFeedback);
  return newFeedback;
};

const getStats = () => {
  const total = feedbackList.length;
  if (total === 0) {
    return { total: 0, avgRating: "0.0", courseCount: 0, ratingDistribution: {} };
  }

  const sumRating = feedbackList.reduce((acc, item) => acc + item.rating, 0);
  const avgRating = (sumRating / total).toFixed(1);
  const courses = new Set(feedbackList.map(item => item.course));
  
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbackList.forEach(item => {
    if (ratingDistribution[item.rating] !== undefined) {
      ratingDistribution[item.rating]++;
    }
  });

  return {
    total,
    avgRating,
    courseCount: courses.size,
    ratingDistribution
  };
};

const resetStore = () => {
  feedbackList = [];
};

module.exports = {
  getFeedbacks,
  findDuplicate,
  addFeedback,
  getStats,
  resetStore
};
