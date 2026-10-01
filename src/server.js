const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EduPulse Student Feedback Service is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = server;
