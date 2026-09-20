const PDFDocument = require('pdfkit');

/**
 * Generates a clean, professional PDF analysis report.
 * @param {object} analysis - Populated analysis document
 * @param {stream.Writable} outputStream - Stream to pipe PDF into
 */
const generatePdfReport = (analysis, outputStream) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `ResumeIQ Report - ${analysis.jobId?.title || 'Job Analysis'}`,
      Author: 'ResumeIQ AI',
      Subject: 'Resume ATS Match & Quality Analysis'
    }
  });

  doc.pipe(outputStream);

  const primaryColor = '#4338ca'; // Indigo 700
  const darkTextColor = '#0f172a'; // Slate 900
  const lightTextColor = '#64748b'; // Slate 500
  const borderColor = '#e2e8f0'; // Slate 200

  // 1. Header Banner
  doc.rect(40, 40, 515, 60).fill('#f8fafc').stroke(borderColor);

  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('ResumeIQ', 55, 52);

  doc
    .fillColor(lightTextColor)
    .fontSize(9)
    .font('Helvetica')
    .text('ATS-Style Match & Resume Intelligence Report', 55, 76);

  const reportDate = new Date(analysis.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  doc
    .fillColor(lightTextColor)
    .fontSize(8)
    .font('Helvetica')
    .text(`Generated: ${reportDate}`, 430, 65, { align: 'right' });

  // 2. Target Job & Resume Details
  let currentY = 115;
  doc
    .fillColor(darkTextColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Evaluation Overview', 40, currentY);

  currentY += 18;
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Target Role: `, 40, currentY, { continued: true })
    .font('Helvetica-Bold')
    .text(`${analysis.jobId?.title || 'Target Job'} ${analysis.jobId?.company ? `at ${analysis.jobId.company}` : ''}`)
    .font('Helvetica')
    .text(`Candidate Resume: `, 40, currentY + 14, { continued: true })
    .font('Helvetica-Bold')
    .text(`${analysis.resumeId?.name || 'Resume'}`);

  // 3. Score Badges Box
  currentY += 38;
  // Draw Match Score Box
  doc.roundedRect(40, currentY, 250, 75, 8).fill('#eef2ff').stroke('#c7d2fe');
  doc
    .fillColor(primaryColor)
    .fontSize(28)
    .font('Helvetica-Bold')
    .text(`${analysis.overallScore}%`, 55, currentY + 14);

  doc
    .fillColor(primaryColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('ResumeIQ Match Score', 135, currentY + 18)
    .fontSize(8)
    .font('Helvetica')
    .text(analysis.overallScore >= 80 ? 'Strong role alignment' : analysis.overallScore >= 60 ? 'Moderate alignment' : 'Needs improvement', 135, currentY + 34);

  // Draw Resume Health Box
  doc.roundedRect(305, currentY, 250, 75, 8).fill('#f0fdf4').stroke('#bbf7d0');
  doc
    .fillColor('#15803d')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text(`${analysis.resumeHealthScore}`, 320, currentY + 14);

  doc
    .fillColor('#15803d')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Resume Health Score', 380, currentY + 18)
    .fontSize(8)
    .font('Helvetica')
    .text('Independent structural quality', 380, currentY + 34);

  // 4. Dimension Breakdown Table
  currentY += 92;
  doc
    .fillColor(darkTextColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Weighted Dimension Breakdown', 40, currentY);

  currentY += 16;
  const dimensions = [
    { name: 'Skills Match (30%)', score: analysis.scores?.skills || 0 },
    { name: 'Keyword Coverage (20%)', score: analysis.scores?.keywords || 0 },
    { name: 'Experience Match (20%)', score: analysis.scores?.experience || 0 },
    { name: 'Project Match (15%)', score: analysis.scores?.projects || 0 },
    { name: 'Resume Quality (10%)', score: analysis.scores?.quality || 0 },
    { name: 'Education Match (5%)', score: analysis.scores?.education || 0 }
  ];

  dimensions.forEach((dim, idx) => {
    const col = idx % 2 === 0 ? 40 : 305;
    const rowY = currentY + Math.floor(idx / 2) * 24;

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(dim.name, col, rowY);

    doc
      .font('Helvetica-Bold')
      .fillColor(dim.score >= 80 ? '#16a34a' : dim.score >= 60 ? '#d97706' : '#dc2626')
      .text(`${dim.score}%`, col + 200, rowY, { align: 'right' });
  });

  // 5. Matched & Missing Skills
  currentY += 85;
  doc
    .fillColor(darkTextColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Skill Alignment', 40, currentY);

  currentY += 16;
  const matched = (analysis.skills?.matched || []).slice(0, 10).join(', ') || 'None identified';
  const missing = (analysis.skills?.missing || []).slice(0, 10).join(', ') || 'None';

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#16a34a')
    .text('Matched Skills: ', 40, currentY, { continued: true })
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(matched);

  currentY += 18;
  doc
    .font('Helvetica-Bold')
    .fillColor('#dc2626')
    .text('Missing Target Skills: ', 40, currentY, { continued: true })
    .font('Helvetica')
    .fillColor(darkTextColor)
    .text(missing);

  // 6. Strengths & Areas to Improve
  currentY += 28;
  doc
    .fillColor(darkTextColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Key Strengths & Potential Gaps', 40, currentY);

  currentY += 16;
  (analysis.strengths || []).slice(0, 3).forEach((s) => {
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(`✓  ${s}`, 45, currentY);
    currentY += 13;
  });

  (analysis.weaknesses || []).slice(0, 3).forEach((w) => {
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(darkTextColor)
      .text(`⚠  ${w}`, 45, currentY);
    currentY += 13;
  });

  // 7. Top Actionable Recommendations
  currentY += 14;
  doc
    .fillColor(darkTextColor)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Prioritized Recommendations', 40, currentY);

  currentY += 16;
  (analysis.recommendations || []).slice(0, 3).forEach((rec, idx) => {
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(rec.priority === 'high' ? '#dc2626' : '#d97706')
      .text(`${idx + 1}. [${(rec.priority || 'medium').toUpperCase()}] ${rec.title}`, 45, currentY);

    currentY += 12;
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(lightTextColor)
      .text(`Action: ${rec.action}`, 55, currentY, { width: 490 });

    currentY += 18;
  });

  // Footer Notice
  doc
    .fontSize(7.5)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(
      'ResumeIQ Match Score is an explainable internal matching indicator and does not guarantee employment or ATS passage. All suggestions are grounded strictly on candidate data.',
      40,
      780,
      { align: 'center', width: 515 }
    );

  doc.end();
};

module.exports = { generatePdfReport };
