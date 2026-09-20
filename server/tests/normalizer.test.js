const { normalizeResume } = require('../src/services/resume/resumeNormalizer');
const { normalizeSkill, extractSkillsFromText } = require('../src/utils/skillDictionary');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- Testing Skill Normalization ---');
assert(normalizeSkill('React.js') === 'React', 'React.js should normalize to React');
assert(normalizeSkill('React JS') === 'React', 'React JS should normalize to React');
assert(normalizeSkill('reactjs') === 'React', 'reactjs should normalize to React');
assert(normalizeSkill('Node.js') === 'Node.js', 'Node.js should normalize to Node.js');
assert(normalizeSkill('nodejs') === 'Node.js', 'nodejs should normalize to Node.js');
assert(normalizeSkill('aws') === 'AWS', 'aws should normalize to AWS');
assert(normalizeSkill('amazon web services') === 'AWS', 'amazon web services should normalize to AWS');
assert(normalizeSkill('ts') === 'TypeScript', 'ts should normalize to TypeScript');
console.log('✅ Skill Normalization assertions passed!');

console.log('--- Testing Resume Normalizer ---');
const sampleResumeText = `
Alex Morgan
alex.morgan@example.com | (555) 123-4567 | San Francisco, CA
https://github.com/alexmorgan | https://linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6 years of experience specializing in React, Node.js, and cloud architectures. Passionate about building high-performance web applications and scalable RESTful APIs.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
Frameworks: React, Next.js, Express.js, Redux, Tailwind CSS
Databases: MongoDB, PostgreSQL, Redis
DevOps: Docker, AWS, CI/CD, Git

WORK EXPERIENCE
Senior Full Stack Developer — TechCorp Inc. | 2021 - Present
• Architected and deployed scalable React applications serving high traffic.
• Developed robust microservices in Node.js and Express integrated with MongoDB.
• Implemented automated CI/CD pipelines using GitHub Actions, cutting release cycles by 40%.

Software Engineer — Innovate Labs | 2018 - 2021
• Built responsive frontend interfaces using React and Redux with Tailwind CSS.
• Designed PostgreSQL database schemas and optimized SQL queries.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2014 - 2018

PROJECTS
E-Commerce Cloud Platform
• Built microservices-based store using React, Node.js, MongoDB and Redis.
• Deployed to AWS with Docker containers.

CERTIFICATIONS
AWS Certified Solutions Architect
`;

const parsed = normalizeResume(sampleResumeText, 'Alex Morgan Resume');

assert(parsed.personal.name === 'Alex Morgan', `Expected name Alex Morgan, got ${parsed.personal.name}`);
assert(parsed.personal.email === 'alex.morgan@example.com', `Expected email, got ${parsed.personal.email}`);
assert(parsed.personal.phone === '(555) 123-4567', `Expected phone, got ${parsed.personal.phone}`);
assert(parsed.personal.location.includes('San Francisco'), `Expected location San Francisco, got ${parsed.personal.location}`);
assert(parsed.personal.links.length >= 2, `Expected at least 2 links, got ${parsed.personal.links.length}`);

assert(parsed.summary.includes('Senior Full Stack Engineer'), 'Summary should capture introductory text');
assert(parsed.skills.includes('React'), 'Skills should contain React');
assert(parsed.skills.includes('Node.js'), 'Skills should contain Node.js');
assert(parsed.skills.includes('MongoDB'), 'Skills should contain MongoDB');
assert(parsed.skills.includes('AWS'), 'Skills should contain AWS');
assert(parsed.skills.includes('Docker'), 'Skills should contain Docker');

assert(parsed.experience.length >= 2, `Expected at least 2 jobs, got ${parsed.experience.length}`);
assert(parsed.experience[0].bullets.length >= 3, `Expected bullets in job 1, got ${parsed.experience[0].bullets.length}`);

assert(parsed.education.length >= 1, `Expected at least 1 education entry, got ${parsed.education.length}`);
assert(parsed.projects.length >= 1, `Expected at least 1 project entry, got ${parsed.projects.length}`);
assert(parsed.certifications.length >= 1, `Expected at least 1 certification, got ${parsed.certifications.length}`);

console.log('✅ Resume Normalizer successfully parsed all sections!');
console.log('🎉 Normalizer and Skill tests passed with 100% accuracy!');
