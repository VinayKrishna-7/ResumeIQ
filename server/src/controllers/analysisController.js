const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { runDeterministicScoring } = require('../services/scoring/overallScorer');
const aiProvider = require('../services/ai/aiProvider');
const { parseJobDescription } = require('../services/job/jobParser');
const { generatePdfReport } = require('../services/report/pdfReportGenerator');

// @desc    Run full analysis on a resume and job
// @route   POST /api/analyses
// @access  Private
const createAnalysis = async (req, res, next) => {
  try {
    const { resumeId, jobId, targetJobDescription, targetJobTitle, targetJobCompany } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a resume to analyze',
        code: 'RESUME_REQUIRED'
      });
    }

    const resume = await Resume.findById(resumeId);
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
        message: 'Forbidden: You do not own this resume',
        code: 'FORBIDDEN'
      });
    }

    let job;
    if (jobId) {
      job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
          code: 'JOB_NOT_FOUND'
        });
      }
      if (job.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this job',
          code: 'FORBIDDEN'
        });
      }
    } else if (targetJobDescription && targetJobDescription.trim().length > 0) {
      // Auto-save pasted job description (Section 16)
      const title = targetJobTitle?.trim() || 'Target Role';
      const company = targetJobCompany?.trim() || '';
      const parsedData = parseJobDescription(targetJobDescription);

      job = await Job.create({
        userId: req.user._id,
        title,
        company,
        description: targetJobDescription.trim(),
        parsedData
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a saved job ID or paste a job description',
        code: 'JOB_REQUIRED'
      });
    }

    // 1. Run Deterministic Scoring
    const scoringResult = runDeterministicScoring(resume, job);

    // 2. Run Qualitative AI Analysis with Grounding
    const apiKeyOverride = req.headers['x-user-gemini-key'] || null;
    const aiResult = await aiProvider.analyzeResume(resume, job, apiKeyOverride, scoringResult);

    // 3. Merge deterministic numeric scores with AI qualitative insights
    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobId: job._id,
      overallScore: scoringResult.overallScore,
      resumeHealthScore: scoringResult.resumeHealthScore,
      scores: scoringResult.scores,
      explanations: scoringResult.explanations,
      skills: scoringResult.skills,
      keywords: scoringResult.keywords,
      experience: {
        ...scoringResult.experience,
        feedback: aiResult.experienceFeedback || []
      },
      projects: scoringResult.projects,
      education: scoringResult.education,
      certifications: scoringResult.certifications,
      quality: scoringResult.quality,
      strengths: aiResult.strengths || [],
      weaknesses: aiResult.weaknesses || [],
      recommendations: aiResult.recommendations || [],
      sectionImprovements: aiResult.sectionImprovements || {
        summary: [],
        experience: [],
        skills: [],
        projects: [],
        education: [],
        certifications: [],
        formatting: []
      }
    });


    const populated = await Analysis.findById(analysis._id)
      .populate('resumeId', 'name originalFilename fileType fileSize')
      .populate('jobId', 'title company location');

    res.status(201).json({
      success: true,
      message: 'Analysis completed successfully',
      data: { analysis: populated }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all analyses for current user
// @route   GET /api/analyses
// @access  Private
const getAnalyses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const total = await Analysis.countDocuments({ userId: req.user._id });

    const analyses = await Analysis.find({ userId: req.user._id })
      .select('overallScore resumeHealthScore scores createdAt resumeId jobId')
      .populate('resumeId', 'name fileType')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single analysis by ID
// @route   GET /api/analyses/:id
// @access  Private
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('resumeId', 'name originalFilename fileType fileSize parsedData')
      .populate('jobId', 'title company location parsedData');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
        code: 'ANALYSIS_NOT_FOUND'
      });
    }

    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    res.status(200).json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete analysis
