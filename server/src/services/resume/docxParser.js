const mammoth = require('mammoth');
const { normalizeText } = require('../../utils/textNormalizer');

/**
 * Converts Mammoth HTML output into structurally preserved text,
 * transforming tables, list items, headers, and paragraphs into readable text lines.
 *
 * @param {string} html
 * @returns {string} Text with preserved structure
 */
const htmlToStructuredText = (html) => {
  if (!html) return '';

  return html
    // Handle table rows: wrap cells in tabs or spaces, rows in newlines
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<\/tr>/gi, '')
    .replace(/<th[^>]*>(.*?)<\/th>/gi, ' $1 |')
    .replace(/<td[^>]*>(.*?)<\/td>/gi, ' $1 |')
    // Handle lists
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n• $1')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
    // Handle headings & paragraphs
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1')
    .replace(/<br\s*\/?>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
};

/**
 * Extracts structurally intact text from a DOCX file buffer.
 * Preserves table structures, section headings, and bullet points.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, rawText: string, normalizedText: string, charCount: number, lineCount: number, parserVersion: string, warnings: any[] }>}
 */
const parseDocx = async (buffer) => {
  try {
    let rawText = '';
    let structuredText = '';
    let messages = [];

    // Attempt 1: HTML conversion to preserve tables and formatting
    try {
      const htmlResult = await mammoth.convertToHtml({ buffer });
      structuredText = htmlToStructuredText(htmlResult.value);
      messages = htmlResult.messages || [];
    } catch (htmlErr) {
      console.warn('DOCX HTML extraction warning:', htmlErr.message);
    }

    // Attempt 2: Extract raw text as fallback or rawText capture
    try {
      const rawResult = await mammoth.extractRawText({ buffer });
      rawText = rawResult.value || '';
      if (!messages.length && rawResult.messages) {
        messages = rawResult.messages;
      }
    } catch (rawErr) {
      console.warn('DOCX raw text extraction warning:', rawErr.message);
    }

    const primaryText = structuredText && structuredText.trim().length >= 20 ? structuredText : rawText;
    const normalized = normalizeText(primaryText);

    if (!normalized || normalized.length < 15) {
      throw new Error('Extracted DOCX text is too short or unreadable.');
    }

    const lines = normalized.split('\n').filter(Boolean);

    return {
      text: normalized, // Backward compatibility
      rawText: rawText || primaryText,
      normalizedText: normalized,
      charCount: normalized.length,
      lineCount: lines.length,
      parserVersion: '2.0',
      warnings: messages
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    const err = new Error(error.message || 'Failed to parse DOCX document');
    err.code = 'DOCX_EXTRACTION_FAILURE';
    throw err;
  }
};

module.exports = { parseDocx };
