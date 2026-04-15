const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, statisticsController.getStatistics);
router.get('/sales-trend', authMiddleware, statisticsController.getSalesTrend);

module.exports = router;
