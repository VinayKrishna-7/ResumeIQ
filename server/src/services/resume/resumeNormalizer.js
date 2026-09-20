const { parseResume } = require('./resumeParser');

/**
 * Backward-compatible normalizeResume that delegates to the two-stage resumeParser.
 * @param {string} rawText
 * @param {string} defaultName
 * @returns {object} Structured normalized resume
 */
const normalizeResume = (rawText, defaultName = '') => {
  return parseResume(rawText, defaultName);
};

module.exports = {
  normalizeResume,
  parseResume
};

