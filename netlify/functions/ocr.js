const { GoogleGenerativeAI } = require('@google/generative-ai');
const Tesseract = require('tesseract.js');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const imageData = body.image; // Base64 encoded image data
        const ocrEngine = body.ocrEngine;
        const geminiModel = body.geminiModel;
        const tesseractLanguage = body.tesseractLanguage || 'jpn'; // Default to jpn if not provided
        const apiKey = process.env.GEMINI_API_KEY;

        if (!imageData) {
            return { statusCode: 400, body: 'Image data is required.' };
        }

        // Convert base64 image data to a Buffer for Tesseract.js
        const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');

        if (ocrEngine === 'tesseract') {
            try {
                const { data: { text } } = await Tesseract.recognize(
                    imageBuffer,
                    tesseractLanguage, // Use the selected language
                    { logger: m => console.log(m) } // Optional: log OCR progress
                );
                return {
                    statusCode: 200,
                    body: JSON.stringify({ text: text }),
                };
            } catch (error) {
                console.error('Tesseract OCR error:', error);
                return { statusCode: 500, body: JSON.stringify({ error: 'Error processing image with Tesseract.' }) };
            }
        } else if (ocrEngine === 'geminiApi') {
            if (!apiKey) {
                return { statusCode: 400, body: JSON.stringify({ error: 'Gemini API Key not found. Please set the GEMINI_API_KEY environment variable.' }) };
            }
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: geminiModel });

                const mimeType = imageData.split(';')[0].split(':')[1];
                const imageParts = [
                    {
                        inlineData: {
                            data: imageData.split(',')[1],
                            mimeType: mimeType
                        },
                    },
                ];

                const result = await model.generateContent(["Extract all text from this image in Japanese:", ...imageParts]);
                const response = await result.response;
                const text = response.text();
                return {
                    statusCode: 200,
                    body: JSON.stringify({ text: text }),
                };
            } catch (error) {
                console.error('Gemini API OCR error:', error);
                return { statusCode: 500, body: JSON.stringify({ error: 'Error processing image with Gemini API.' }) };
            }
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid OCR engine selected.' }) };
        }
    } catch (error) {
        console.error('Function error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error.' }) };
    }
};