// @route   DELETE /api/analyses/:id
// @access  Private
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
        code: 'ANALYSIS_NOT_FOUND'
      });
    }

    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    await Analysis.deleteOne({ _id: analysis._id });

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare two resume versions against one job (Section 41)
// @route   POST /api/analyses/compare
// @access  Private
const compareResumes = async (req, res, next) => {
  try {
    const { resumeId1, resumeId2, jobId } = req.body;

    if (!resumeId1 || !resumeId2 || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both resume IDs and a job ID',
        code: 'VALIDATION_ERROR'
      });
    }

    const [resume1, resume2, job] = await Promise.all([
      Resume.findById(resumeId1),
      Resume.findById(resumeId2),
      Job.findById(jobId)
    ]);

    if (!resume1 || !resume2 || !job) {
      return res.status(404).json({
        success: false,
        message: 'One or more documents not found',
        code: 'NOT_FOUND'
      });
    }

    const score1 = runDeterministicScoring(resume1, job);
    const score2 = runDeterministicScoring(resume2, job);

    const differences = {
      scoreDiff: score2.overallScore - score1.overallScore,
      healthDiff: score2.resumeHealthScore - score1.resumeHealthScore,
      skillsOnlyInResume1: score1.skills.matched.filter((s) => !score2.skills.matched.includes(s)),
      skillsOnlyInResume2: score2.skills.matched.filter((s) => !score1.skills.matched.includes(s)),
      bulletQualityDiff: score2.experience.bulletQuality - score1.experience.bulletQuality
    };

    res.status(200).json({
      success: true,
      data: {
        resume1: {
          id: resume1._id,
          name: resume1.name,
          overallScore: score1.overallScore,
          resumeHealthScore: score1.resumeHealthScore,
          scores: score1.scores,
          matchedSkills: score1.skills.matched
        },
        resume2: {
          id: resume2._id,
          name: resume2.name,
          overallScore: score2.overallScore,
          resumeHealthScore: score2.resumeHealthScore,
          scores: score2.scores,
          matchedSkills: score2.skills.matched
        },
        differences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF report
// @route   GET /api/analyses/:id/report
// @access  Private
const downloadReport = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('resumeId', 'name originalFilename')
      .populate('jobId', 'title company location');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
        code: 'ANALYSIS_NOT_FOUND'
      });
    }

    if (analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }

    const filename = `ResumeIQ-Report-${(analysis.jobId?.title || 'Job').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generatePdfReport(analysis, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Seed Demo data for instant exploration (Section 64 & 65)
// @route   POST /api/analyses/seed-demo
// @access  Public
const seedDemoData = async (req, res, next) => {
  try {
    let demoUser = await User.findOne({ email: 'demo@resumeiq.ai' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('demo123456', salt);
      demoUser = await User.create({
        name: 'Jordan Vance',
        email: 'demo@resumeiq.ai',
        passwordHash,
        targetRole: 'Senior Full Stack Engineer',
        experienceLevel: 'Senior Level',
        location: 'San Francisco, CA',
        website: 'https://jordanvance.dev',
        github: 'https://github.com/jordanvance-demo'
      });
    }

    // Create demo resume if not exists
    let demoResume = await Resume.findOne({ userId: demoUser._id, name: 'Senior Full Stack Resume' });
    if (!demoResume) {
      demoResume = await Resume.create({
        userId: demoUser._id,
        name: 'Senior Full Stack Resume',
        originalFilename: 'Jordan_Vance_FullStack_Resume.pdf',
        fileType: 'pdf',
        fileSize: 142050,
        extractedText: 'Senior Full Stack Engineer with 6 years experience in React, Node.js, TypeScript, PostgreSQL, MongoDB, Redis, and AWS Docker.',
        parsedData: {
          personal: {
            name: 'Jordan Vance',
            email: 'demo@resumeiq.ai',
            phone: '(555) 342-8901',
            location: 'San Francisco, CA',
            links: ['https://github.com/jordanvance-demo', 'https://linkedin.com/in/jordanvance-demo']
          },
          summary: 'High-performing Senior Full Stack Engineer with 6+ years designing scalable cloud architectures, reactive frontends, and RESTful microservices. Proven success leading agile feature squads and driving 99.9% uptime.',
          skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Express.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'RESTful APIs', 'Git', 'CI/CD'],
          experience: [
            {
              title: 'Senior Full Stack Developer',
              company: 'Veloce Cloud Solutions',
              startDate: '2021',
              endDate: 'Present',
              current: true,
              bullets: [
                'Architected high-throughput React & TypeScript dashboard managing 10M+ daily events.',
                'Engineered distributed Node.js microservices with PostgreSQL, decreasing P95 API latency by 42%.',
                'Spearheaded CI/CD pipelines with GitHub Actions and Docker, reducing release cycle duration from 4 days to 45 minutes.'
              ]
            },
            {
              title: 'Software Engineer',
              company: 'Nexus Digital',
              startDate: '2018',
              endDate: '2021',
              current: false,
              bullets: [
                'Built customer-facing web applications using React, Redux, and Tailwind CSS.',
                'Designed MongoDB data models and REST endpoints for multi-tenant SaaS application.'
              ]
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              institution: 'University of Washington',
              graduationDate: '2018'
            }
          ],
          projects: [
            {
              title: 'Distributed Event Broker',
              technologies: ['Node.js', 'TypeScript', 'Redis', 'Docker'],
              description: 'Lightweight distributed pub/sub broker.',
              bullets: [
                'Engineered memory-optimized event queue handling 50k msgs/sec.',
                'Containerized service with Docker for automated cluster deployment.'
              ],
              link: 'https://github.com/jordanvance-demo/event-broker'
            }
          ],
          certifications: ['AWS Certified Solutions Architect']
        }
      });
    }

    // Create demo job if not exists
    let demoJob = await Job.findOne({ userId: demoUser._id, title: 'Lead Full Stack Engineer' });
    if (!demoJob) {
      demoJob = await Job.create({
        userId: demoUser._id,
        title: 'Lead Full Stack Engineer',
        company: 'Apex Robotics & AI',
        location: 'San Francisco, CA (Hybrid)',
        description: `We are looking for a Lead Full Stack Engineer to spearhead our mission-critical telemetry platform.
