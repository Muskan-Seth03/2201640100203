# URL Shortener Project

A complete URL shortener application with React frontend and Node.js backend.

## Features

- Shorten up to 5 URLs simultaneously
- Custom shortcodes (optional)
- Configurable validity periods
- Click analytics and statistics
- Material-UI responsive design
- Comprehensive logging

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup Steps

1. **Backend Setup:**
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:5000

2. **Frontend Setup (new terminal):**
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## API Endpoints

- `POST /shorturls` - Create short URL
- `GET /:shortcode` - Redirect to original URL
- `GET /api/urls` - Get all URLs with analytics
- `GET /shorturls/:shortcode` - Get statistics for a shortcode

## Usage

1. Open http://localhost:3000 in your browser
2. Enter URLs to shorten (up to 5 at once)
3. Optionally set validity period and custom shortcode
4. View statistics in the Statistics tab
5. Click on shortened URLs to redirect to original URLs

## Logging Middleware

The backend includes a reusable logging middleware module that sends structured logs to an external logging API.

The Log function signature:

```
Log(stack, level, package, message)
```

## Project Structure

```
├── backend/
│   ├── server.js             # Main Express server
│   ├── loggingMiddleware.js  # Logging middleware module
│   ├── logger.js             # Existing logger
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── URLShortener.js
│   │   │   └── Statistics.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## Testing

Use Postman, curl, or similar tools to test the API endpoints. Verify logs are sent to the external logging service.

## Screenshots

Attach your screenshots below:

1. ![Screenshot 1](images\shortenURLs.png)

2. ![Screenshot 2](images\URLStatistics.png)

---

