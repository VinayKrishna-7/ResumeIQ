const { normalizeSkill, getSkillCategory } = require('../../utils/skillDictionary');

/**
 * Calculates deterministic skill match score, categorization, and data-driven explanations.
 *
 * @param {string[]} resumeSkills
 * @param {string[]} requiredSkills
 * @param {string[]} preferredSkills
 * @returns {object} Detailed skill scoring package
 */
const calculateSkillScore = (resumeSkills = [], requiredSkills = [], preferredSkills = []) => {
  const normResumeSkills = new Set(
    resumeSkills.map((s) => normalizeSkill(s).toLowerCase()).filter(Boolean)
  );

  const matched = [];
  const requiredMissing = [];
  const preferredMissing = [];

  // 1. Evaluate Required Skills
  requiredSkills.forEach((reqSkill) => {
    const canonical = normalizeSkill(reqSkill);
    if (!canonical) return;

    if (normResumeSkills.has(canonical.toLowerCase())) {
      if (!matched.includes(canonical)) matched.push(canonical);
    } else {
      if (!requiredMissing.includes(canonical)) requiredMissing.push(canonical);
    }
  });

  // 2. Evaluate Preferred Skills
  preferredSkills.forEach((prefSkill) => {
    const canonical = normalizeSkill(prefSkill);
    if (!canonical) return;

    if (normResumeSkills.has(canonical.toLowerCase())) {
      if (!matched.includes(canonical)) matched.push(canonical);
    } else {
      if (!preferredMissing.includes(canonical)) preferredMissing.push(canonical);
    }
  });

  // 3. Weighted Score Calculation
  const totalRequired = requiredSkills.length;
  const totalPreferred = preferredSkills.length;
  const matchedRequiredCount = totalRequired - requiredMissing.length;
  const matchedPreferredCount = totalPreferred - preferredMissing.length;

  let score = 100;

  if (totalRequired > 0 && totalPreferred > 0) {
    const reqRatio = matchedRequiredCount / totalRequired;
    const prefRatio = matchedPreferredCount / totalPreferred;
    // 80% weight on required, 20% weight on preferred
    score = Math.round((reqRatio * 0.80 + prefRatio * 0.20) * 100);
  } else if (totalRequired > 0) {
    const reqRatio = matchedRequiredCount / totalRequired;
    score = Math.round(reqRatio * 100);
  } else if (totalPreferred > 0) {
    const prefRatio = matchedPreferredCount / totalPreferred;
    score = Math.round(prefRatio * 100);
  } else {
    // If job specified no skills
    score = resumeSkills.length > 0 ? 85 : 55;
  }

  const missing = Array.from(new Set([...requiredMissing, ...preferredMissing]));

  // 4. Categorized Breakdown
  const categoryBreakdown = {};
  matched.forEach((skill) => {
    const cat = getSkillCategory(skill);
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { matched: [], missing: [] };
    categoryBreakdown[cat].matched.push(skill);
  });
  missing.forEach((skill) => {
    const cat = getSkillCategory(skill);
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { matched: [], missing: [] };
    categoryBreakdown[cat].missing.push(skill);
  });

  // 5. Data-Driven Explanation
  let explanation = '';
  if (totalRequired > 0 && totalPreferred > 0) {
    const reqPct = Math.round((matchedRequiredCount / totalRequired) * 100);
    const prefPct = Math.round((matchedPreferredCount / totalPreferred) * 100);
    explanation = `You matched ${matchedRequiredCount} of ${totalRequired} required skills (${reqPct}%) and ${matchedPreferredCount} of ${totalPreferred} preferred skills (${prefPct}%).`;
    if (requiredMissing.length > 0) {
      explanation += ` High-priority missing skills: ${requiredMissing.slice(0, 3).join(', ')}.`;
    }
  } else if (totalRequired > 0) {
    const reqPct = Math.round((matchedRequiredCount / totalRequired) * 100);
    explanation = `You matched ${matchedRequiredCount} of ${totalRequired} required skills (${reqPct}%).`;
    if (requiredMissing.length > 0) {
      explanation += ` Key missing requirements: ${requiredMissing.slice(0, 3).join(', ')}.`;
    }
  } else {
    explanation = `Your resume contains ${resumeSkills.length} identified technical skills relevant to software development.`;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    matched: Array.from(new Set(matched)),
    missing,
    requiredMissing,
    preferredMissing,
    categoryBreakdown,
    explanation
  };
};

module.exports = { calculateSkillScore };
