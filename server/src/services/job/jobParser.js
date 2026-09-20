const { normalizeText } = require('../../utils/textNormalizer');
const { extractSkillsFromText, normalizeSkill } = require('../../utils/skillDictionary');

/**
 * High-fidelity parser for raw job descriptions.
 * Accurately extracts required vs. preferred skills, domain keywords,
 * experience requirements, education criteria, and responsibilities.
 *
 * @param {string} rawDescription
 * @returns {object} Parsed job criteria
 */
const parseJobDescription = (rawDescription) => {
  const text = normalizeText(rawDescription);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Extract Experience Years
  let experienceYears = 0;
  const expPatterns = [
    /(\d+)\+?\s*(?:to|-)\s*(\d+)\+?\s*years?(?:\s*of)?\s*(?:relevant|professional|software|engineering|industry|hands-on)?\s*experience/i,
    /at\s+least\s+(\d+)\+?\s*years?(?:\s*of)?\s*(?:relevant|professional|software|engineering|industry|hands-on)?\s*experience/i,
    /(\d+)\+?\s*years?(?:\s*of)?\s*(?:relevant|professional|software|engineering|industry|hands-on)?\s*experience/i,
    /minimum\s+(\d+)\+?\s*years?(?:\s*of)?\s*experience/i
  ];

  for (const pattern of expPatterns) {
    const match = text.match(pattern);
    if (match) {
      experienceYears = parseInt(match[1], 10) || 0;
      break;
    }
  }

  // 2. Identify Section Blocks
  const reqPattern = /^(?:minimum\s+qualifications|basic\s+qualifications|must\s+haves?|required\s+skills|requirements|what\s+you\s+need|who\s+you\s+are|what\s+we're\s+looking\s+for|core\s+qualifications|qualifications)\b/i;
  const prefPattern = /^(?:preferred\s+qualifications|nice\s+to\s+haves?|bonus\s+points?|bonus\s+qualifications|preferred\s+skills|preferred|desired\s+qualifications|pluses|nice\s+to\s+have)\b/i;
  const respPattern = /^(?:responsibilities|what\s+you'll\s+do|role\s+responsibilities|day\s+to\s+day|duties|what\s+you\s+will\s+deliver)\b/i;

  let currentBlock = 'general';
  const blocks = {
    general: [],
    required: [],
    preferred: [],
    responsibilities: []
  };

  for (const line of lines) {
    const cleanHeader = line.replace(/[:\-—•#*]+$/, '').trim();

    if (prefPattern.test(cleanHeader)) {
      currentBlock = 'preferred';
      continue;
    } else if (reqPattern.test(cleanHeader)) {
      currentBlock = 'required';
      continue;
    } else if (respPattern.test(cleanHeader)) {
      currentBlock = 'responsibilities';
      continue;
    }

    blocks[currentBlock].push(line);
  }

  // 3. Extract Skills by Block
  const allSkills = extractSkillsFromText(text);
  const requiredText = blocks.required.join('\n');
  const preferredText = blocks.preferred.join('\n');

  let requiredSkills = extractSkillsFromText(requiredText);
  let preferredSkills = extractSkillsFromText(preferredText);

  // If no explicit required block was segmented, deduce from general
  if (requiredSkills.length === 0 && preferredSkills.length === 0) {
    requiredSkills = allSkills;
  } else {
    // Ensure no overlap: If a skill is in preferred, keep it preferred
    requiredSkills = requiredSkills.filter((s) => !preferredSkills.includes(s));

    // Any skills mentioned in responsibilities or general (not in preferred) belong in required
    allSkills.forEach((s) => {
      if (!requiredSkills.includes(s) && !preferredSkills.includes(s)) {
        requiredSkills.push(s);
      }
    });
  }

  // 4. Extract Technical & Architectural Keywords
  const domainKeywordBank = [
    'RESTful APIs',
    'Microservices',
    'CI/CD',
    'Agile',
    'Scrum',
    'Scalability',
    'Distributed Systems',
    'Cloud Architecture',
    'Code Review',
    'Performance Optimization',
    'Security',
    'Unit Testing',
    'Integration Testing',
    'System Design',
    'Cross-functional',
    'High Availability',
    'Automation',
    'Full Stack',
    'DevOps',
    'Containerization',
    'Event-Driven Architecture',
    'Database Indexing',
    'Observability',
    'Data Pipelines',
    'Design Patterns'
  ];

  const keywords = [];
  const lowerText = ` ${text.toLowerCase()} `;
  domainKeywordBank.forEach((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const kwRegex = new RegExp(`(?:^|[^a-zA-Z0-9])(${escaped})(?=[^a-zA-Z0-9]|$)`, 'i');
    if (kwRegex.test(lowerText)) {
      keywords.push(kw);
    }
  });

  // Include extracted skills as searchable keywords
  allSkills.forEach((s) => {
    if (!keywords.includes(s)) {
      keywords.push(s);
    }
  });

  // 5. Extract Education Requirements
  const educationRequirements = [];
  const degreeRegex = /(?:bachelor'?s?|master'?s?|phd|b\.s\.|m\.s\.|associate'?s?)\s*(?:degree)?\s*(?:in\s+[a-zA-Z\s,]+)?/gi;
  const eduMatches = text.match(degreeRegex);
  if (eduMatches) {
    eduMatches.slice(0, 3).forEach((m) => {
      const clean = m.trim();
      if (!educationRequirements.includes(clean)) {
        educationRequirements.push(clean);
      }
    });
  }

  // 6. Extract Responsibilities
  const responsibilities = blocks.responsibilities
    .filter((l) => l.startsWith('•') || l.startsWith('-') || l.length > 25)
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
    .slice(0, 10);

  // 7. Extract Certifications
  const certRegex = /(?:aws\s+certified|azure\s+certified|gcp\s+certified|pmp|cissp|scrum\s+master|cka|ckad)\b/gi;
  const certMatches = text.match(certRegex);
  const certifications = certMatches ? Array.from(new Set(certMatches.map((c) => c.toUpperCase()))) : [];

  return {
    requiredSkills,
    preferredSkills,
    keywords,
    responsibilities,
    experienceYears,
    educationRequirements,
    certifications
  };
};

module.exports = { parseJobDescription };
