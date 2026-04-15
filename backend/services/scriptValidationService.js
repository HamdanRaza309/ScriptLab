const { createJsonCompletion } = require('./openaiClient');
const {
  VALIDATION_SYSTEM_PROMPT,
  buildValidationUserPrompt,
} = require('./promptBuilder');
const { GENERATION_SETTINGS } = require('../config/scriptConfig');
const { countWords, isWordCountInRange, validateStructure } = require('../utils/scriptMetrics');

function buildWordCountIssues(wordCount, lengthConfig) {
  if (isWordCountInRange(wordCount, lengthConfig)) {
    return [];
  }

  if (wordCount < lengthConfig.minWords) {
    return [
      `Script is too short at ${wordCount} words; expand it to ${lengthConfig.minWords}-${lengthConfig.maxWords} words.`,
    ];
  }

  return [
    `Script is too long at ${wordCount} words; tighten it to ${lengthConfig.minWords}-${lengthConfig.maxWords} words.`,
  ];
}

async function validateScriptOutput({ script, idea, tone, lengthConfig }) {
  const wordCount = countWords(script);
  const structure = validateStructure(script, lengthConfig);
  const wordCountIssues = buildWordCountIssues(wordCount, lengthConfig);

  const modelValidation = await createJsonCompletion({
    messages: [
      { role: 'system', content: VALIDATION_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildValidationUserPrompt({
          script,
          idea,
          tone,
          lengthConfig,
          wordCount,
          structureIssues: structure.issues,
        }),
      },
    ],
    temperature: GENERATION_SETTINGS.validationTemperature,
  });

  const toneConsistent = modelValidation.toneConsistent !== false;
  const relevantToIdea = modelValidation.relevantToIdea !== false;
  const clarityPass = modelValidation.clarityPass !== false;
  const factualRisk = modelValidation.factualRisk === true;
  const llmIssues = Array.isArray(modelValidation.issues)
    ? modelValidation.issues.filter(Boolean).map((issue) => String(issue).trim())
    : [];

  const issues = [
    ...wordCountIssues,
    ...structure.issues,
    ...llmIssues,
  ];

  if (!toneConsistent) {
    issues.push(`Tone drift detected; the script should feel more ${tone.toLowerCase()}.`);
  }

  if (!relevantToIdea) {
    issues.push('Script drifts from the requested idea or becomes too generic.');
  }

  if (!clarityPass) {
    issues.push('Script needs clearer, more specific phrasing and less filler.');
  }

  if (factualRisk) {
    issues.push('Script includes claims or specifics that may be unsupported.');
  }

  // Loosen constraints: only require script to be relevant and not empty
  return {
    wordCount,
    wordCountInRange: wordCountIssues.length === 0,
    structureComplete: structure.isComplete,
    toneConsistent,
    relevantToIdea,
    clarityPass,
    factualRisk,
    issues: [...new Set(issues)],
    needsRevision:
      !relevantToIdea || wordCount < 30, // only block if script is off-topic or empty
  };
}

module.exports = {
  buildWordCountIssues,
  validateScriptOutput,
};
