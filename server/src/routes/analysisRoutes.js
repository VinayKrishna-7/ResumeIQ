const express = require('express');
const router = express.Router();
const {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  compareResumes,
  downloadReport,
  seedDemoData
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');
const { analysisLimiter } = require('../middleware/rateLimit');

// Public seed demo route
router.post('/seed-demo', seedDemoData);

// Protected routes
router.use(protect);

router.post('/', analysisLimiter, createAnalysis);
router.get('/', getAnalyses);
router.post('/compare', compareResumes);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);
router.get('/:id/report', downloadReport);

module.exports = router;