Requirements:
- 5+ years building distributed web applications.
- Strong proficiency in React, TypeScript, Node.js, and RESTful APIs.
- Practical experience with PostgreSQL or MongoDB, and Redis caching.
- Experience with Docker and AWS cloud deployments.
Preferred Qualifications:
- Familiarity with Kubernetes, GraphQL, and microservice architectures.
- Bachelor's degree in Computer Science or related field.`,
        parsedData: {
          requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'RESTful APIs'],
          preferredSkills: ['Kubernetes', 'GraphQL', 'Microservices'],
          keywords: ['RESTful APIs', 'Microservices', 'Scalability', 'Distributed Systems', 'Cloud Architecture', 'CI/CD'],
          experienceYears: 5,
          educationRequirements: ["Bachelor's degree in Computer Science"],
          responsibilities: [
            'Lead the architectural design of full-stack telemetry applications',
            'Collaborate with product and AI teams to deliver high-reliability features'
          ],
          certifications: ['AWS']
        }
      });
    }

    // Create demo analysis if not exists
    let demoAnalysis = await Analysis.findOne({ userId: demoUser._id, resumeId: demoResume._id, jobId: demoJob._id });
    if (!demoAnalysis) {
      const scoring = runDeterministicScoring(demoResume, demoJob);
      const aiResult = aiProvider.generateHeuristicAnalysis(demoResume, demoJob);

      demoAnalysis = await Analysis.create({
        userId: demoUser._id,
        resumeId: demoResume._id,
        jobId: demoJob._id,
        overallScore: scoring.overallScore,
        resumeHealthScore: scoring.resumeHealthScore,
        scores: scoring.scores,
        skills: scoring.skills,
        keywords: scoring.keywords,
        experience: {
          ...scoring.experience,
          feedback: aiResult.experienceFeedback
        },
        projects: scoring.projects,
        education: scoring.education,
        certifications: scoring.certifications,
        quality: scoring.quality,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        recommendations: aiResult.recommendations,
        sectionImprovements: aiResult.sectionImprovements
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demo dataset seeded successfully',
      data: {
        demoUser: { email: 'demo@resumeiq.ai', password: 'demo123456' },
        resumeId: demoResume._id,
        jobId: demoJob._id,
        analysisId: demoAnalysis._id
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  compareResumes,
  downloadReport,
  seedDemoData
};
