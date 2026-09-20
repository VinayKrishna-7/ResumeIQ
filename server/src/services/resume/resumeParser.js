/**
 * Two-Stage Structured Resume Parser for ResumeIQ.
 * Stage 1: Robust Section Segmentation, Boundary Detection, and Confidence Scoring.
 * Stage 2: Entity Extraction for Personal Info, Experience, Education, Projects, and Skills.
 */

const {
  extractEmails,
  extractPhones,
  extractLinks,
  getStructuralLines
} = require('../../utils/textNormalizer');
const { extractSkillsFromText, normalizeSkill, getSkillCategory } = require('../../utils/skillDictionary');

// Precompiled section header definitions with regex and confidence weights
const SECTION_DEFINITIONS = [
  {
    key: 'summary',
    name: 'Professional Summary',
    regex: /^(?:professional\s+summary|summary\s+of\s+qualifications|executive\s+summary|career\s+summary|summary|profile|about\s+me|objective|career\s+objective)\b/i,
    weight: 0.95
  },
  {
    key: 'skills',
    name: 'Technical Skills',
    regex: /^(?:technical\s+skills|technical\s+competencies|core\s+competencies|competencies|skills\s*(?:&|and)?\s*technologies|technical\s+proficiencies|technical\s+expertise|areas\s+of\s+expertise|technologies|skills|core\s+skills|programming\s+languages)\b/i,
    weight: 0.95
  },

  {
    key: 'experience',
    name: 'Work Experience',
    regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|experience|relevant\s+experience|career\s+history)\b/i,
    weight: 0.95
  },
  {
    key: 'education',
    name: 'Education',
    regex: /^(?:education|academic\s+background|educational\s+qualifications|academic\s+history|degrees)\b/i,
    weight: 0.95
  },
  {
    key: 'projects',
    name: 'Projects',
    regex: /^(?:projects|key\s+projects|technical\s+projects|personal\s+projects|academic\s+projects|featured\s+projects)\b/i,
    weight: 0.90
  },
  {
    key: 'certifications',
    name: 'Certifications',
    regex: /^(?:certifications|certificates|licenses\s*(?:&|and)?\s*certifications|professional\s+certifications)\b/i,
    weight: 0.90
  },
  {
    key: 'achievements',
    name: 'Achievements & Awards',
    regex: /^(?:achievements|awards|honors\s*(?:&|and)?\s*awards|key\s+achievements|accomplishments)\b/i,
    weight: 0.85
  }
];

/**
 * Stage 1: Segment resume lines into structured section blocks and calculate confidence.
 */
