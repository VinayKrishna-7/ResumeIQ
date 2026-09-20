/**
 * Calculates deterministic keyword coverage and frequency.
 * @param {string} resumeText
 * @param {string[]} jobKeywords
 * @returns {object} Keyword score results
 */
const calculateKeywordScore = (resumeText = '', jobKeywords = []) => {
  if (!jobKeywords || jobKeywords.length === 0) {
    return {
      score: 80,
      matched: [],
      missing: [],
      coverage: 80,
      frequency: {}
    };
  }

  const lowerText = ` ${resumeText.toLowerCase()} `;
  const matched = [];
  const missing = [];
  const frequency = {};

  jobKeywords.forEach((keyword) => {
    const kwLower = keyword.toLowerCase();
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);

    if (matches && matches.length > 0) {
      matched.push(keyword);
      frequency[keyword] = matches.length;
    } else {
      missing.push(keyword);
    }
  });

  const coverage = Math.round((matched.length / jobKeywords.length) * 100);

  const explanation = `Matched ${matched.length} of ${jobKeywords.length} core technical & domain keywords (${coverage}% coverage).${
    missing.length > 0 ? ` Recommended additions: ${missing.slice(0, 3).join(', ')}.` : ' Full keyword coverage achieved!'
  }`;

  return {
    score: coverage,
    matched,
    missing,
    coverage,
    frequency,
    explanation
  };
};

module.exports = { calculateKeywordScore };

