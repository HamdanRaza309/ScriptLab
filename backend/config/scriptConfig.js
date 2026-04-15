const LENGTH_CONFIG = {
  1: {
    minutes: 1,
    targetWords: 150,
    minWords: 130,
    maxWords: 170,
    keySectionCount: 2,
  },
  3: {
    minutes: 3,
    targetWords: 415,
    minWords: 380,
    maxWords: 450,
    keySectionCount: 2,
  },
  5: {
    minutes: 5,
    targetWords: 700,
    minWords: 650,
    maxWords: 750,
    keySectionCount: 3,
  },
  10: {
    minutes: 10,
    targetWords: 1300,
    minWords: 1200,
    maxWords: 1400,
    keySectionCount: 4,
  },
};

const VALID_TONES = ['Dramatic', 'Neutral', 'Uplifting'];

const TONE_GUIDANCE = {
  Dramatic:
    'Emotionally intense, vivid, high-stakes, and story-driven while staying controlled and credible.',
  Neutral:
    'Informative, balanced, calm, and clear with an even-handed explanatory style.',
  Uplifting:
    'Positive, inspiring, encouraging, and forward-looking without sounding cheesy or generic.',
};

const GENERATION_SETTINGS = {
  generationTemperature: 0.4,
  revisionTemperature: 0.3,
  validationTemperature: 0.2,
  maxTokens: 3200,
  timeoutMs: 30000,
  maxAttempts: 5, // allow more retries
};

module.exports = {
  GENERATION_SETTINGS,
  LENGTH_CONFIG,
  TONE_GUIDANCE,
  VALID_TONES,
};
