require('dotenv').config();
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Resume = require('../src/models/Resume');
const Job = require('../src/models/Job');
const Analysis = require('../src/models/Analysis');
const { runDeterministicScoring } = require('../src/services/scoring/overallScorer');
const aiProvider = require('../src/services/ai/aiProvider');

function assert(condition, msg) {
  if (!condition) throw new Error(`Integration Assertion Failed: ${msg}`);
}

async function runIntegrationTest() {
  console.log('--- Starting Full Pipeline Integration Test ---');
  await connectDB();

  try {
    // 1. Create Test User
    console.log('1. Creating test candidate user...');
    const testUser = await User.create({
      name: 'Integration Test User',
      email: `test_integration_${Date.now()}@example.com`,
      passwordHash: 'hashedSecret123',
      targetRole: 'Full Stack Engineer'
    });
    assert(testUser._id, 'User creation failed');
    console.log('   User created with ID:', testUser._id);

    // 2. Create Candidate Resume
    console.log('2. Creating candidate parsed resume...');
    const testResume = await Resume.create({
      userId: testUser._id,
      name: 'Test Full Stack Resume',
      originalFilename: 'test_resume.pdf',
      fileType: 'pdf',
      fileSize: 102400,
      extractedText: 'Full Stack Engineer with React, Node.js, Express, MongoDB, Docker and AWS experience.',
      parsedData: {
        personal: { name: 'Integration Test User', email: testUser.email, phone: '555-987-6543' },
        summary: 'Experienced Full Stack Engineer passionate about building scalable web solutions.',
        skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Docker', 'AWS'],
        experience: [
          {
            title: 'Full Stack Developer',
            company: 'Cloud Corp',
            bullets: [
              'Architected React web applications and Node.js REST APIs.',
              'Containerized application services using Docker.'
            ]
          }
        ],
        projects: [
          {
            title: 'Portfolio Dashboard',
            technologies: ['React', 'Node.js', 'MongoDB'],
            bullets: ['Built real-time dashboard.']
          }
        ],
        education: [
          { degree: 'BS Computer Science', institution: 'State University' }
        ]
      }
    });
    assert(testResume._id, 'Resume creation failed');
    console.log('   Resume created with ID:', testResume._id);

    // 3. Create Target Job
    console.log('3. Creating target job description...');
    const testJob = await Job.create({
      userId: testUser._id,
      title: 'Senior Full Stack Engineer',
      company: 'InnovateX',
      description: 'Looking for a Senior Full Stack Engineer with React, Node.js, MongoDB, AWS, and Kubernetes.',
      parsedData: {
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
        preferredSkills: ['Kubernetes', 'Docker'],
        keywords: ['RESTful APIs', 'Microservices', 'Scalability'],
        experienceYears: 3,
        educationRequirements: ['BS Computer Science']
      }
    });
    assert(testJob._id, 'Job creation failed');
    console.log('   Job created with ID:', testJob._id);

    // 4. Run Deterministic Scoring
    console.log('4. Running deterministic scoring engine...');
    const scoringResult = runDeterministicScoring(testResume, testJob);
    console.log('   Overall ATS Score:', scoringResult.overallScore);
    console.log('   Resume Health Score:', scoringResult.resumeHealthScore);
    assert(scoringResult.overallScore > 0, 'Overall score should be > 0');
    assert(scoringResult.skills.matched.includes('React'), 'Skills matched should include React');
    assert(scoringResult.skills.matched.includes('Node.js'), 'Skills matched should include Node.js');

    // 5. Run AI Qualitative Analysis (fallback or live)
    console.log('5. Running AI qualitative analysis...');
    const aiResult = await aiProvider.analyzeResume(testResume, testJob);
    assert(Array.isArray(aiResult.strengths), 'Strengths should be an array');
    assert(Array.isArray(aiResult.recommendations), 'Recommendations should be an array');
    console.log('   AI Strengths:', aiResult.strengths.length);
    console.log('   AI Recommendations:', aiResult.recommendations.length);

    // 6. Persist Full Analysis Document
    console.log('6. Saving analysis document to MongoDB...');
    const analysis = await Analysis.create({
      userId: testUser._id,
      resumeId: testResume._id,
      jobId: testJob._id,
      overallScore: scoringResult.overallScore,
      resumeHealthScore: scoringResult.resumeHealthScore,
      scores: scoringResult.scores,
      skills: scoringResult.skills,
      keywords: scoringResult.keywords,
      experience: {
        ...scoringResult.experience,
        feedback: aiResult.experienceFeedback
      },
      projects: scoringResult.projects,
      education: scoringResult.education,
      certifications: scoringResult.certifications,
      quality: scoringResult.quality,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      recommendations: aiResult.recommendations,
      sectionImprovements: aiResult.sectionImprovements
    });
    assert(analysis._id, 'Analysis creation failed');
    console.log('   Analysis persisted with ID:', analysis._id);

    // 7. Retrieve and Verify Populated Analysis
    console.log('7. Retrieving analysis from database with population...');
    const retrieved = await Analysis.findById(analysis._id)
      .populate('resumeId', 'name')
      .populate('jobId', 'title company');

    assert(retrieved.resumeId.name === 'Test Full Stack Resume', 'Populated resume name mismatch');
    assert(retrieved.jobId.title === 'Senior Full Stack Engineer', 'Populated job title mismatch');
    assert(retrieved.overallScore === scoringResult.overallScore, 'Score mismatch');
    console.log('   Populated Retrieval successfully verified!');

    // 8. Clean up
    console.log('8. Cleaning up test documents...');
    await Analysis.deleteOne({ _id: analysis._id });
    await Job.deleteOne({ _id: testJob._id });
    await Resume.deleteOne({ _id: testResume._id });
    await User.deleteOne({ _id: testUser._id });

    console.log('🎉 Full End-to-End Integration Test Passed With Flying Colors!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Integration Test Failed:', err);
    await disconnectDB();
    process.exit(1);
  }
}

runIntegrationTest();
