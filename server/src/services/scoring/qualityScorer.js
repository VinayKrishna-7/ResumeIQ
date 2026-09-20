/**
 * Evaluates Resume Health and Quality independently of specific job requirements.
 * @param {object} parsedData
 * @param {string} rawText
 * @returns {object} Quality score results and checklist
 */
const calculateQualityScore = (parsedData = {}, rawText = '') => {
  const checklist = {
    structure: 'pass',
    readability: 'pass',
    consistency: 'pass',
    bulletQuality: 'pass',
    summary: 'pass',
    contactInfo: 'pass'
  };

  const issues = [];
  let score = 100;

  // 1. Contact Info check
  const hasEmail = Boolean(parsedData.personal?.email);
  const hasPhone = Boolean(parsedData.personal?.phone);
  const hasLinks = Boolean(parsedData.personal?.links && parsedData.personal.links.length > 0);

  if (!hasEmail || !hasPhone) {
    checklist.contactInfo = 'warn';
    score -= 15;
    issues.push('Missing essential contact details (email or phone number).');
  } else if (!hasLinks) {
    score -= 5;
    issues.push('No GitHub, LinkedIn, or personal portfolio links detected.');
  }

  // 2. Summary check
  if (!parsedData.summary || parsedData.summary.trim().length === 0) {
    checklist.summary = 'warn';
    score -= 15;
    issues.push('Missing a dedicated professional summary section.');
  } else if (parsedData.summary.length < 50) {
    checklist.summary = 'warn';
    score -= 8;
    issues.push('Professional summary is brief and lacks positioning.');
  } else if (parsedData.summary.length > 600) {
    score -= 5;
    issues.push('Professional summary is excessively verbose (exceeds 4-5 sentences).');
  }

  // 3. Skills check
  const skillCount = parsedData.skills?.length || 0;
  if (skillCount === 0) {
    checklist.structure = 'warn';
    score -= 20;
    issues.push('No explicit skills section found.');
  } else if (skillCount < 5) {
    score -= 8;
    issues.push('Only a small number of technical skills are listed.');
  }

  // 4. Experience & Bullet Quality
  const expCount = parsedData.experience?.length || 0;
  const allBullets = (parsedData.experience || []).flatMap((e) => e.bullets || []);

  if (expCount === 0) {
    checklist.structure = 'warn';
    checklist.bulletQuality = 'warn';
    score -= 25;
    issues.push('No work experience section found.');
  } else if (allBullets.length === 0) {
    checklist.bulletQuality = 'warn';
    score -= 15;
    issues.push('Work experience roles lack detailed descriptive bullet points.');
  } else {
    // Check for metrics and action verbs across bullets
    const metricCount = allBullets.filter((b) => /\b\d+(?:%|\+?k|\+?x|\$)\b/i.test(b)).length;
    const metricRatio = metricCount / allBullets.length;

    if (metricRatio < 0.2) {
      checklist.bulletQuality = 'warn';
      score -= 10;
      issues.push('Most experience bullets lack quantifiable outcomes or measurable impact.');
    }

    const shortBullets = allBullets.filter((b) => b.length < 35).length;
    if (shortBullets > allBullets.length * 0.3) {
      checklist.readability = 'warn';
      score -= 8;
      issues.push('Several bullet points are too brief or lack technical specificity.');
    }
  }

  // 5. Structure & Readability (Check text length and section flow)
  if (rawText.length < 300) {
    checklist.readability = 'warn';
    checklist.structure = 'warn';
    score -= 25;
    issues.push('Resume content is sparse or could not be fully read.');
  } else if (rawText.length > 12000) {
    checklist.readability = 'warn';
    score -= 10;
    issues.push('Resume is excessively lengthy (likely exceeds 3-4 pages). Aim for 1-2 pages.');
  }

  const finalScore = Math.min(100, Math.max(30, score));

  return {
    resumeHealthScore: finalScore,
    qualityScore: finalScore,
    checklist,
    issues
  };
};

module.exports = { calculateQualityScore };
