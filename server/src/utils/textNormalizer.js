/**
 * High-fidelity text normalizer for ResumeIQ.
 * Preserves line breaks, standardizes bullets, repairs line-wrap hyphens,
 * and maintains structural boundaries for resume and JD parsing.
 */

/**
 * Normalizes raw extracted text from PDF/DOCX/text documents while preserving
 * line boundaries and document structure.
 *
 * @param {string} rawText
 * @returns {string} Clean, structurally preserved text
 */
const normalizeText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText
    // Standardize newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes and non-printable control characters, but preserve \t and \n
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Standardize unicode spaces (non-breaking spaces, zero-width spaces, en/em spaces)
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g, ' ')
    // Repair hyphenated word line breaks (e.g., "micro-\nservices" -> "microservices")
    .replace(/(\b[a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,}\b)/g, '$1$2')
    // Standardize common bullet characters into standard bullet symbol
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25CF\u25CB\u25AA\u25AB\uF0B7\u27A2\u279C\u25B8]/g, '• ')
    // Normalize quotes and dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-');

  // Process line by line to preserve layout and indentation
  const lines = text.split('\n');
  const cleanedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Trim trailing whitespace while preserving single leading space for indented bullets if needed
    line = line.replace(/[ \t]+$/, '');

    // Collapse multiple horizontal spaces into single space, but preserve tab or 4+ spaces as a separator
    line = line.replace(/[ \t]{4,}/g, '    ');
    line = line.replace(/ {2,3}/g, ' ');

    // Normalize bullet line prefixes (e.g., "- " or "* " to "• ")
    if (/^\s*[-*]\s+/.test(line)) {
      line = line.replace(/^\s*[-*]\s+/, '• ');
    }

    cleanedLines.push(line);
  }

  // Deduplicate excessive empty lines (maximum 2 consecutive newlines)
  const result = cleanedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return result;
};

/**
 * Extracts emails from normalized text.
 * @param {string} text
 * @returns {string[]}
 */
const extractEmails = (text) => {
  if (!text) return [];
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches ? Array.from(new Set(matches.map((e) => e.toLowerCase().trim()))) : [];
};

/**
 * Extracts phone numbers from normalized text.
 * @param {string} text
 * @returns {string[]}
 */
const extractPhones = (text) => {
  if (!text) return [];
  // Supports international formats, US formats, dots, dashes, parentheses
  const regex = /(?:\+?\d{1,3}[-.\s]*)?(?:\(?\d{2,4}\)?[-.\s]*)?\d{3,4}[-.\s]*\d{4}/g;
  const matches = text.match(regex);
  if (!matches) return [];
  return Array.from(
    new Set(
      matches
        .map((p) => p.trim())
        .filter((p) => {
          const digits = p.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 15;
        })
    )
  );
};

/**
 * Extracts external links (GitHub, LinkedIn, portfolios, URLs).
 * @param {string} text
 * @returns {string[]}
 */
const extractLinks = (text) => {
  if (!text) return [];
  const matches = text.match(
    /(?:https?:\/\/|www\.)[^\s,;"'<>]+|(?:github\.com|linkedin\.com\/in)\/[^\s,;"'<>]+/gi
  );
  if (!matches) return [];
  return Array.from(
    new Set(
      matches.map((l) => {
        let clean = l.replace(/[.,;)]+$/, '');
        return clean.startsWith('http') ? clean : `https://${clean}`;
      })
    )
  );
};

/**
 * Splits text into logical lines, stripping empty noise while tracking original line indices.
 * @param {string} text
 * @returns {string[]}
 */
const getStructuralLines = (text) => {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
};

module.exports = {
  normalizeText,
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
};
