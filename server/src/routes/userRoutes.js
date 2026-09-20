const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/me', getUserProfile);
router.patch('/me', updateUserProfile);

module.exports = router;
