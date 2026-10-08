/**
 * Evaluates individual projects against target job skills and tech stack.
 * @param {object[]} projects
 * @param {string[]} jobSkills
 * @returns {object} Project scoring results
 */
const calculateProjectScore = (projects = [], jobSkills = []) => {
  if (!projects || projects.length === 0) {
    return {
      score: 50,
      projectAnalyses: []
    };
  }

  const normJobSkills = new Set(jobSkills.map((s) => s.toLowerCase()));

  const projectAnalyses = projects.map((proj) => {
    const projTechs = (proj.technologies || []).map((t) => t.toLowerCase());
    const matchedTechs = projTechs.filter((t) => normJobSkills.has(t));

    // Relevance: proportion of project tech matching job requirements
    let relevance = 60;
    if (jobSkills.length > 0 && projTechs.length > 0) {
      const matchRatio = matchedTechs.length / Math.min(projTechs.length, 5);
      if (matchRatio > 0) {
        relevance = Math.min(100, Math.round(60 + matchRatio * 40));
      } else {
        // Complementary modern engineering stack check
        const isModernFullStack = projTechs.some((t) =>
          /react|node|docker|redis|api|sql|mongo|python|typescript|aws|kubernetes/i.test(t)
        );
        relevance = isModernFullStack ? 70 : 55;
      }
    } else if (projTechs.length > 0) {
      relevance = 75;
    }

    // Technical Depth: check for architecture/backend/deployment/security terms
    const combinedText = `${proj.title} ${proj.description || ''} ${(proj.bullets || []).join(' ')}`.toLowerCase();
    let depthPoints = 50;
    if (/api|microservices|architecture|database|docker|cloud|aws|sql|nosql|system|scalab/i.test(combinedText)) depthPoints += 25;
    if (/testing|ci\/cd|pipeline|deployed|kubernetes|cache|redis|auth|rate limit|jwt|queue/i.test(combinedText)) depthPoints += 20;
    const technicalDepth = Math.min(95, depthPoints);

    // Description Quality: bullet count and length
    const bulletCount = (proj.bullets || []).length;
    let descQuality = 55;
    if (bulletCount >= 2) descQuality += 25;
    if (bulletCount >= 3) descQuality += 15;
    const descriptionQuality = Math.min(95, descQuality);

    // Impact: presence of results or deployment link
    let impactScore = 50;
    if (proj.link) impactScore += 20;
    if (/\b\d+(?:%|\+?k|\+?x|\$)\b|users|latency|scale|throughput/i.test(combinedText)) impactScore += 25;
    const impact = Math.min(95, impactScore);

    const overallProjScore = Math.round(
      relevance * 0.35 + technicalDepth * 0.30 + descriptionQuality * 0.20 + impact * 0.15
    );

    const recommendations = [];
    if (!proj.link) {
      recommendations.push('Include a live demo link or GitHub repository URL.');
    }
    if (bulletCount < 2) {
      recommendations.push('Add 2–3 structured bullet points detailing architecture, your exact contribution, and technologies.');
    }
    if (impact < 70) {
      recommendations.push('State verified outcomes or technical benchmarks if available (e.g. latency improvement, user scale).');
    }

    return {
      title: proj.title || 'Project',
      overallScore: overallProjScore,
      relevance,
      technicalDepth,
      descriptionQuality,
      impact,
      technologies: proj.technologies || [],
      recommendations
    };
  });

  const aggregateScore = Math.round(
    projectAnalyses.reduce((acc, p) => acc + p.overallScore, 0) / projectAnalyses.length
  );

  return {
    score: aggregateScore,
    projectAnalyses
  };
};

module.exports = { calculateProjectScore };
