const { getScriptFromOpenAI } = require('../services/openaiService');

const LENGTH_TO_WORDS = {
    1: 150,
    3: 400,
    5: 700,
    10: 1300
};

exports.generateScript = async (req, res) => {
    try {
        const { idea, tone, length } = req.body;
        if (!idea || !tone || !length) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const numLength = Number(length);
        const wordCount = LENGTH_TO_WORDS[numLength];
        if (!wordCount) {
            return res.status(400).json({ error: 'Invalid length.' });
        }
        const prompt = `You are a professional YouTube script writer.\n\nWrite a script based on:\nIdea: ${idea}\nTone: ${tone}\nTarget length: ${numLength} minutes (~${wordCount} words)\n\nRequirements:\n\n* Strong hook in first 2–3 lines\n* Clear storytelling structure\n* Engaging and natural tone\n* No fluff\n* Use paragraphs (not bullet points)\n\nReturn ONLY the script.`;
        const script = await getScriptFromOpenAI(prompt);
        res.json({ script });
    } catch (err) {
        if (err.type === 'timeout') {
            return res.status(504).json({ error: 'AI service timeout. Please try again.' });
        }
        res.status(500).json({ error: 'Failed to generate script.' });
    }
};
