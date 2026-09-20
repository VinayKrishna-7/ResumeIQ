const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    resumeHealthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    scores: {
      skills: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      quality: { type: Number, default: 0 }
    },

    explanations: {
      overall: { type: String, default: '' },
      skills: { type: String, default: '' },
      keywords: { type: String, default: '' },
      experience: { type: String, default: '' },
      projects: { type: String, default: '' },
      education: { type: String, default: '' },
      quality: { type: String, default: '' }
    },

    skills: {
      matched: [{ type: String }],
      missing: [{ type: String }],
      requiredMissing: [{ type: String }],
      preferredMissing: [{ type: String }]
    },

    keywords: {
      matched: [{ type: String }],
      missing: [{ type: String }],
      coverage: { type: Number, default: 0 },
      frequency: { type: Map, of: Number, default: {} }
    },

    experience: {
      score: { type: Number, default: 0 },
      candidateYears: { type: Number, default: 0 },
      requiredYears: { type: Number, default: 0 },
      strengths: [{ type: String }],
      gaps: [{ type: String }],
      feedback: [{ type: String }],
      bulletQuality: { type: Number, default: 0 },
      bulletEvaluations: [
        {
          bullet: String,
          qualityScore: Number,
          isStrongVerb: Boolean,
          hasMetric: Boolean,
          issues: [String]
        }
      ]
    },

    projects: [
      {
        title: String,
        overallScore: Number,
        relevance: Number,
        technicalDepth: Number,
        descriptionQuality: Number,
        impact: Number,
        technologies: [String],
        recommendations: [String]
      }
    ],

    education: {
      score: { type: Number, default: 0 },
      feedback: [{ type: String }]
    },

    certifications: {
      matched: [{ type: String }],
      missing: [{ type: String }]
    },

    quality: {
      checklist: {
        structure: { type: String, default: 'pass' },
        readability: { type: String, default: 'pass' },
        consistency: { type: String, default: 'pass' },
        bulletQuality: { type: String, default: 'pass' },
        summary: { type: String, default: 'pass' },
        contactInfo: { type: String, default: 'pass' }
      },
      issues: [{ type: String }]
    },

    strengths: [{ type: String }],
    weaknesses: [{ type: String }],

    recommendations: [
      {
        priority: { type: String, enum: ['critical', 'important', 'suggested', 'high', 'medium', 'low'], default: 'medium' },
        section: { type: String, default: 'General' },
        title: String,
        problem: String,
        action: String,
        issue: String,
        evidence: String,
        whyItMatters: String,
        recommendation: String,
        example: String,
        requiresUserInput: { type: Boolean, default: false }
      }
    ],

    sectionImprovements: {
      summary: [
        {
          issue: String,
          evidence: String,
          whyItMatters: String,
          recommendation: String,
          example: String,
          requiresUserInput: { type: Boolean, default: false }
        }
      ],
      experience: [
        {
          issue: String,
          evidence: String,
          whyItMatters: String,
          recommendation: String,
          example: String,
          requiresUserInput: { type: Boolean, default: false }
        }
      ],

      skills: [
        {
          issue: String,
          recommendation: String,
          example: String
        }
      ],
      projects: [
        {
          issue: String,
          recommendation: String,
          example: String
        }
      ],
      education: [
        {
          issue: String,
          recommendation: String,
          example: String
        }
      ],
      certifications: [
        {
          issue: String,
          recommendation: String,
          example: String
        }
      ],
      formatting: [
        {
          issue: String,
          recommendation: String,
          example: String
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, resumeId: 1, jobId: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
