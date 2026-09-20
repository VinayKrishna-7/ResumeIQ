const { extractText } = require('unpdf');
const pdfParse = require('pdf-parse');
const PDFParser = require('pdf2json');
const zlib = require('zlib');
const { normalizeText } = require('../../utils/textNormalizer');
const { cleanExtractedText } = require('../../utils/textCleaner');

/**
 * Fallback: Parse using pdf2json.
 */
const parseWithPdf2Json = (buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(null, 1);

      pdfParser.on('pdfParser_dataError', (errData) => {
        reject(new Error(errData?.parserError || 'pdf2json failed'));
      });

      pdfParser.on('pdfParser_dataReady', () => {
        try {
          const rawText = pdfParser.getRawTextContent();
          resolve(rawText || '');
        } catch (err) {
          reject(err);
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Fallback: Stream-level text extractor that parses PDF content streams directly.
 */
const extractRawPdfStreamText = (buffer) => {
  let fullText = '';
  const rawString = buffer.toString('latin1');

  // Match all PDF streams: stream ... endstream
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamRegex.exec(rawString)) !== null) {
    const streamData = Buffer.from(match[1], 'latin1');
    let decompressed = null;

    try {
      decompressed = zlib.inflateSync(streamData);
    } catch (e1) {
      try {
        decompressed = zlib.inflateRawSync(streamData);
      } catch (e2) {
        decompressed = streamData;
      }
    }

    if (decompressed) {
      const content = decompressed.toString('latin1');
      // Extract text inside parentheses from Tj or TJ operators
      const tjMatches = content.match(/\(([^)]+)\)\s*(?:Tj|'|")/g);
      if (tjMatches) {
        tjMatches.forEach((m) => {
          const text = m.replace(/\)\s*(?:Tj|'|")$/, '').replace(/^\(/, '').trim();
          if (text) fullText += text + ' ';
        });
        fullText += '\n';
      }

      const arrayTjMatches = content.match(/\[([\s\S]*?)\]\s*TJ/g);
      if (arrayTjMatches) {
        arrayTjMatches.forEach((m) => {
          const innerStrings = m.match(/\(([^)]*)\)/g);
          if (innerStrings) {
            const joined = innerStrings
              .map((s) => s.slice(1, -1))
              .join('')
              .trim();
            if (joined) fullText += joined + ' ';
          }
        });
        fullText += '\n';
      }
    }
  }

  if (fullText.trim().length >= 25) {
    return fullText;
  }

  // Printable ASCII fallback
  const printableBlocks = rawString.match(/[\x20-\x7E\s]{15,}/g);
  if (printableBlocks && printableBlocks.length > 0) {
    return printableBlocks
      .filter((b) => !b.includes('/Filter') && !b.includes('/Length') && !b.includes('endobj'))
      .join('\n');
  }

  return '';
};

/**
 * Multi-strategy robust PDF parser.
 * Handles modern PDF versions (1.7/2.0), complex XRef streams, and legacy formats.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, numPages: number, info: object }>}
 */
const parsePdf = async (buffer) => {
  let extractedText = '';
  let numPages = 1;
  let info = {};

  // Tier 1: Modern unpdf engine (bypasses legacy pdf.js bad XRef bugs)
  try {
    const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const unpdfResult = await extractText(uint8Array);

    if (unpdfResult && unpdfResult.text) {
      const joined = Array.isArray(unpdfResult.text)
        ? unpdfResult.text.join('\n\n')
        : String(unpdfResult.text);

      if (joined.trim().length >= 15) {
        extractedText = joined;
        numPages = unpdfResult.totalPages || 1;
      }
    }
  } catch (errTier1) {
    console.warn(`Tier 1 (unpdf) error: "${errTier1.message}". Falling back to secondary parsers...`);
  }

  // Tier 2: pdf-parse fallback
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length >= 15) {
        extractedText = data.text;
        numPages = data.numpages || 1;
        info = data.info || {};
      }
    } catch (errTier2) {
      console.warn(`Tier 2 (pdf-parse) error: "${errTier2.message}". Falling back to pdf2json...`);
    }
  }

  // Tier 3: pdf2json fallback
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const textFromPdf2Json = await parseWithPdf2Json(buffer);
      if (textFromPdf2Json && textFromPdf2Json.trim().length >= 15) {
        extractedText = decodeURIComponent(textFromPdf2Json);
      }
    } catch (errTier3) {
      console.warn(`Tier 3 (pdf2json) error: "${errTier3.message}". Falling back to stream extraction...`);
    }
  }

  // Tier 4: Direct stream decompression & operator parsing
  if (!extractedText || extractedText.trim().length < 15) {
    try {
      const streamText = extractRawPdfStreamText(buffer);
      if (streamText && streamText.trim().length >= 15) {
        extractedText = streamText;
      }
    } catch (errTier4) {
      console.warn(`Tier 4 (stream decoding) error: "${errTier4.message}".`);
    }
  }

  const normalized = normalizeText(extractedText);

  if (!normalized || normalized.length < 15) {
    const err = new Error(
      'Could not extract readable text from this PDF. The document may be an image-only scanned PDF or password protected.'
    );
    err.code = 'PDF_UNREADABLE';
    throw err;
  }

  const lines = normalized.split('\n').filter(Boolean);

  return {
    text: normalized, // Backward compatibility
    rawText: extractedText,
    normalizedText: normalized,
    numPages,
    charCount: normalized.length,
    lineCount: lines.length,
    parserVersion: '2.0',
    info
  };
};

module.exports = { parsePdf };

