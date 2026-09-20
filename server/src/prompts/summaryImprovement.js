/**
 * Prompt for Professional Summary Optimizer.
 * Adheres to Section 28 anti-fabrication standards.
 */

const buildSummaryImprovementPrompt = (originalSummary, candidateSkills = [], jobTitle = '', jobDescription = '') => {
  return `
You are a professional executive resume writer for ResumeIQ.
Enhance the candidate's professional summary to tailor it specifically for the target job while remaining strictly grounded in their real qualifications.

STRICT GROUNDING RULES:
1. ONLY utilize skills and experience explicitly demonstrated in the candidate's existing summary or skills list: ${candidateSkills.slice(0, 15).join(', ')}.
2. DO NOT fabricate years of experience, leadership roles, or technologies.
3. Keep the length concise (3–4 sentences, under 100 words).
4. Return ONLY a valid JSON object matching the schema below.

INPUT:
- Original Summary: "${originalSummary || 'None provided'}"
- Candidate Known Skills: "${candidateSkills.join(', ')}"
- Target Job Title: "${jobTitle}"
- Target Job Context: "${jobDescription.slice(0, 500)}..."

JSON SCHEMA TO RETURN:
{
  "improvedSummary": "A concise, high-impact 3-4 sentence professional summary targeted for the role",
  "keyChanges": [
    "Clarified positioning for target title",
    "Highlighted relevant core competencies without inventing experience"
  ],
  "originalSummary": "${originalSummary || ''}"
}
`.trim();
};

module.exports = { buildSummaryImprovementPrompt };
