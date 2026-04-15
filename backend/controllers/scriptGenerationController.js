
const { LENGTH_CONFIG, VALID_TONES } = require('../config/scriptConfig');
const { generateValidatedScript } = require('../services/scriptGenerationService');
const { z } = require('zod');

// Zod schema for request validation
const scriptRequestSchema = z.object({
  idea: z.string().min(5, 'Please provide a more detailed idea (at least 5 characters).'),
  tone: z.enum(VALID_TONES),
  length: z.union([
    z.string().transform(Number),
    z.number()
  ]).refine((val) => [1, 3, 5, 10].includes(Number(val)), {
    message: 'Invalid length. Choose 1, 3, 5, or 10 minutes.'
  })
});

exports.generateScript = async (req, res) => {
  try {
    // Validate request body with zod
    const parseResult = scriptRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }
    const { idea, tone, length } = parseResult.data;
    const numLength = Number(length);
    const lengthConfig = LENGTH_CONFIG[numLength];

    // Call service, expecting structured output from OpenAI (JSON object)
    const result = await generateValidatedScript({
      idea: idea.trim(),
      tone,
      lengthConfig,
      structured: true,
    });

    if (result.validation.needsRevision) {
      return res.status(502).json({
        error: 'The AI could not produce a compliant script after multiple revision passes. Please try again.',
      });
    }

    // Expecting result.script to be an object with script, wordCount, etc.
    // If not, fallback to old behavior
    if (typeof result.script === 'object' && result.script !== null && result.script.script) {
      return res.json(result.script);
    }

    // Fallback: legacy string output
    return res.json({
      script: result.script,
      wordCount: result.validation.wordCount,
      targetWordRange: {
        min: lengthConfig.minWords,
        max: lengthConfig.maxWords,
      },
      validation: {
        attempts: result.attempts,
        toneConsistent: result.validation.toneConsistent,
        relevantToIdea: result.validation.relevantToIdea,
        structureComplete: result.validation.structureComplete,
      },
    });
  } catch (err) {
    console.error('[generateScript]', err.message);

    if (err.type === 'timeout') {
      return res.status(504).json({ error: 'AI service timeout, please try again.' });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached, please wait a moment and try again.' });
    }
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'API key is invalid or missing.' });
    }

    return res.status(500).json({ error: 'Failed to generate script. Please try again.' });
  }
};
