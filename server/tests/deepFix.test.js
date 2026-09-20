/**
 * Deep-Fix Verification Suite for ResumeIQ.
 * Tests negative collision prevention, two-stage structured parsing,
 * weighted scoring with data-driven explanations, and grounded evidence-based recommendations.
 */

const { extractSkillsFromText, normalizeSkill, getSkillCategory } = require('../src/utils/skillDictionary');
const { parseResume } = require('../src/services/resume/resumeParser');
const { calculateSkillScore } = require('../src/services/scoring/skillScorer');
const { runDeterministicScoring } = require('../src/services/scoring/overallScorer');
const aiProvider = require('../src/services/ai/aiProvider');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('====================================================');
console.log('🧪 RUNNING DEEP-FIX TEST SUITE');
console.log('====================================================');

// 1. NEGATIVE COLLISION & FALSE POSITIVE PREVENTION
console.log('\n--- 1. Negative Skill Collision Prevention ---');

// Test 1a: JavaScript vs Java
const jsOnlyText = 'Experienced in JavaScript, TypeScript, and React development.';
const jsSkills = extractSkillsFromText(jsOnlyText);
console.log('Test 1a extracted skills:', jsSkills);
assert(jsSkills.includes('JavaScript'), 'Should match JavaScript');
assert(!jsSkills.includes('Java'), 'CRITICAL: Must NOT match Java when only JavaScript is present!');

// Test 1b: Common words (next, go, spring)
const englishProse = 'In my next role, I will go to the office in the Spring 2024 semester.';
const proseSkills = extractSkillsFromText(englishProse);
console.log('Test 1b extracted skills:', proseSkills);
assert(!proseSkills.includes('Next.js'), 'Must NOT match Next.js on English word "next"');
assert(!proseSkills.includes('Go'), 'Must NOT match Go on English verb "go"');
assert(!proseSkills.includes('Spring Boot'), 'Must NOT match Spring Boot on "Spring 2024"');
assert(proseSkills.length === 0, `Expected 0 false positive skills, got: ${proseSkills.join(', ')}`);

// Test 1c: Legitimate C, Go, and Spring Boot in programming context
const validTechText = 'Languages: C, C++, Go, Python. Frameworks: Spring Boot, Next.js, Node.js.';
const validSkills = extractSkillsFromText(validTechText);
console.log('Test 1c extracted skills:', validSkills);
assert(validSkills.includes('C'), 'Should match C in languages list');
assert(validSkills.includes('C++'), 'Should match C++');
assert(validSkills.includes('Go'), 'Should match Go in languages list');
assert(validSkills.includes('Spring Boot'), 'Should match Spring Boot');
assert(validSkills.includes('Next.js'), 'Should match Next.js');
assert(validSkills.includes('Node.js'), 'Should match Node.js');

// Test 1d: Jira vs Agile
const methodologyText = 'Practiced Agile development with daily standups and sprint planning using Jira.';
const methSkills = extractSkillsFromText(methodologyText);
console.log('Test 1d extracted skills:', methSkills);
assert(methSkills.includes('Agile'), 'Should detect Agile as methodology');
assert(methSkills.includes('Jira'), 'Should detect Jira as tool');
assert(getSkillCategory('Jira') === 'Tools', 'Jira category should be Tools');
assert(getSkillCategory('Agile') === 'Methodologies', 'Agile category should be Methodologies');

console.log('✅ Negative collision & false positive tests passed flawlessly!');

// 2. TWO-STAGE STRUCTURED RESUME PARSER & CONFIDENCE
console.log('\n--- 2. Two-Stage Structured Resume Parser & Confidence ---');

const complexResumeText = `
Elena Rostova
elena.rostova@devmail.io • (415) 987-6543 • Seattle, WA
https://github.com/erostova • https://linkedin.com/in/erostova

CAREER OBJECTIVE
Full-Stack Cloud Architect with 7 years of production experience building high-availability distributed systems.

TECHNICAL COMPETENCIES
Languages: TypeScript, Python, Go, SQL
Frameworks: React, Express.js, FastAPI
Databases: PostgreSQL, Redis, DynamoDB
DevOps: AWS, Docker, Kubernetes, Terraform, CI/CD

PROFESSIONAL EXPERIENCE
Staff Cloud Engineer | CloudScale Systems | Jan 2021 - Present
• Architected event-driven microservices on AWS ECS handling over 10,000 requests/sec.
• Optimized PostgreSQL query performance, reducing p99 latency by 45%.
• Deployed automated CI/CD pipelines with GitHub Actions across 20+ microservices.

Software Engineer | NextGen Apps | Jun 2017 - Dec 2020
• Developed customer-facing React web applications with Redux state management.
• Built RESTful API endpoints in Node.js and Express.

ACADEMIC BACKGROUND
Bachelor of Science in Computer Science
University of Washington | 2013 - 2017

KEY PROJECTS
Distributed Task Queue | https://github.com/erostova/task-queue
• Implemented worker pool queue in Go using Redis streams.
`;

const parsedResume = parseResume(complexResumeText, 'Elena Rostova');

assert(parsedResume.personal.name === 'Elena Rostova', `Expected Elena Rostova, got: ${parsedResume.personal.name}`);
assert(parsedResume.personal.email === 'elena.rostova@devmail.io', 'Email extracted');
assert(parsedResume.personal.phone === '(415) 987-6543', 'Phone extracted');
assert(parsedResume.personal.links.length >= 2, 'Links extracted');

assert(parsedResume.confidence.skills >= 0.9, `Expected high skills confidence, got: ${parsedResume.confidence.skills}`);
assert(parsedResume.confidence.experience >= 0.9, `Expected high experience confidence, got: ${parsedResume.confidence.experience}`);
assert(parsedResume.confidence.education >= 0.9, `Expected high education confidence, got: ${parsedResume.confidence.education}`);

