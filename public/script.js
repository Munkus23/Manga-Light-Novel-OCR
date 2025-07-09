const apiKeyInput = document.getElementById('apiKey');
const imageLoader = document.getElementById('imageLoader');
const uploadBtn = document.getElementById('uploadBtn');
const translateBtn = document.getElementById('translateBtn');
const resultText = document.getElementById('resultText');
const exportTxtBtn = document.getElementById('exportTxtBtn');
const exportXlsxBtn = document.getElementById('exportXlsxBtn');
const ocrTesseract = document.getElementById('ocrTesseract');
const ocrGeminiApi = document.getElementById('ocrGeminiApi');
const geminiModelSelect = document.getElementById('geminiModel');
const tesseractLanguageSelect = document.getElementById('tesseractLanguage');

uploadBtn.addEventListener('click', () => {
    const file = imageLoader.files[0];
    if (!file) {
        alert('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const imageData = reader.result; // Base64 encoded image data
        const ocrEngine = ocrTesseract.checked ? 'tesseract' : 'geminiApi';
        const geminiModel = geminiModelSelect.value;
        const tesseractLanguage = tesseractLanguageSelect.value;

        fetch('/.netlify/functions/ocr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData, ocrEngine: ocrEngine, geminiModel: geminiModel, tesseractLanguage: tesseractLanguage })
        })
    .then(response => response.text())
    .then(text => {
        resultText.value = text;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing image.');
    });
});

translateBtn.addEventListener('click', () => {
    const text = resultText.value;
    if (!text) {
        alert('No text to translate.');
        return;
    }

    fetch('/.netlify/functions/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text, geminiModel: geminiModelSelect.value })
    })
    .then(response => response.text())
    .then(translatedText => {
        resultText.value = translatedText;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error translating text.');
    });
});

exportTxtBtn.addEventListener('click', () => {
    const text = resultText.value;
    if (!text) {
        alert('No text to export.');
        return;
    }

    fetch('/export-txt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error exporting to .txt');
    });
});

exportXlsxBtn.addEventListener('click', () => {
    const text = resultText.value;
    if (!text) {
        alert('No text to export.');
        return;
    }

    fetch('/export-xlsx', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error exporting to .xlsx');
    });
});