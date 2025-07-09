const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const text = body.text;
        const apiKey = process.env.GEMINI_API_KEY;
        const geminiModel = body.geminiModel;

        if (!text) {
            return { statusCode: 400, body: 'Text to translate is required.' };
        }

        if (!apiKey) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Gemini API Key not found. Please set the GEMINI_API_KEY environment variable.' }) };
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent(`Translate the following Japanese text to English: ${text}`);
            const response = await result.response;
            const translatedText = response.text();
            return {
                statusCode: 200,
                body: JSON.stringify({ translatedText: translatedText }),
            };
        } catch (error) {
            console.error('Gemini API Translation error:', error);
            return { statusCode: 500, body: JSON.stringify({ error: 'Error translating text with Gemini API.' }) };
        }
    } catch (error) {
        console.error('Function error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error.' }) };
    }
};
