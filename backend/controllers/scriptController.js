const { generateScript } = require('../services/openaiService');

/** Map user-facing length (minutes) to approximate word count */
const LENGTH_TO_WORDS = {
  1: 150,
  3: 400,
  5: 700,
  10: 1300,
};

const VALID_TONES = ['Dramatic', 'Neutral', 'Uplifting', 'Humorous', 'Educational'];

/**
 * POST /api/generate-script
 * Body: { idea: string, tone: string, length: number }
 */
exports.generateScript = async (req, res) => {
  try {
    const { idea, tone, length } = req.body;
    console.log(idea, tone, length);


    // Validation
    if (!idea || !tone || !length) {
      return res.status(400).json({ error: 'All fields (idea, tone, length) are required.' });
    }

    const trimmedIdea = String(idea).trim();
    if (trimmedIdea.length < 5) {
      return res.status(400).json({ error: 'Please provide a more detailed idea (at least 5 characters).' });
    }

    if (!VALID_TONES.includes(tone)) {
      return res.status(400).json({ error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` });
    }

    const numLength = Number(length);
    const wordCount = LENGTH_TO_WORDS[numLength];
    if (!wordCount) {
      return res.status(400).json({ error: 'Invalid length. Choose 1, 3, 5, or 10 minutes.' });
    }

    const prompt = [
      'You are a professional YouTube script writer.',
      '',
      `Write a script based on:`,
      `Idea: ${trimmedIdea}`,
      `Tone: ${tone}`,
      `Target length: ${numLength} minutes (~${wordCount} words)`,
      '',
      'Requirements:',
      '- Strong hook in the first 2–3 lines',
      '- Clear storytelling structure (intro, body, conclusion)',
      '- Engaging and natural tone matching the requested style',
      '- No filler or fluff',
      '- Use paragraphs, not bullet points',
      '- Include natural transitions between sections',
      '',
      'Return ONLY the script text, no titles or labels.',
    ].join('\n');

    const script = await generateScript(prompt);
    res.json({ script });
  } catch (err) {
    console.error('[generateScript]', err.message);

    if (err.type === 'timeout') {
      return res.status(504).json({ error: 'AI service timeout — please try again.' });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached — please wait a moment and try again.' });
    }
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'API key is invalid or missing.' });
    }

    res.status(500).json({ error: 'Failed to generate script. Please try again.' });
  }
};
