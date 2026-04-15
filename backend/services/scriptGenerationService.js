const { createJsonCompletion } = require('./openaiClient');
const {
  GENERATION_SYSTEM_PROMPT,
  REVISION_SYSTEM_PROMPT,
  buildGenerationUserPrompt,
  buildRevisionUserPrompt,
} = require('./promptBuilder');
const { GENERATION_SETTINGS } = require('../config/scriptConfig');
const { validateScriptOutput } = require('./scriptValidationService');

function buildMessages(systemPrompt, userPrompt) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}


async function generateDraft({ idea, tone, lengthConfig }) {
  // Instruct LLM to return a JSON object with script, wordCount, and targetWordRange
  const userPrompt = [
    buildGenerationUserPrompt({ idea, tone, lengthConfig }),
    '',
    'Return a valid JSON object with this structure:',
    '{',
    '  "script": "...the script text...",',
    '  "wordCount": 123,',
    '  "targetWordRange": { "min": 100, "max": 200 }',
    '}',
    'Do not include any other text or commentary.'
  ].join('\n');
  return createJsonCompletion({
    messages: buildMessages(GENERATION_SYSTEM_PROMPT, userPrompt),
    temperature: GENERATION_SETTINGS.generationTemperature,
    maxTokens: GENERATION_SETTINGS.maxTokens,
  });
}


async function reviseDraft({
  script,
  idea,
  tone,
  lengthConfig,
  validation,
}) {
  // Instruct LLM to return a JSON object with script, wordCount, and targetWordRange
  const userPrompt = [
    buildRevisionUserPrompt({
      script,
      idea,
      tone,
      lengthConfig,
      validationIssues: validation.issues,
      wordCount: validation.wordCount,
    }),
    '',
    'Return a valid JSON object with this structure:',
    '{',
    '  "script": "...the script text...",',
    '  "wordCount": 123,',
    '  "targetWordRange": { "min": 100, "max": 200 }',
    '}',
    'Do not include any other text or commentary.'
  ].join('\n');
  return createJsonCompletion({
    messages: buildMessages(REVISION_SYSTEM_PROMPT, userPrompt),
    temperature: GENERATION_SETTINGS.revisionTemperature,
    maxTokens: GENERATION_SETTINGS.maxTokens,
  });
}


async function generateValidatedScript({ idea, tone, lengthConfig }) {
  let scriptObj = await generateDraft({ idea, tone, lengthConfig });
  let validation = await validateScriptOutput({ script: scriptObj.script, idea, tone, lengthConfig });
  let attempt = 1;

  while (validation.needsRevision && attempt < GENERATION_SETTINGS.maxAttempts) {
    scriptObj = await reviseDraft({
      script: scriptObj.script,
      idea,
      tone,
      lengthConfig,
      validation,
    });
    validation = await validateScriptOutput({ script: scriptObj.script, idea, tone, lengthConfig });
    attempt += 1;
  }

  return {
    script: scriptObj,
    validation,
    attempts: attempt,
  };
}

module.exports = {
  generateValidatedScript,
};
