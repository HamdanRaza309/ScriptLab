const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

exports.getScriptFromOpenAI = async (prompt) => {
    try {
        const response = await axios.post(
            OPENAI_URL,
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 2048,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 20000 // 20 seconds
            }
        );
        const script = response.data.choices[0].message.content.trim();
        return script;
    } catch (err) {
        if (err.code === 'ECONNABORTED') {
            const error = new Error('Timeout');
            error.type = 'timeout';
            throw error;
        }
        throw err;
    }
};
