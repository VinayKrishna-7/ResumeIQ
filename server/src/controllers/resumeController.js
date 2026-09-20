const Resume = require('../models/Resume');
const { parsePdf } = require('../services/resume/pdfParser');
const { parseDocx } = require('../services/resume/docxParser');
const { parseResume } = require('../services/resume/resumeParser');

// @desc    Upload and parse a new resume
// @route   POST /api/resumes
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX)',
        code: 'NO_FILE_UPLOADED'
      });
    }

    const file = req.file;
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    let parseResult = null;

    if (fileExt === 'pdf') {
      parseResult = await parsePdf(file.buffer);
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      parseResult = await parseDocx(file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Please upload a PDF or DOCX file.',
        code: 'INVALID_FILE_TYPE'
      });
    }

    const rawText = parseResult.rawText || parseResult.text || '';
    const normalizedText = parseResult.normalizedText || parseResult.text || '';

    const extractionMetadata = {
      fileType: fileExt === 'doc' ? 'docx' : fileExt,
      pageCount: parseResult.numPages || 1,
      charCount: parseResult.charCount || normalizedText.length,
      lineCount: parseResult.lineCount || normalizedText.split('\n').filter(Boolean).length,
      extractedAt: new Date(),
      parserVersion: parseResult.parserVersion || '2.0'
    };

    // Name defaults to uploaded filename without extension or user-supplied label
    const customName = req.body.name?.trim() || file.originalname.replace(/\.[^/.]+$/, '');
    const parsedData = parseResume(normalizedText, customName);

    const resume = await Resume.create({
      userId: req.user._id,
      name: customName,
      originalFilename: file.originalname,
      fileType: fileExt === 'doc' ? 'docx' : fileExt,
      fileSize: file.size,
      extractedText: normalizedText, // Backward compatibility
      rawText,
      normalizedText,
      extractionMetadata,
      parsedData
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: { resume }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get debug extraction & parsing diagnostics for a resume
// @route   GET /api/resumes/:id/debug
// @access  Private
const getResumeDebug = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
        code: 'RESUME_NOT_FOUND'
      });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resume',
        code: 'FORBIDDEN'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: resume._id,
        name: resume.name,
        originalFilename: resume.originalFilename,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        extractionMetadata: resume.extractionMetadata,
        rawText: resume.rawText || resume.extractedText,
        normalizedText: resume.normalizedText || resume.extractedText,
        confidence: resume.parsedData?.confidence || {},
        sources: resume.parsedData?.sources || {},
        parsedData: resume.parsedData
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText') // Omit full raw text from listing for speed
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { resumes }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
        code: 'RESUME_NOT_FOUND'
      });
    }

    // Strict ownership verification
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this resume',
        code: 'FORBIDDEN'
      });
    }

    res.status(200).json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume name or parsed data
// @route   PATCH /api/resumes/:id
// @access  Private
const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
        code: 'RESUME_NOT_FOUND'
      });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    if (req.body.name) {
      resume.name = req.body.name.trim();
    }
    if (req.body.parsedData) {
      resume.parsedData = { ...resume.parsedData, ...req.body.parsedData };
    }

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: { resume }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
        code: 'RESUME_NOT_FOUND'
      });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    await Resume.deleteOne({ _id: resume._id });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  getResumeDebug,
  updateResume,
  deleteResume
};

