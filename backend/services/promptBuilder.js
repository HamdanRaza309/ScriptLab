const { TONE_GUIDANCE } = require('../config/scriptConfig');

const GENERATION_SYSTEM_PROMPT = [
  'You are an expert YouTube script writer.',
  'Write accurate, specific, narration-ready scripts with a high quality bar.',
  '',
  'Non-negotiable rules:',
  '- Do not hallucinate facts, names, quotes, dates, statistics, study results, or events.',
  '- If the user idea suggests facts that are uncertain, stay careful and general instead of inventing specifics.',
  '- Stay tightly on topic and make every section serve the stated idea.',
  '- Clarity over hype. Specificity over vagueness. No fluff, filler, or empty repetition.',
  '',
  'Output structure:',
  '- Return only the script text.',
  '- Use these headings exactly, each on its own line:',
  'Hook',
  'Setup/Context',
  'Key Section 1',
  'Key Section 2',
  'Key Section 3',
  'Key Section 4',
  'Conclusion/CTA',
  '- Use only the number of key sections required by the target length.',
  '- The Hook must be exactly 2-3 short lines.',
  '- Setup/Context should quickly orient the viewer.',
  '- Key sections should move the idea forward with clear transitions and concrete points.',
  '- Conclusion/CTA should close the idea cleanly and may include a light call to action.',
  '- Under each heading, write natural paragraphs, not bullet points.',
  '',
  'Tone behavior:',
  '- Dramatic: emotional, intense, vivid, and storytelling-driven without becoming melodramatic or fake.',
  '- Neutral: informative, balanced, clear, and composed.',
  '- Uplifting: positive, inspiring, encouraging, and warm without sounding generic.',
  '',
  'Length discipline:',
  '- 1 minute scripts use exactly 2 key sections.',
  '- 3 minute scripts use exactly 2 key sections.',
  '- 5 minute scripts use exactly 3 key sections.',
  '- 10 minute scripts use exactly 4 key sections.',
  '- The final script must stay strictly inside the requested word range.',
  '- Adjust detail to fit the target length.',
  '- Do not pad short scripts and do not repeat points to stretch long scripts.',
].join('\n');

const REVISION_SYSTEM_PROMPT = [
  'You are an expert YouTube script editor.',
  'Revise the draft so it fully satisfies the brief and every validation issue.',
  '',
  'Editing rules:',
  '- Preserve the core idea, selected tone, and strongest lines when possible.',
  '- Fix structural gaps, tighten weak phrasing, and remove filler.',
  '- Do not hallucinate facts or add unsupported specifics.',
  '- Keep the exact heading structure required by the brief.',
  '- The final script must stay strictly inside the requested word range.',
  '- Return only the revised script text.',
].join('\n');

const VALIDATION_SYSTEM_PROMPT = [
  'You are a strict QA reviewer for AI-generated YouTube scripts.',
  'Evaluate whether the script matches the request and is safe from obvious fabrication or generic filler.',
  'Return valid JSON only.',
  '',
  'Use this exact schema:',
  '{',
  '  "toneConsistent": true,',
  '  "relevantToIdea": true,',
  '  "clarityPass": true,',
  '  "factualRisk": false,',
  '  "issues": []',
  '}',
  '',
  'Decision rules:',
  '- toneConsistent is false if the writing does not strongly reflect the selected tone.',
  '- relevantToIdea is false if the script drifts off-topic or becomes generic.',
  '- clarityPass is false if the script is vague, padded, repetitive, or hard to follow.',
  '- factualRisk is true if the script contains invented-looking specifics or overconfident claims that may be unsupported.',
  '- issues must be short, actionable strings.',
].join('\n');

function buildGenerationUserPrompt({ idea, tone, lengthConfig }) {
  return [
    `Idea: ${idea}`,
    `Tone: ${tone}`,
    `Target length: ${lengthConfig.minutes} minutes`,
    `Word range: ${lengthConfig.minWords}-${lengthConfig.maxWords} words`,
  ].join('\n');
}

function buildRevisionUserPrompt({
  script,
  idea,
  tone,
  lengthConfig,
  validationIssues,
  wordCount,
}) {
  const issueLines = validationIssues.map((issue) => `- ${issue}`).join('\n');

  return [
    `Idea: ${idea}`,
    `Tone: ${tone}`,
    `Target length: ${lengthConfig.minutes} minutes`,
    `Word range: ${lengthConfig.minWords}-${lengthConfig.maxWords} words`,
    `Current word count: ${wordCount}`,
    `Tone target: ${TONE_GUIDANCE[tone]}`,
    '',
    'Issues to fix:',
    issueLines,
    '',
    'Current script:',
    script,
  ].join('\n');
}

function buildValidationUserPrompt({
  script,
  idea,
  tone,
  lengthConfig,
  wordCount,
  structureIssues,
}) {
  const structureSummary =
    structureIssues.length === 0 ? 'None' : structureIssues.map((issue) => `- ${issue}`).join('\n');

  return [
    `Idea: ${idea}`,
    `Tone: ${tone}`,
    `Target length: ${lengthConfig.minutes} minutes`,
    `Required word range: ${lengthConfig.minWords}-${lengthConfig.maxWords} words`,
    `Actual word count: ${wordCount}`,
    `Required key sections: ${lengthConfig.keySectionCount}`,
    '',
    'Local structure issues:',
    structureSummary,
    '',
    'Script to review:',
    script,
  ].join('\n');
}

module.exports = {
  GENERATION_SYSTEM_PROMPT,
  REVISION_SYSTEM_PROMPT,
  VALIDATION_SYSTEM_PROMPT,
  buildGenerationUserPrompt,
  buildRevisionUserPrompt,
  buildValidationUserPrompt,
};
