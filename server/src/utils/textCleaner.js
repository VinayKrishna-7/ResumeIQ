const {
  normalizeText,
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
} = require('./textNormalizer');

/**
 * Backward-compatible wrapper for cleanExtractedText using the new high-fidelity normalizer.
 */
const cleanExtractedText = (rawText) => {
  return normalizeText(rawText);
};

module.exports = {
  cleanExtractedText,
  normalizeText,
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
};

