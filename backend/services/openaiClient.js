const axios = require('axios');
const { GENERATION_SETTINGS } = require('../config/scriptConfig');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. API calls will fail.');
}

function getMessageContent(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text || '')
      .join('')
      .trim();
  }

  return typeof content === 'string' ? content.trim() : '';
}

async function createChatCompletion({
  messages,
  temperature = GENERATION_SETTINGS.generationTemperature,
  maxTokens = GENERATION_SETTINGS.maxTokens,
  responseFormat,
}) {
  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: OPENAI_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Bypass broken local proxy env vars so API calls go directly to OpenAI.
        proxy: false,
        timeout: GENERATION_SETTINGS.timeoutMs,
      }
    );

    const content = getMessageContent(response.data);
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return content;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      const error = new Error('OpenAI request timed out');
      error.type = 'timeout';
      throw error;
    }

    if (err.response) {
      const apiError = new Error(
        err.response.data?.error?.message || 'OpenAI API error'
      );
      apiError.response = err.response;
      throw apiError;
    }

    throw err;
  }
}

async function createJsonCompletion(options) {
  const content = await createChatCompletion({
    ...options,
    responseFormat: { type: 'json_object' },
  });

  try {
    return JSON.parse(content);
  } catch (error) {
    const parseError = new Error('Invalid JSON response from OpenAI');
    parseError.cause = error;
    throw parseError;
  }
}

module.exports = {
  createChatCompletion,
  createJsonCompletion,
};