const segmentResumeSections = (lines) => {
  const sectionBlocks = {
    header: [],
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  const confidence = {
    summary: 0,
    skills: 0,
    experience: 0,
    education: 0,
    projects: 0,
    certifications: 0
  };

  const sources = {
    summary: 'none',
    skills: 'none',
    experience: 'none',
    education: 'none',
    projects: 'none',
    certifications: 'none'
  };

  let currentSection = 'header';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line matches a known section header
    // Headers typically are short (< 40 chars), often uppercase or standalone
    let matchedDef = null;

    if (line.length <= 40) {
      // Clean header of trailing colons, dashes, bullet characters
      const cleanHeaderCandidate = line.replace(/[:\-—•#*]+$/, '').trim();

      for (const def of SECTION_DEFINITIONS) {
        if (def.regex.test(cleanHeaderCandidate)) {
          matchedDef = def;
          break;
        }
      }
    }

    if (matchedDef) {
      currentSection = matchedDef.key;
      confidence[currentSection] = matchedDef.weight;
      sources[currentSection] = 'regex_header';
      continue;
    }

    sectionBlocks[currentSection].push(line);
  }

  // Fallback heuristic for summary if not matched via explicit header
  if (sectionBlocks.summary.length === 0 && sectionBlocks.header.length > 2) {
    const candidateSummaryLines = [];
    for (const line of sectionBlocks.header.slice(1, 6)) {
      if (
        !line.includes('@') &&
        !line.includes('http') &&
        !/\d{3}[-.\s]\d{3}/.test(line) &&
        line.length > 55
      ) {
        candidateSummaryLines.push(line);
      }
    }
    if (candidateSummaryLines.length > 0) {
      sectionBlocks.summary = candidateSummaryLines;
      confidence.summary = 0.65;
      sources.summary = 'heuristic_position';
    }
  }

  // Adjust confidence based on contents found
  if (sectionBlocks.experience.length > 0 && confidence.experience > 0) {
    confidence.experience = Math.min(1.0, confidence.experience + 0.05);
  }
  if (sectionBlocks.skills.length > 0 && confidence.skills > 0) {
    confidence.skills = Math.min(1.0, confidence.skills + 0.05);
  }

  return { sectionBlocks, confidence, sources };
};

/**
 * Stage 2 Helper: Extract candidate personal information.
 */
const extractPersonalInfo = (headerLines, fullText, defaultName = '') => {
  const emails = extractEmails(fullText);
  const phones = extractPhones(fullText);
  const links = extractLinks(fullText);

  // Detect candidate name from early header lines
  let name = defaultName;
  for (let i = 0; i < Math.min(headerLines.length, 5); i++) {
    const line = headerLines[i];
    if (
      !line.includes('@') &&
      !line.match(/\d{3}/) &&
      !line.toLowerCase().startsWith('http') &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      !line.toLowerCase().includes('portfolio') &&
      line.split(' ').length >= 2 &&
      line.split(' ').length <= 4 &&
      line.length < 40 &&
      /^[a-zA-Z\s.'-]+$/.test(line)
    ) {
      name = line.trim();
      break;
    }
  }

  // Detect candidate location (City, State / Country)
  let location = '';
  const locationRegex = /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?|[A-Z][a-zA-Z\s]+,\s*(?:United States|USA|Canada|UK|India|Germany|Remote))/;
  const locMatch = fullText.match(locationRegex);
  if (locMatch) {
    location = locMatch[0].trim();
  }

  return {
    name,
    email: emails[0] || '',
    phone: phones[0] || '',
    location,
    links
  };
};

/**
 * Stage 2 Helper: Segment and extract work experience jobs.
 */
const parseExperienceEntries = (lines) => {
  if (!lines || lines.length === 0) return [];
  const entries = [];
  let currentJob = null;

  const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|to)\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}|present|current)/i;

  for (const line of lines) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    const hasDate = datePattern.test(line);

    // Header line detection for new job
    if (hasDate || (!isBullet && line.length < 75 && !currentJob)) {
      if (currentJob && (currentJob.title || currentJob.company || currentJob.bullets.length > 0)) {
        entries.push(currentJob);
      }

      let dateStr = '';
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        dateStr = dateMatch[0];
      }

      const cleanLine = line.replace(datePattern, '').replace(/[|•,]/g, ' ').trim();
      const parts = cleanLine.split(/\s{2,}|\sat\s|—|-/).map((p) => p.trim()).filter(Boolean);

      currentJob = {
        title: parts[0] || cleanLine || 'Software Engineer',
        company: parts[1] || '',
        location: '',
        startDate: dateStr.split(/[-–]|to/)[0]?.trim() || '',
        endDate: dateStr.split(/[-–]|to/)[1]?.trim() || (dateStr.toLowerCase().includes('present') ? 'Present' : ''),
        current: dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current'),
        bullets: []
      };
    } else if (currentJob) {
      const cleanBullet = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleanBullet) {
        currentJob.bullets.push(cleanBullet);
      }
    }
  }

  if (currentJob && (currentJob.title || currentJob.bullets.length > 0)) {
    entries.push(currentJob);
  }

  return entries;
};

/**
 * Stage 2 Helper: Parse education block.
 */
