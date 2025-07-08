# Gemini OCR & Translation Web Server

This project provides a web-based interface for performing Optical Character Recognition (OCR) on Japanese images (like manga or light novels) and translating the extracted text to English. It leverages either Tesseract.js for local OCR or the Google Gemini API for more advanced OCR and translation capabilities.

## Features

*   **Image Upload:** Upload Japanese image files (PNG, JPEG, JPG, WEBP).
*   **OCR Engine Selection:** Choose between:
    *   **Tesseract.js:** Performs OCR locally on the server. No API key required for OCR.
    *   **Gemini API:** Uses Google's Gemini models for OCR and translation. Requires a Gemini API key.
*   **Editable Text Output:** Review and correct OCR results directly in the browser.
*   **Translation:** Translate the extracted Japanese text to English using the Gemini API.
*   **Export Options:** Export the processed text to `.txt` or `.xlsx` (Excel) files.

## Setup

To set up and run this project locally, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone <your-repo-url>
    cd gemini-ocr-server
    ```
    (Note: Replace `<your-repo-url>` with the actual URL of your GitHub repository once you create it.)

2.  **Install Node.js Dependencies:**
    ```bash
    npm install
    ```

3.  **Google Gemini API Key (Optional, for Gemini API features):**
    If you plan to use the "Gemini API" option for OCR and translation, you will need a Google Gemini API key.
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to create or retrieve your API key.
    *   **Crucially, set your API key as an environment variable named `GEMINI_API_KEY`.**
        *   **Linux/macOS:**
            ```bash
            export GEMINI_API_KEY="YOUR_API_KEY_HERE"
            ```
            (Replace `YOUR_API_KEY_HERE` with your actual key. For persistent setting, add this line to your `~/.bashrc`, `~/.zshrc`, or equivalent shell profile file.)
        *   **Windows (Command Prompt):**
            ```cmd
            set GEMINI_API_KEY="YOUR_API_KEY_HERE"
            ```
        *   **Windows (PowerShell):**
            ```powershell
            $env:GEMINI_API_KEY="YOUR_API_KEY_HERE"
            ```
        *   **For Deployment Platforms (e.g., Vercel, Render, Heroku):** Refer to your platform's documentation on how to set environment variables securely.

## Running the Application

Once the dependencies are installed and your `GEMINI_API_KEY` (if applicable) is set, you can start the server:

```bash
node server.js
```

The server will start on `http://localhost:3000`.

## Usage

1.  Open your web browser and navigate to `http://localhost:3000`.
2.  **Select OCR Engine:** Choose "Tesseract.js" for local OCR or "Gemini API" to use Google's Gemini models.
3.  **Select Gemini Model (if using Gemini API):** Choose your preferred Gemini model from the dropdown.
4.  **Upload Image:** Click "Choose File" and select a Japanese image (PNG, JPEG, JPG, WEBP).
5.  **Perform OCR:** Click "Upload & OCR". The extracted text will appear in the text area.
6.  **Edit Text:** You can directly edit the text in the text area to correct any OCR errors.
7.  **Translate:** Click "Translate to English" to get the English translation (uses Gemini API).
8.  **Export:** Use the "Export as .txt" or "Export as .xlsx" buttons to save the text.

## Deployment Considerations

*   **API Key Security:** As mentioned, always use environment variables for your API keys. Never commit them directly to your code repository.
*   **Rate Limits:** Be mindful of Google Gemini API rate limits. If you anticipate high usage, consider implementing caching or other strategies to optimize API calls.
*   **Hosting:** This is a Node.js application, so it can be hosted on various platforms that support Node.js (e.g., Vercel, Render, Heroku, AWS, Google Cloud).
