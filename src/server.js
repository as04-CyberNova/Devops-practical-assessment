const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edupulse';

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info(`✅ Connected to MongoDB at ${MONGO_URI}`);
    const server = app.listen(PORT, () => {
      logger.info(`🚀 EduPulse Student Feedback Service is running!`);
      logger.info(`📡 URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });
