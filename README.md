# Underline

A Chrome extension for highlighting and annotating text from anywhere on the web, with AI-powered insights.

## Features

- **Highlight & Save** — Select any text on a webpage and save it with one click
- **AI Analysis** — Right-click to get AI-powered summaries, explanations, or counter-arguments
- **Smart Organization** — Highlights grouped by date (Today, Yesterday, This Week, Older)
- **Search** — Filter through your highlights instantly
- **Expand/Collapse** — Click cards to reveal full text and AI responses
- **Export to Google Docs** — One-click export with OAuth authentication
- **Export as Markdown** — Download your highlights as a .md file
- **Copy as HTML** — Paste directly into blogs or Notion

## Screenshots

![Underline Popup](screenshot.png)

## Tech Stack

- Chrome Extension (Manifest V3)
- Vanilla JavaScript
- Cohere AI API
- Google Docs API
- OAuth 2.0 Authentication

## Installation

1. Clone this repository
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the project folder

## Setup

### Cohere API Key
1. Get a free API key from [cohere.com](https://cohere.com)
2. Open `background.js` and add your key

### Google Docs Export (optional)
1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Docs API
3. Set up OAuth consent screen
4. Create OAuth credentials for a Chrome extension
5. Add your extension ID and update the client ID in `manifest.json`

## Usage

1. **Save a highlight:** Select text on any page → Click the "Save" button that appears
2. **AI analysis:** Select text → Right-click → Choose "Summarize", "Explain", or "Counter-argument"
3. **View highlights:** Click the extension icon in Chrome toolbar
4. **Export:** Click "View All" → Choose export format

## File Structure
