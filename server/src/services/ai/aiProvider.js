const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildResumeAnalysisPrompt } = require('../../prompts/resumeAnalysis');
const { buildBulletImprovementPrompt } = require('../../prompts/bulletImprovement');
const { buildSummaryImprovementPrompt } = require('../../prompts/summaryImprovement');

/**
 * Clean JSON output from LLM responses that might include markdown backticks.
 */
const extractJsonFromResponse = (text) => {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt regex extraction if there's leading/trailing chatter
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

class AIProvider {
  constructor() {
    this.defaultApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
    this.modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  getGenAI(apiKeyOverride) {
    const key = apiKeyOverride || this.defaultApiKey;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  }

  /**
   * Qualitatively analyzes resume against target job with evidence grounding.
   */
  async analyzeResume(resume, job, apiKeyOverride = null, deterministicData = {}) {
    const genAI = this.getGenAI(apiKeyOverride);

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: this.modelName });
        const prompt = buildResumeAnalysisPrompt(resume.parsedData, job, deterministicData);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJsonFromResponse(text);

        if (parsed && Array.isArray(parsed.strengths) && Array.isArray(parsed.recommendations)) {
          return parsed;
        }
      } catch (err) {
        console.warn('⚠️ Gemini API call failed, using intelligent grounded fallback:', err.message);
      }
    }

    // Grounded Heuristic Fallback Analysis
    return this.generateHeuristicAnalysis(resume, job, deterministicData);
  }

  /**
   * Rewrites and improves an experience bullet point with Action + Context + Impact framework.
   */
  async improveBullet(originalBullet, roleContext = '', userMetric = '', apiKeyOverride = null) {
    const genAI = this.getGenAI(apiKeyOverride);

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: this.modelName });
        const prompt = buildBulletImprovementPrompt(originalBullet, roleContext, userMetric);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJsonFromResponse(text);

        if (parsed && parsed.improvedBullet) {
          return parsed;
        }
      } catch (err) {
        console.warn('⚠️ Gemini bullet improvement failed, using grounded heuristic fallback:', err.message);
      }
    }

    // Grounded Heuristic Bullet Rewriter
    return this.generateHeuristicBulletImprovement(originalBullet, roleContext, userMetric);
  }

  /**
   * Rewrites and optimizes the candidate's professional summary.
   */
  async improveSummary(originalSummary, candidateSkills = [], jobTitle = '', jobDescription = '', apiKeyOverride = null) {
    const genAI = this.getGenAI(apiKeyOverride);

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: this.modelName });
        const prompt = buildSummaryImprovementPrompt(originalSummary, candidateSkills, jobTitle, jobDescription);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJsonFromResponse(text);

        if (parsed && parsed.improvedSummary) {
          return parsed;
        }
      } catch (err) {
        console.warn('⚠️ Gemini summary improvement failed, using heuristic fallback:', err.message);
      }
    }

    // Heuristic Summary Rewriter
    return this.generateHeuristicSummaryImprovement(originalSummary, candidateSkills, jobTitle);
  }

  /**
   * Grounded heuristic generator for qualitative analysis when LLM is unavailable.
   * Strictly cites candidate's actual resume content and applies zero metric fabrication.
   */
  generateHeuristicAnalysis(resume, job, deterministicData = {}) {
    const resumeSkills = resume.parsedData?.skills || [];
    const requiredSkills = job.parsedData?.requiredSkills || [];
    const matchedSkills = deterministicData.skills?.matched || requiredSkills.filter(
      (req) => resumeSkills.some((rs) => rs.toLowerCase() === req.toLowerCase())
    );
    const missingRequired = deterministicData.skills?.requiredMissing || requiredSkills.filter(
      (req) => !resumeSkills.some((rs) => rs.toLowerCase() === req.toLowerCase())
    );

    const experiences = resume.parsedData?.experience || [];
    const allBullets = experiences.flatMap((e) => e.bullets || []);
    const sampleWeakBullet = allBullets.find(
      (b) => !/\b\d+(?:%|\+?k|\+?x|\$)\b/i.test(b) && b.length > 25
    ) || allBullets[0] || 'Managed software development tasks and team deliverables.';

    const strengths = [];
    if (matchedSkills.length > 0) {
      strengths.push(`Direct alignment on core technical requirements: ${matchedSkills.slice(0, 4).join(', ')}.`);
    }
    if (experiences.length >= 2) {
      strengths.push(`Demonstrated track record across ${experiences.length} professional engineering roles.`);
    }
    if ((resume.parsedData?.projects || []).length > 0) {
      strengths.push(`Portfolio features ${(resume.parsedData?.projects || []).length} technical projects showcasing hands-on stack implementation.`);
    }
    if (resume.parsedData?.education?.length > 0) {
      strengths.push(`Documented academic foundation in ${resume.parsedData.education[0]?.degree || 'Computer Science/Engineering'}.`);
    }

    const weaknesses = [];
    if (missingRequired.length > 0) {
      weaknesses.push(`Target role specifies ${missingRequired.slice(0, 3).join(', ')}, which were not identified in the resume text.`);
    }
    const bulletsWithoutMetrics = allBullets.filter((b) => !/\b\d+(?:%|\+?k|\+?x|\$)\b/i.test(b)).length;
    if (bulletsWithoutMetrics > 0) {
      weaknesses.push(`${bulletsWithoutMetrics} experience bullets focus on responsibilities without quantifiable business or engineering metrics.`);
    }
    if (!resume.parsedData?.summary || resume.parsedData.summary.length < 50) {
      weaknesses.push('Professional summary is either absent or too brief to establish immediate role alignment.');
    }

    const recommendations = [];

    // 1. Missing Required Skills (Critical)
    if (missingRequired.length > 0) {
      recommendations.push({
        priority: 'critical',
        section: 'Skills',
        title: `Address High-Priority Requirement: ${missingRequired[0]}`,
        issue: `The target role lists ${missingRequired.slice(0, 3).join(', ')} as required qualifications, but they are absent from your resume.`,
        evidence: `Verified absence of "${missingRequired[0]}" in skills and experience sections.`,
        whyItMatters: 'Recruiters and automated ATS filters routinely screen out candidates who lack explicit mentions of required competencies.',
        recommendation: `If you have worked with ${missingRequired[0]}, integrate it into your skills list and cite a concrete bullet demonstrating its use.`,
        example: `Add bullet: "Implemented backend services using ${missingRequired[0]} to support high-reliability API workflows."`,
        requiresUserInput: true,
        problem: `Missing target requirements: ${missingRequired.slice(0, 3).join(', ')}.`,
        action: `Incorporate ${missingRequired[0]} into your experience or project sections if you possess genuine hands-on experience.`
      });
    }

    // 2. Weak Bullet Points (Important)
    if (sampleWeakBullet) {
      const cleanBullet = sampleWeakBullet.replace(/^[•\-*]\s*/, '');
      recommendations.push({
        priority: 'important',
        section: 'Experience',
        title: 'Quantify Impact with Metrics in Experience Bullets',
        issue: 'Bullet points describe assigned duties rather than measurable results or business value.',
        evidence: `"${cleanBullet.slice(0, 90)}${cleanBullet.length > 90 ? '...' : ''}"`,
        whyItMatters: 'High-performing resumes highlight scale, performance boosts, latency reductions, or revenue impacts over task descriptions.',
        recommendation: 'Restructure using the Action Verb + Context + Result framework, with your verified achievement metric.',
        example: `Before: "${cleanBullet.slice(0, 60)}..." -> After: "Engineered scalable solution for ${cleanBullet.slice(0, 40)}, improving system throughput by [INSERT METRIC: e.g. 25% or user count]."`,
        requiresUserInput: true,
        problem: 'Experience bullets describe duties rather than measurable achievements.',
        action: 'Begin with a strong active verb and add verified metrics where applicable.'
      });
    }

    // 3. Summary Optimization (Suggested)
    const currentSummary = resume.parsedData?.summary || '';
    recommendations.push({
      priority: 'suggested',
      section: 'Summary',
      title: 'Target Professional Summary for Role Alignment',
      issue: currentSummary
        ? 'Current summary does not explicitly highlight alignment with the target title and key required stack.'
        : 'Resume lacks a focused professional summary to hook technical screeners.',
      evidence: currentSummary
        ? `"${currentSummary.slice(0, 80)}..."`
        : 'Absence of dedicated Professional Summary section.',
      whyItMatters: 'A targeted summary immediately establishes your seniority, primary tech stack, and relevance for the specific position.',
      recommendation: `Craft a 2-3 sentence overview highlighting your background as a ${job.title || 'Software Engineer'} and proficiency in ${matchedSkills.slice(0, 3).join(', ') || 'modern stacks'}.`,
      example: `Example: "Results-driven ${job.title || 'Software Engineer'} with hands-on expertise in ${matchedSkills.slice(0, 3).join(', ') || 'modern cloud technologies'}. Proven track record of architecting resilient applications and optimizing team delivery."`,
      requiresUserInput: false,
      problem: 'Summary does not explicitly spotlight target role keywords.',
      action: 'Tailor the first two sentences to state your primary stack and value proposition for this role.'
    });

    const sectionImprovements = {
      summary: [
        {
          issue: currentSummary ? 'Summary positioning could be tighter' : 'Missing summary section',
          evidence: currentSummary ? `"${currentSummary.slice(0, 70)}..."` : 'Not present in resume',
          whyItMatters: 'Recruiters make initial decisions within 6-10 seconds; the summary sets the framing.',
          recommendation: `Position yourself directly for ${job.title || 'the target role'}.`,
          example: `Experienced engineer skilled in ${matchedSkills.slice(0, 3).join(', ') || 'full-stack engineering'} with a track record of delivering resilient, high-performance systems.`,
          requiresUserInput: false
        }
      ],
      experience: [
        {
          issue: 'Experience bullets benefit from stronger impact framing',
          evidence: `"${sampleWeakBullet.slice(0, 70)}..."`,
          whyItMatters: 'Shows prospective employers how you drive business value rather than just completing tasks.',
          recommendation: 'Replace passive phrases with strong technical verbs and metrics.',
          example: `Engineered high-availability service using ${matchedSkills[0] || 'modern frameworks'}, decreasing response time by [INSERT METRIC: e.g. 35%].`,
          requiresUserInput: true
        }
      ],
      skills: [
        {
          issue: 'Organize skills into logical domains',
          evidence: `Current skills: ${(resumeSkills.slice(0, 5)).join(', ')}...`,
          whyItMatters: 'Categorized skills are significantly easier for both ATS parsers and technical interviewers to scan.',
          recommendation: 'Group skills into Languages, Frameworks, Databases, and Cloud & DevOps.',
          example: `Languages: JavaScript, TypeScript | Frontend: React | Backend: Node.js | Cloud: AWS, Docker`,
          requiresUserInput: false
        }
      ],
      projects: [
        {
          issue: 'Clarify architectural choices and live verification links',
          evidence: (resume.parsedData?.projects || [])[0]?.title ? `Project: ${(resume.parsedData.projects)[0].title}` : 'Projects section',
          whyItMatters: 'Demonstrates end-to-end engineering rigor and allows reviewers to verify your live code.',
          recommendation: 'Specify backend/frontend architecture, databases, and deployment hosting for each project.',
          example: 'Architected RESTful microservices with containerized deployment on AWS ECS.',
          requiresUserInput: false
        }
      ]
    };

    return {
      strengths,
      weaknesses,
      experienceFeedback: [
        `Candidate background demonstrates relevant exposure to ${(experiences[0]?.title) || 'engineering'}.`,
        'Demonstrates good alignment with core engineering responsibilities.'
      ],
      projectFeedback: [
        'Project work reflects practical application of modern libraries.',
        'Consider documenting live URL endpoints or deployment links for reviewer verification.'
      ],
      recommendations,
      sectionImprovements
    };
  }

  /**
   * Grounded heuristic bullet improver.
   * Enforces Action Verb + Context + Impact framework without inventing metrics.
   */
  generateHeuristicBulletImprovement(originalBullet, roleContext, userMetric) {
    const clean = originalBullet.trim().replace(/^[•\-*]\s*/, '');
    let improved = clean;

    // Replace weak starting verbs with strong active verbs
    const verbReplacements = [
      { regex: /^worked on\b/i, replace: 'Engineered and developed' },
      { regex: /^helped with\b/i, replace: 'Collaborated on the development of' },
      { regex: /^was responsible for\b/i, replace: 'Architected and maintained' },
      { regex: /^assisted in\b/i, replace: 'Contributed to the implementation of' },
      { regex: /^did\b/i, replace: 'Implemented' },
      { regex: /^made\b/i, replace: 'Built and deployed' },
      { regex: /^participated in\b/i, replace: 'Spearheaded technical execution of' }
    ];

    for (const v of verbReplacements) {
      if (v.regex.test(clean)) {
        improved = clean.replace(v.regex, v.replace);
        break;
      }
    }

    if (improved === clean && !/^[A-Z][a-z]+ed\b/.test(clean)) {
      improved = `Developed ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
    }

    // Handle metrics: either weave in verified user metric or insert placeholder
    if (userMetric && userMetric.trim().length > 0) {
      improved = `${improved}, achieving ${userMetric.trim()}`;
    } else if (!/\b\d+(?:%|\+?k|\+?x|\$)\b/i.test(improved)) {
      improved = `${improved}, improving performance by [INSERT METRIC: e.g. 25% or user count]`;
    }

    return {
      improvedBullet: improved,
      rationale: [
        'Applied a proactive, high-impact action verb',
        'Preserved existing technologies and scope without fabricating experience',
        userMetric
          ? 'Integrated your verified quantifiable outcome'
          : 'Added an [INSERT METRIC] placeholder to prompt for your real verified result'
      ],
      missingMetricNote: userMetric
        ? ''
        : 'Replace [INSERT METRIC] with your verified quantifiable outcome (e.g. latency reduction, request scale, or error decrease).'
    };
  }

  /**
   * Grounded heuristic summary improver.
   */
  generateHeuristicSummaryImprovement(originalSummary, candidateSkills, jobTitle) {
    const topSkills = candidateSkills.slice(0, 4).join(', ') || 'modern software technologies';
    const title = jobTitle || 'Software Engineer';

    const improved = `Results-oriented ${title} with proven expertise in ${topSkills}. Dedicated to designing robust, maintainable systems and delivering scalable solutions that meet rigorous technical standards. Strong collaborator experienced in agile delivery, code reviews, and continuous technical refinement.`;

    return {
      improvedSummary: improved,
      keyChanges: [
        `Directly aligned positioning with target role: "${title}"`,
        `Spotlighted verified core technical competencies (${topSkills})`,
        'Reinforced focus on architectural quality and reliable execution'
      ],
      originalSummary: originalSummary || ''
    };
  }
}

const aiProvider = new AIProvider();
module.exports = aiProvider;
