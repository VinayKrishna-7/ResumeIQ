const STRONG_ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'implemented', 'designed', 'orchestrated',
  'optimized', 'refactored', 'developed', 'deployed', 'automated', 'streamlined',
  'accelerated', 'established', 'integrated', 'built', 'authored', 'managed', 'led'
]);

const WEAK_VERBS = new Set([
  'worked', 'helped', 'assisted', 'participated', 'did', 'was responsible for',
  'handled', 'tried', 'involved in'
]);

/**
 * Analyzes a single bullet point.
 * @param {string} bullet
 * @returns {object} Bullet evaluation
 */
const evaluateBullet = (bullet) => {
  const clean = bullet.trim();
  const words = clean.toLowerCase().split(/\s+/);
  const firstWord = words[0]?.replace(/[^a-z]/g, '') || '';

  const isStrongVerb = STRONG_ACTION_VERBS.has(firstWord);
  const isWeakVerb = WEAK_VERBS.has(firstWord) || clean.toLowerCase().startsWith('responsible for');
  const hasMetric = /\b\d+(?:%|\+?k|\+?x|\+?ms|min|sec|hrs?|\$)\b|\b(?:increased|decreased|reduced|improved|boosted|grew)\s+by\s+\d+/i.test(clean);
  const isGoodLength = clean.length >= 45 && clean.length <= 250;

  let quality = 60;
  if (isStrongVerb) quality += 20;
  if (isWeakVerb) quality -= 25;
  if (hasMetric) quality += 20;
  if (isGoodLength) quality += 10;
  if (clean.length < 30) quality -= 20;

  quality = Math.min(100, Math.max(20, quality));

  const issues = [];
  if (isWeakVerb) issues.push('Begins with a passive or weak verb');
  if (!hasMetric) issues.push('Lacks measurable impact or verified metric');
  if (clean.length < 35) issues.push('Low technical specificity');

  return {
    bullet: clean,
    qualityScore: quality,
    isStrongVerb,
    hasMetric,
    issues
  };
};

/**
 * Calculates experience match score based on years, relevance, and bullet quality.
 * @param {object[]} experiences
 * @param {number} requiredYears
 * @returns {object} Experience scoring results
 */
const calculateExperienceScore = (experiences = [], requiredYears = 0) => {
  if (!experiences || experiences.length === 0) {
    return {
      score: 40,
      candidateYears: 0,
      requiredYears,
      strengths: [],
      gaps: ['No professional experience history detected in resume'],
      feedback: ['Add professional work experience entries with specific technical achievements'],
      bulletEvaluations: []
    };
  }

  // Estimate candidate years from dates
  let totalYears = 0;
  const currentYear = new Date().getFullYear();

  experiences.forEach((exp) => {
    const startMatch = exp.startDate?.match(/\b(19\d{2}|20\d{2})\b/);
    const endMatch = exp.endDate?.match(/\b(19\d{2}|20\d{2})\b/);

    const start = startMatch ? parseInt(startMatch[1], 10) : null;
    const end = exp.current ? currentYear : (endMatch ? parseInt(endMatch[1], 10) : null);

    if (start && end && end >= start) {
      totalYears += (end - start);
    } else {
      totalYears += 1; // Default 1 year per listed role if dates are approximate
    }
  });

  totalYears = Math.min(totalYears, 20); // Cap sanity check

  // Evaluate bullets
  const allBullets = experiences.flatMap((e) => e.bullets || []);
  const bulletEvaluations = allBullets.map(evaluateBullet);
  const avgBulletQuality = bulletEvaluations.length > 0
    ? Math.round(bulletEvaluations.reduce((acc, b) => acc + b.qualityScore, 0) / bulletEvaluations.length)
    : 65;

  // Years factor
  let yearsScore = 100;
  const strengths = [];
  const gaps = [];

  if (requiredYears > 0) {
    if (totalYears >= requiredYears) {
      yearsScore = 100;
      strengths.push(`Experience duration (~${totalYears} yrs) fulfills the requested requirement (${requiredYears} yrs).`);
    } else {
      const ratio = totalYears / requiredYears;
      yearsScore = Math.round(ratio * 85);
      gaps.push(`Target role requests ${requiredYears}+ years experience; resume demonstrates ~${totalYears} years.`);
    }
  } else {
    yearsScore = 90;
    strengths.push(`Solid professional background with ${experiences.length} distinct roles.`);
  }

  // Combine years alignment (50%) and bullet quality (50%)
  const score = Math.round(yearsScore * 0.5 + avgBulletQuality * 0.5);

  const bulletsWithMetrics = bulletEvaluations.filter((b) => b.hasMetric).length;
  if (bulletsWithMetrics > 0) {
    strengths.push(`Demonstrated measurable business and performance impacts across ${bulletsWithMetrics} bullet points.`);
  } else {
    gaps.push('Experience bullets generally lack quantifiable outcomes or performance metrics.');
  }

  let explanation = '';
  if (requiredYears > 0) {
    if (totalYears >= requiredYears) {
      explanation = `Candidate brings ~${totalYears} years of experience, exceeding the required ${requiredYears} years. Bullet point quality scored ${avgBulletQuality}/100 based on action verbs and outcomes.`;
    } else {
      explanation = `Target role requests ${requiredYears}+ years, while candidate profile shows ~${totalYears} years. Bullet point impact scored ${avgBulletQuality}/100.`;
    }
  } else {
    explanation = `Candidate profile demonstrates ~${totalYears} years across ${experiences.length} roles, with an average bullet quality score of ${avgBulletQuality}/100.`;
  }

  return {
    score: Math.min(100, Math.max(30, score)),
    candidateYears: totalYears,
    requiredYears,
    strengths,
    gaps,
    bulletQuality: avgBulletQuality,
    bulletEvaluations: bulletEvaluations.slice(0, 15),
    explanation
  };
};


module.exports = {
  calculateExperienceScore,
  evaluateBullet,
  STRONG_ACTION_VERBS,
  WEAK_VERBS
};
