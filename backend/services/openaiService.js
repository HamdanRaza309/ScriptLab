const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  console.warn('⚠ OPENAI_API_KEY is not set — API calls will fail.');
}

/**
 * Send a prompt to OpenAI and return the generated text.
 * @param {string} prompt - The user prompt to send
 * @returns {Promise<string>} The generated script text
 */
exports.generateScript = async (prompt) => {
  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert YouTube script writer. You write engaging, well-structured scripts that keep viewers watching.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds — gives GPT-4o more room
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return content.trim();
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      const error = new Error('OpenAI request timed out');
      error.type = 'timeout';
      throw error;
    }

    // Preserve axios response for upstream error handling
    if (err.response) {
      const apiError = new Error(
        err.response.data?.error?.message || 'OpenAI API error'
      );
      apiError.response = err.response;
      throw apiError;
    }

    throw err;
  }
};
