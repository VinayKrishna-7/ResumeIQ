const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
