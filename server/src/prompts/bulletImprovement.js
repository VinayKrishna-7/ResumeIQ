/**
 * Prompt for AI Bullet Point Rewriter.
 * Strictly adheres to Section 26 and Section 70 anti-fabrication rules.
 */

const buildBulletImprovementPrompt = (originalBullet, roleContext = '', userMetric = '') => {
  return `
You are an expert resume bullet editor for ResumeIQ.
Rewrite and improve the candidate's resume bullet point for maximum impact and ATS clarity.

STRICT GROUNDING RULES:
1. NEVER invent numbers, revenue figures, percentage improvements, user counts, or technologies not mentioned in the original bullet or supplied context.
2. If the bullet lacks metrics and no user metric is provided, improve the action verb and technical clarity, and explicitly state that a verified metric should be added if available.
3. Return ONLY a valid JSON object matching the schema below. Do not wrap with markdown blocks.

INPUT:
- Original Bullet: "${originalBullet}"
- Target Role Context: "${roleContext || 'Software Engineer'}"
${userMetric ? `- User-provided Verified Metric: "${userMetric}"` : ''}

JSON SCHEMA TO RETURN:
{
  "improvedBullet": "Direct, strong, professional rewrite using an active verb and clear contribution",
  "rationale": [
    "Stronger action verb",
    "Enhanced technical clarity and contribution"
  ],
  "missingMetricNote": "${userMetric ? '' : 'A measurable result could strengthen this bullet if you can provide a verified metric (e.g. latency reduced, users served, or efficiency gained).'}"
}
`.trim();
};

module.exports = { buildBulletImprovementPrompt };
