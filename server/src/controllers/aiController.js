const aiProvider = require('../services/ai/aiProvider');

// @desc    Improve a resume bullet point
// @route   POST /api/ai/improve-bullet
// @access  Private
const improveBullet = async (req, res, next) => {
  try {
    const { bullet, roleContext, userMetric } = req.body;

    if (!bullet || typeof bullet !== 'string' || bullet.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Original bullet point text is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const apiKeyOverride = req.headers['x-user-gemini-key'] || null;

    const result = await aiProvider.improveBullet(
      bullet.trim(),
      roleContext || '',
      userMetric || '',
      apiKeyOverride
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Improve a professional summary
// @route   POST /api/ai/improve-summary
// @access  Private
const improveSummary = async (req, res, next) => {
  try {
    const { originalSummary, skills, jobTitle, jobDescription } = req.body;

    const apiKeyOverride = req.headers['x-user-gemini-key'] || null;

    const result = await aiProvider.improveSummary(
      originalSummary || '',
      skills || [],
      jobTitle || '',
      jobDescription || '',
      apiKeyOverride
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  improveBullet,
  improveSummary
};