const parseEducationEntries = (lines) => {
  if (!lines || lines.length === 0) return [];
  const entries = [];
  const degreeRegex = /(?:bachelor|master|phd|b\.s\.|m\.s\.|b\.a\.|m\.a\.|associate|btech|mtech|b\.e\.|m\.e\.)\b/i;
  const yearRegex = /\b(19\d{2}|20\d{2})\b/;

  let current = null;

  for (const line of lines) {
    const hasDegree = degreeRegex.test(line);
    const hasYear = yearRegex.test(line);

    if (hasDegree || !current) {
      if (current) entries.push(current);
      const yearMatch = line.match(yearRegex);

      current = {
        degree: hasDegree ? line.match(degreeRegex)[0] : 'Bachelor Degree',
        field: line.includes('in ') ? line.split('in ')[1]?.split(/[,|]/)[0]?.trim() : '',
        institution: line.replace(degreeRegex, '').replace(yearRegex, '').replace(/[,|]/g, ' ').trim(),
        graduationDate: yearMatch ? yearMatch[0] : ''
      };
    } else if (current) {
      if (!current.graduationDate && hasYear) {
        current.graduationDate = line.match(yearRegex)[0];
      }
      if (!current.field && line.toLowerCase().includes('major')) {
        current.field = line.replace(/major[:\s]*/i, '').trim();
      }
    }
  }

  if (current) entries.push(current);
  return entries;
};

/**
 * Stage 2 Helper: Parse projects block.
 */
const parseProjectEntries = (lines) => {
  if (!lines || lines.length === 0) return [];
  const entries = [];
  let current = null;

  for (const line of lines) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

    if (!isBullet && line.length < 80) {
      if (current) entries.push(current);

      const links = extractLinks(line);
      const techs = extractSkillsFromText(line);

      current = {
        title: line.replace(/http[^\s]+/g, '').replace(/[|()]/g, ' ').trim(),
        technologies: techs,
        description: '',
        bullets: [],
        link: links[0] || ''
      };
    } else if (current) {
      const cleanBullet = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleanBullet) {
        current.bullets.push(cleanBullet);
        const bulletTechs = extractSkillsFromText(cleanBullet);
        bulletTechs.forEach((t) => {
          if (!current.technologies.includes(t)) {
            current.technologies.push(t);
          }
        });
      }
    }
  }

  if (current) entries.push(current);
  return entries;
};

/**
 * Full Two-Stage Parser Orchestrator.
 * Converts raw/normalized resume text into verified structured data with confidence scores.
 *
 * @param {string} text
 * @param {string} defaultName
 * @returns {object} Full structured resume representation
 */
const parseResume = (text, defaultName = '') => {
  const lines = getStructuralLines(text);

  // Stage 1: Boundary & Section Segmentation
  const { sectionBlocks, confidence, sources } = segmentResumeSections(lines);

  // Stage 2: Entity & Block Parsing
  const personal = extractPersonalInfo(sectionBlocks.header, text, defaultName);
  const summary = sectionBlocks.summary.join(' ').trim();

  // Skills Extraction: Merge explicit section items with verified dictionary matches
  const explicitSkillsText = sectionBlocks.skills.join('\n');
  const explicitSkills = explicitSkillsText
    .split(/[,•|\n;]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 35)
    .map((s) => normalizeSkill(s));

  const allDetectedSkills = extractSkillsFromText(text);
  const skillsSet = new Set([...explicitSkills, ...allDetectedSkills]);
  const skills = Array.from(skillsSet).filter(Boolean);

  const experience = parseExperienceEntries(sectionBlocks.experience);
  const education = parseEducationEntries(sectionBlocks.education);
  const projects = parseProjectEntries(sectionBlocks.projects);

  const certifications = sectionBlocks.certifications
    .flatMap((l) => l.split(/[,•\n]/))
    .map((c) => c.trim())
    .filter((c) => c.length > 3);

  const achievements = sectionBlocks.achievements
    .flatMap((l) => l.split(/[,•\n]/))
    .map((a) => a.trim())
    .filter((a) => a.length > 3);

  return {
    personal,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    confidence,
    sources
  };
};

module.exports = {
  parseResume,
  segmentResumeSections,
  extractPersonalInfo,
  parseExperienceEntries,
  parseEducationEntries,
  parseProjectEntries
};
