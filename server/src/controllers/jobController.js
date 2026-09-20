const Job = require('../models/Job');
const { parseJobDescription } = require('../services/job/jobParser');

// @desc    Create and parse a new job description
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res, next) => {
  try {
    const { title, company, location, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Job title and description are required',
        code: 'VALIDATION_ERROR'
      });
    }

    const parsedData = parseJobDescription(description);

    const job = await Job.create({
      userId: req.user._id,
      title: title.trim(),
      company: company?.trim() || '',
      location: location?.trim() || '',
      description: description.trim(),
      parsedData
    });

    res.status(201).json({
      success: true,
      message: 'Job description saved and parsed successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for current user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ userId: req.user._id })
      .select('-description') // Omit huge raw description in listing
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this job',
        code: 'FORBIDDEN'
      });
    }

    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job description
// @route   PATCH /api/jobs/:id
// @access  Private
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    const { title, company, location, description } = req.body;
    if (title) job.title = title.trim();
    if (company !== undefined) job.company = company.trim();
    if (location !== undefined) job.location = location.trim();

    if (description && description.trim() !== job.description) {
      job.description = description.trim();
      job.parsedData = parseJobDescription(job.description);
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    await Job.deleteOne({ _id: job._id });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
};
