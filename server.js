const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const Tesseract = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create the 'uploads' directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Helper function to convert image to a format suitable for Gemini API
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString('base64'),
            mimeType
        },
    };
}

// Route to handle file uploads and OCR
app.post('/upload', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;
    const ocrEngine = req.body.ocrEngine;
    const apiKey = process.env.GEMINI_API_KEY; // Read API key from environment variable
    const geminiModel = req.body.geminiModel;

    if (ocrEngine === 'tesseract') {
        try {
            const { data: { text } } = await Tesseract.recognize(
                imagePath,
                'jpn', // Japanese language
                { logger: m => console.log(m) } // Optional: log OCR progress
            );
            res.send(text);
        } catch (error) {
            console.error('Tesseract OCR error:', error);
            res.status(500).send('Error processing image with Tesseract.');
        }
    } else if (ocrEngine === 'geminiApi') {
        if (!apiKey) {
            return res.status(400).send('Gemini API Key not found. Please set the GEMINI_API_KEY environment variable.');
        }
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: geminiModel });

            const imageParts = [
                fileToGenerativePart(imagePath, req.file.mimetype),
            ];

            const result = await model.generateContent(["Extract all text from this image in Japanese:", ...imageParts]);
            const response = await result.response;
            const text = response.text();
            res.send(text);
        } catch (error) {
            console.error('Gemini API OCR error:', error);
            res.status(500).send('Error processing image with Gemini API.');
        }
    } else {
        res.status(400).send('Invalid OCR engine selected.');
    }
});

// Route to handle translation
app.post('/translate', async (req, res) => {
    const text = req.body.text;
    const apiKey = process.env.GEMINI_API_KEY; // Read API key from environment variable
    const geminiModel = req.body.geminiModel;

    if (!apiKey) {
        return res.status(400).send('Gemini API Key not found. Please set the GEMINI_API_KEY environment variable.');
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: geminiModel });

        const result = await model.generateContent(`Translate the following Japanese text to English: ${text}`);
        const response = await result.response;
        const translatedText = response.text();
        res.send(translatedText);
    } catch (error) {
        console.error('Gemini API Translation error:', error);
        res.status(500).send('Error translating text with Gemini API.');
    }
});

// Route to export text to a .txt file
app.post('/export-txt', (req, res) => {
    const text = req.body.text;
    const filePath = path.join(__dirname, 'public', 'export.txt');
    fs.writeFileSync(filePath, text);
    res.download(filePath);
});

// Route to export text to an .xlsx file
app.post('/export-xlsx', (req, res) => {
    const text = req.body.text;
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([[text]]);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'OCR Result');
    const filePath = path.join(__dirname, 'public', 'export.xlsx');
    xlsx.writeFile(workbook, filePath);
    res.download(filePath);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});