assert(parsedResume.experience.length === 2, `Expected 2 jobs, got ${parsedResume.experience.length}`);
assert(parsedResume.experience[0].bullets.length === 3, 'Job 1 bullets preserved');
assert(parsedResume.projects.length === 1, 'Project parsed');

console.log('✅ Two-stage resume parser & confidence scoring verified!');

// 3. WEIGHTED SCORING & DATA-DRIVEN EXPLANATIONS
console.log('\n--- 3. Weighted Scoring & Data-Driven Explanations ---');

const candidateSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
const requiredSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']; // 4/5 = 80%
const preferredSkills = ['AWS', 'Kubernetes']; // 0/2 = 0%

// With 80% weight on required, 20% on preferred:
// (0.80 * 0.80) + (0.0 * 0.20) = 0.64 = 64%
const scoreResult = calculateSkillScore(candidateSkills, requiredSkills, preferredSkills);
console.log('Weighted Skill Score:', scoreResult.score);
console.log('Data-driven explanation:', scoreResult.explanation);

assert(scoreResult.score === 64, `Expected 64, got ${scoreResult.score}`);
assert(scoreResult.matched.length === 4, 'Matched 4 skills');
assert(scoreResult.requiredMissing.length === 1, 'Missing 1 required');
assert(scoreResult.preferredMissing.length === 2, 'Missing 2 preferred');
assert(scoreResult.explanation.includes('You matched 4 of 5 required skills'), 'Explanation must include exact count');
assert(scoreResult.explanation.includes('Docker'), 'Explanation must cite missing Docker');

// Test Overall Deterministic Scorer Explanations
const jobMock = {
  title: 'Senior Cloud Engineer',
  parsedData: {
    requiredSkills,
    preferredSkills,
    keywords: ['Microservices', 'RESTful APIs', 'CI/CD'],
    experienceYears: 5,
    educationRequirements: ['Bachelor of Science in Computer Science']
  }
};

const fullScoring = runDeterministicScoring({ extractedText: complexResumeText, parsedData: parsedResume }, jobMock);
console.log('Overall Match Score:', fullScoring.overallScore);
console.log('Overall Explanation:', fullScoring.explanations.overall);
console.log('Skills Explanation:', fullScoring.explanations.skills);
console.log('Experience Explanation:', fullScoring.explanations.experience);

assert(typeof fullScoring.explanations.overall === 'string' && fullScoring.explanations.overall.length > 20, 'Overall explanation must be populated');
assert(typeof fullScoring.explanations.skills === 'string', 'Skills explanation populated');
assert(typeof fullScoring.explanations.experience === 'string', 'Experience explanation populated');
assert(typeof fullScoring.explanations.keywords === 'string', 'Keywords explanation populated');

console.log('✅ Weighted scoring and data-driven explanations verified!');

// 4. GROUNDED EVIDENCE-BASED RECOMMENDATIONS & ZERO FABRICATION
console.log('\n--- 4. Evidence-Based Recommendations & Heuristic Grounding ---');

const heuristicAnalysis = aiProvider.generateHeuristicAnalysis(
  { parsedData: parsedResume },
  jobMock,
  fullScoring
);

console.log('Generated recommendations count:', heuristicAnalysis.recommendations.length);
heuristicAnalysis.recommendations.forEach((rec, idx) => {
  console.log(`\nRec ${idx + 1}: [${rec.priority.toUpperCase()}] ${rec.title}`);
  console.log(`  Section: ${rec.section}`);
  console.log(`  Evidence: ${rec.evidence}`);
  console.log(`  Why It Matters: ${rec.whyItMatters}`);
  console.log(`  Example: ${rec.example}`);
  console.log(`  Requires User Input: ${rec.requiresUserInput}`);

  assert(rec.priority, 'Priority required');
  assert(rec.section, 'Section required');
  assert(rec.issue || rec.problem, 'Issue/problem required');
  assert(rec.evidence, 'Evidence required');
  assert(rec.whyItMatters, 'Why it matters required');
  assert(rec.recommendation || rec.action, 'Action required');
  assert(rec.example, 'Example required');
  assert(typeof rec.requiresUserInput === 'boolean', 'requiresUserInput boolean required');
});

// Test Bullet Improver with and without user metric
const bulletWithWeakVerb = 'worked on customer onboarding portal with React';
const improvedWithoutMetric = aiProvider.generateHeuristicBulletImprovement(bulletWithWeakVerb);
console.log('\nImproved Bullet (no user metric):', improvedWithoutMetric.improvedBullet);
assert(improvedWithoutMetric.improvedBullet.includes('[INSERT METRIC'), 'Should provide [INSERT METRIC] placeholder when no metric provided');
assert(!improvedWithoutMetric.improvedBullet.toLowerCase().includes('worked on'), 'Should replace weak verb');

const improvedWithMetric = aiProvider.generateHeuristicBulletImprovement(bulletWithWeakVerb, '', 'reducing churn by 18%');
console.log('Improved Bullet (with user metric):', improvedWithMetric.improvedBullet);
assert(improvedWithMetric.improvedBullet.includes('reducing churn by 18%'), 'Should cleanly incorporate verified user metric');
assert(!improvedWithMetric.improvedBullet.includes('[INSERT METRIC'), 'Should not have placeholder when user supplied metric');

console.log('\n====================================================');
console.log('🎉 ALL DEEP-FIX BENCHMARK TESTS PASSED WITH 100% ACCURACY!');
console.log('====================================================');
