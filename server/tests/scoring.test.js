const { calculateSkillScore } = require('../src/services/scoring/skillScorer');
const { calculateKeywordScore } = require('../src/services/scoring/keywordScorer');
const { runDeterministicScoring, DEFAULT_WEIGHTS } = require('../src/services/scoring/overallScorer');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- Running Deterministic Scoring Test (Section 60) ---');

// Benchmark data specified in Section 60:
// Resume: React, Node.js, MongoDB
// Job: React, Node.js, MongoDB, AWS, Docker
const resumeSkills = ['React', 'Node.js', 'MongoDB'];
const requiredSkills = ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'];

const result = calculateSkillScore(resumeSkills, requiredSkills, []);

console.log('Skills Matched:', result.matched);
console.log('Skills Missing:', result.missing);
console.log('Calculated Skill Score:', result.score);

// 3 out of 5 required skills matched = 60%
assert(result.matched.length === 3, 'Expected 3 matched skills');
assert(result.missing.length === 2, 'Expected 2 missing skills');
assert(result.matched.includes('React'), 'Matched should include React');
assert(result.matched.includes('Node.js'), 'Matched should include Node.js');
assert(result.matched.includes('MongoDB'), 'Matched should include MongoDB');
assert(result.missing.includes('AWS'), 'Missing should include AWS');
assert(result.missing.includes('Docker'), 'Missing should include Docker');
assert(result.score === 60, `Expected score 60, got ${result.score}`);

console.log('✅ Section 60 Skill Scorer benchmark verified perfectly!');

console.log('--- Testing Overall ATS-Style Scoring Engine ---');

const mockResume = {
  extractedText: 'Full Stack Engineer with React, Node.js, MongoDB and RESTful APIs expertise.',
  parsedData: {
    personal: { email: 'alex@example.com', phone: '555-123-4567', links: ['https://github.com/alex'] },
    summary: 'Experienced Full Stack Engineer specialized in building cloud-native web applications.',
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript'],
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Solutions',
        startDate: '2020',
        endDate: '2024',
        bullets: [
          'Architected responsive React web applications serving over 50k monthly active users.',
          'Engineered scalable REST APIs with Node.js and MongoDB improving response latency by 35%.'
        ]
      }
    ],
    education: [
      { degree: 'Bachelor of Science', field: 'Computer Science', institution: 'State University' }
    ],
    projects: [
      {
        title: 'Cloud Dashboard',
        technologies: ['React', 'Node.js', 'MongoDB'],
        bullets: ['Built real-time analytics portal with WebSockets.']
      }
    ]
  }
};

const mockJob = {
  parsedData: {
    requiredSkills: ['React', 'Node.js', 'MongoDB'],
    preferredSkills: ['AWS', 'Docker'],
    keywords: ['RESTful APIs', 'Microservices', 'Scalability'],
    experienceYears: 3,
    educationRequirements: ['Bachelor of Science in Computer Science']
  }
};

const overall = runDeterministicScoring(mockResume, mockJob);

console.log('Overall Match Score:', overall.overallScore);
console.log('Resume Health Score:', overall.resumeHealthScore);
console.log('Score Breakdown:', overall.scores);

// Verify weights
const expectedOverall = Math.round(
  overall.scores.skills * DEFAULT_WEIGHTS.skills +
  overall.scores.keywords * DEFAULT_WEIGHTS.keywords +
  overall.scores.experience * DEFAULT_WEIGHTS.experience +
  overall.scores.projects * DEFAULT_WEIGHTS.projects +
  overall.scores.education * DEFAULT_WEIGHTS.education +
  overall.scores.quality * DEFAULT_WEIGHTS.quality
);

assert(overall.overallScore === expectedOverall, `Expected ${expectedOverall}, got ${overall.overallScore}`);
assert(overall.overallScore >= 70 && overall.overallScore <= 100, 'Score should be high for matching candidate');
assert(overall.resumeHealthScore >= 75, 'Resume Health Score should reflect good structure');

console.log('✅ Overall Scorer mathematically verified!');
console.log('🎉 Deterministic Scoring Engine Passed 100% of Tests!');
