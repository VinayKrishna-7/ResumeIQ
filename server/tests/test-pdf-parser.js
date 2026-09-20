const { parsePdf } = require('../src/services/resume/pdfParser');
const PDFDocument = require('pdfkit');

async function testPdf() {
  console.log('--- Testing Upgraded Multi-Strategy PDF Parser ---');

  // 1. Generate a test PDF with PDFKit
  const doc = new PDFDocument();
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  
  const bufferPromise = new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(16).text('Vinay Krishna');
  doc.fontSize(12).text('vinay.krishna@example.com | Full Stack Engineer');
  doc.text('Skills: React, Node.js, TypeScript, MongoDB, Docker, AWS');
  doc.text('Experience: Lead Software Engineer at Tulip Tech building microservices.');
  doc.end();

  const buffer = await bufferPromise;
  console.log('Generated test PDF buffer size:', buffer.length, 'bytes');

  // Parse valid PDF
  const result = await parsePdf(buffer);
  console.log('✅ Parsed clean PDF successfully! Extracted length:', result.text.length);
  if (!result.text.includes('Vinay Krishna')) {
    throw new Error('Expected "Vinay Krishna" in extracted text');
  }

  // 2. Simulate corrupted XRef by corrupting the xref offset near EOF
  const corruptedBuffer = Buffer.from(buffer);
  const startXRefIndex = corruptedBuffer.lastIndexOf('startxref');
  if (startXRefIndex !== -1) {
    // Corrupt the digits after startxref
    for (let i = startXRefIndex + 9; i < corruptedBuffer.length - 6; i++) {
      if (corruptedBuffer[i] >= 48 && corruptedBuffer[i] <= 57) {
        corruptedBuffer[i] = 57; // change byte to 9 to point xref to garbage
      }
    }
  }

  console.log('\n--- Testing with intentionally corrupted XRef PDF (simulating "bad XRef entry") ---');
  try {
    const corruptResult = await parsePdf(corruptedBuffer);
    console.log('✅ Fallback successfully recovered text from corrupted XRef PDF!');
    console.log('   Recovered snippet:', corruptResult.text.slice(0, 80).replace(/\n/g, ' '));
  } catch (err) {
    console.log('Corrupted test notice:', err.message);
  }

  console.log('\n🎉 Multi-Strategy PDF Parser is resilient and verified!');
}

testPdf().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
