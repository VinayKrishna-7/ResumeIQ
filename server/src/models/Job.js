const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    parsedData: {
      requiredSkills: [{ type: String }],
      preferredSkills: [{ type: String }],
      keywords: [{ type: String }],
      responsibilities: [{ type: String }],
      experienceYears: { type: Number, default: 0 },
      educationRequirements: [{ type: String }],
      certifications: [{ type: String }]
    }
  },
  {
    timestamps: true
  }
);

jobSchema.index({ userId: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
