const { calculateSkillScore } = require('./skillScorer');
const { calculateKeywordScore } = require('./keywordScorer');
const { calculateExperienceScore } = require('./experienceScorer');
const { calculateProjectScore } = require('./projectScorer');
const { calculateQualityScore } = require('./qualityScorer');

// Configurable ATS score weights
const DEFAULT_WEIGHTS = {
  skills: 0.30,
  keywords: 0.20,
  experience: 0.20,
  projects: 0.15,
  education: 0.05,
  quality: 0.10
};

/**
 * Calculates education match score.
 */
const calculateEducationScore = (educationEntries = [], jobEducationRequirements = []) => {
  if (!jobEducationRequirements || jobEducationRequirements.length === 0) {
    // If job does not specify degree, do not penalize candidate
    return {
      score: educationEntries.length > 0 ? 95 : 85,
      feedback: ['Job description does not require a specific degree.']
    };
  }

  if (educationEntries.length === 0) {
    return {
      score: 55,
      feedback: ['Target job requests formal degree, but no education section was found.']
    };
  }

  // Check degree keywords (e.g. bachelor, master, cs, engineering)
  const allEduText = educationEntries.map((e) => `${e.degree} ${e.field}`).join(' ').toLowerCase();
  let matched = false;

  jobEducationRequirements.forEach((req) => {
    if (allEduText.includes('bachelor') || allEduText.includes('master') || allEduText.includes('b.s.')) {
      matched = true;
    }
  });

  return {
    score: matched ? 95 : 75,
    feedback: matched
      ? ['Candidate education aligns with requested academic requirements.']
      : ['Degree field or level may differ slightly from preferred qualifications.']
  };
};

/**
 * Deterministic Engine Orchestrator
 * Computes all numeric scores without external LLM dependencies.
 *
 * @param {object} resume - Resume model document
 * @param {object} job - Job model document
 * @param {object} customWeights - Optional overrides for weights
 * @returns {object} Deterministic scoring package
 */
const runDeterministicScoring = (resume, job, customWeights = {}) => {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const parsedResume = resume.parsedData || {};
  const parsedJob = job.parsedData || {};

  // 1. Skill Score
  const skillResult = calculateSkillScore(
    parsedResume.skills || [],
    parsedJob.requiredSkills || [],
    parsedJob.preferredSkills || []
  );

  // 2. Keyword Score
  const keywordResult = calculateKeywordScore(
    resume.extractedText || '',
    parsedJob.keywords || []
  );

  // 3. Experience Score
  const experienceResult = calculateExperienceScore(
    parsedResume.experience || [],
    parsedJob.experienceYears || 0
  );

  // 4. Project Score
  const allJobSkills = [
    ...(parsedJob.requiredSkills || []),
    ...(parsedJob.preferredSkills || [])
  ];
  const projectResult = calculateProjectScore(
    parsedResume.projects || [],
    allJobSkills
  );

  // 5. Education Score
  const educationResult = calculateEducationScore(
    parsedResume.education || [],
    parsedJob.educationRequirements || []
  );

  // 6. Quality & Resume Health Score (Independent of job)
  const qualityResult = calculateQualityScore(
    parsedResume,
    resume.extractedText || ''
  );

  // 7. Overall Weighted Calculation
  const skillsScore = skillResult.score;
  const keywordScore = keywordResult.score;
  const experienceScore = experienceResult.score;
  const projectScore = projectResult.score;
  const educationScore = educationResult.score;
  const qualityScore = qualityResult.qualityScore;

  const rawOverall =
    skillsScore * weights.skills +
    keywordScore * weights.keywords +
    experienceScore * weights.experience +
    projectScore * weights.projects +
    educationScore * weights.education +
    qualityScore * weights.quality;

  const overallScore = Math.min(100, Math.max(0, Math.round(rawOverall)));

  const overallExplanation =
    overallScore >= 80
      ? `Strong overall match (${overallScore}/100). The candidate demonstrates solid alignment with core required skills (${skillsScore}%) and experience requirements (${experienceScore}%).`
      : overallScore >= 60
      ? `Moderate alignment (${overallScore}/100). Strengths in ${skillResult.matched.slice(0, 2).join(', ') || 'technical foundation'}, with actionable gaps in ${skillResult.requiredMissing.slice(0, 2).join(', ') || 'core requirements'}.`
      : `Substantial gap (${overallScore}/100). Target role requires specific skills (${skillResult.requiredMissing.slice(0, 3).join(', ') || 'core qualifications'}) that were not detected.`;

  const explanations = {
    overall: overallExplanation,
    skills: skillResult.explanation || `Skills match score: ${skillsScore}/100.`,
    keywords: keywordResult.explanation || `Domain keywords coverage: ${keywordScore}%.`,
    experience: experienceResult.explanation || `Experience score: ${experienceScore}/100.`,
    projects: `Evaluated ${projectResult.projectAnalyses?.length || 0} projects for relevance to target technologies (${projectScore}/100).`,
    education: (educationResult.feedback && educationResult.feedback[0]) || `Education alignment: ${educationScore}/100.`,
    quality: `Resume quality is ${qualityScore}/100 based on structure, verb strength, and formatting consistency.`
  };

  return {
    overallScore,
    resumeHealthScore: qualityResult.resumeHealthScore,
    scores: {
      skills: skillsScore,
      keywords: keywordScore,
      experience: experienceScore,
      projects: projectScore,
      education: educationScore,
      quality: qualityScore
    },
    explanations,
    skills: {
      matched: skillResult.matched,
      missing: skillResult.missing,
      requiredMissing: skillResult.requiredMissing,
      preferredMissing: skillResult.preferredMissing,
      categoryBreakdown: skillResult.categoryBreakdown || {}
    },
    keywords: {
      matched: keywordResult.matched,
      missing: keywordResult.missing,
      coverage: keywordResult.coverage,
      frequency: keywordResult.frequency
    },
    experience: {
      score: experienceScore,
      candidateYears: experienceResult.candidateYears,
      requiredYears: experienceResult.requiredYears,
      strengths: experienceResult.strengths,
      gaps: experienceResult.gaps,
      bulletQuality: experienceResult.bulletQuality,
      bulletEvaluations: experienceResult.bulletEvaluations
    },
    projects: projectResult.projectAnalyses,
    education: {
      score: educationScore,
      feedback: educationResult.feedback
    },
    certifications: {
      matched: (parsedResume.certifications || []).filter((c) =>
        (parsedJob.certifications || []).some((jc) => jc.toLowerCase().includes(c.toLowerCase()))
      ),
      missing: (parsedJob.certifications || []).filter((jc) =>
        !(parsedResume.certifications || []).some((c) => c.toLowerCase().includes(jc.toLowerCase()))
      )
    },
    quality: {
      checklist: qualityResult.checklist,
      issues: qualityResult.issues
    },
    weights
  };
};


module.exports = {
  runDeterministicScoring,
  DEFAULT_WEIGHTS,
  calculateEducationScore
};
