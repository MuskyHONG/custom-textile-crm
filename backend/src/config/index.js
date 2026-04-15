require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/custom-fabric',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  taxRate: process.env.TAX_RATE || 0.13
};