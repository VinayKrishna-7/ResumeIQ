const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Resume name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters']
    },
    originalFilename: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx', 'text']
    },
    fileSize: {
      type: Number,
      required: true
    },
    extractedText: {
      type: String,
      required: true
    },
    rawText: {
      type: String,
      default: ''
    },
    normalizedText: {
      type: String,
      default: ''
    },
    extractionMetadata: {
      fileType: { type: String, default: '' },
      pageCount: { type: Number, default: 1 },
      charCount: { type: Number, default: 0 },
      lineCount: { type: Number, default: 0 },
      extractedAt: { type: Date, default: Date.now },
      parserVersion: { type: String, default: '2.0' }
    },
    parsedData: {
      personal: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        links: [{ type: String }]
      },
      summary: { type: String, default: '' },
      skills: [{ type: String }],
      experience: [
        {
          title: { type: String, default: '' },
          company: { type: String, default: '' },
          location: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          current: { type: Boolean, default: false },
          bullets: [{ type: String }]
        }
      ],
      education: [
        {
          degree: { type: String, default: '' },
          field: { type: String, default: '' },
          institution: { type: String, default: '' },
          graduationDate: { type: String, default: '' }
        }
      ],
      projects: [
        {
          title: { type: String, default: '' },
          technologies: [{ type: String }],
          description: { type: String, default: '' },
          bullets: [{ type: String }],
          link: { type: String, default: '' }
        }
      ],
      certifications: [{ type: String }],
      achievements: [{ type: String }],
      confidence: {
        type: Map,
        of: Number,
        default: {}
      },
      sources: {
        type: Map,
        of: String,
        default: {}
      }
    }
  },

  {
    timestamps: true
  }
);

// Compound index for user resumes sorted by recent
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
