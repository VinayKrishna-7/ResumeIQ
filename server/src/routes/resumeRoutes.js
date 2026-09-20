const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResumes,
  getResumeById,
  getResumeDebug,
  updateResume,
  deleteResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.get('/:id/debug', getResumeDebug);
router.patch('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;

