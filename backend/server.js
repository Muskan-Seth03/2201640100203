const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const { Log } = require('./loggingMiddleware');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory storage
const urlDatabase = new Map();
const analytics = new Map();

// Middleware for logging
app.use(async (req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  try {
    await Log(
      'backend',
      'info',
      'middleware',
      `Request received: ${req.method} ${req.path} from IP ${req.ip}`
    );
  } catch (error) {
    console.error('Logging middleware error:', error.message);
  }
  next();
});

// Generate unique shortcode
function generateShortcode(customCode = null) {
  if (customCode) {
    if (urlDatabase.has(customCode)) {
      throw new Error('Shortcode already exists');
    }
    return customCode;
  }
  
  let shortcode;
  do {
    shortcode = Math.random().toString(36).substring(2, 8);
  } while (urlDatabase.has(shortcode));
  
  return shortcode;
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    if (!url || !isValidUrl(url)) {
      logger.warn('Invalid URL provided', { url });
      await Log('backend', 'warn', 'handler', `Invalid URL provided: ${url}`);
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    if (validity && (!Number.isInteger(validity) || validity <= 0)) {
      logger.warn('Invalid validity period', { validity });
      await Log('backend', 'warn', 'handler', `Invalid validity period: ${validity}`);
      return res.status(400).json({ error: 'Validity must be a positive integer' });
    }
    
    const generatedShortcode = generateShortcode(shortcode);
    const expiryDate = new Date(Date.now() + validity * 60 * 1000);
    
    urlDatabase.set(generatedShortcode, {
      originalUrl: url,
      createdAt: new Date(),
      expiryDate,
      clicks: 0
    });
    
    analytics.set(generatedShortcode, []);
    
    logger.info('Short URL created', { 
      shortcode: generatedShortcode, 
      originalUrl: url,
      validity 
    });
    await Log('backend', 'info', 'handler', `Short URL created: ${generatedShortcode} for ${url} with validity ${validity} minutes`);
    
    res.status(201).json({
      shortLink: `http://localhost:${PORT}/${generatedShortcode}`,
      expiry: expiryDate.toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating short URL', { error: error.message });
    await Log('backend', 'error', 'handler', `Error creating short URL: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlData = urlDatabase.get(shortcode);
    
    if (!urlData) {
      logger.warn('Shortcode not found', { shortcode });
      await Log('backend', 'warn', 'handler', `Shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    if (new Date() > urlData.expiryDate) {
      logger.warn('Expired shortcode accessed', { shortcode });
      await Log('backend', 'warn', 'handler', `Expired shortcode accessed: ${shortcode}`);
      return res.status(410).json({ error: 'Short URL has expired' });
    }
    
    // Update analytics
    urlData.clicks++;
    const clickData = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer') || 'Direct'
    };
    
    analytics.get(shortcode).push(clickData);
    
    logger.info('URL accessed', { 
      shortcode, 
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks 
    });
    await Log('backend', 'info', 'handler', `URL accessed: ${shortcode}, total clicks: ${urlData.clicks}`);
    
    res.redirect(urlData.originalUrl);
    
  } catch (error) {
    logger.error('Error redirecting URL', { error: error.message });
    await Log('backend', 'error', 'handler', `Error redirecting URL: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/urls', async (req, res) => {
  try {
    const urls = Array.from(urlDatabase.entries()).map(([shortcode, data]) => ({
      shortcode,
      shortLink: `http://localhost:${PORT}/${shortcode}`,
      originalUrl: data.originalUrl,
      createdAt: data.createdAt,
      expiryDate: data.expiryDate,
      clicks: data.clicks,
      clickDetails: analytics.get(shortcode) || []
    }));
    
    logger.info('URLs list requested', { count: urls.length });
    await Log('backend', 'info', 'handler', `URLs list requested, count: ${urls.length}`);
    res.json(urls);
    
  } catch (error) {
    logger.error('Error fetching URLs', { error: error.message });
    await Log('backend', 'error', 'handler', `Error fetching URLs: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    const urlData = urlDatabase.get(shortcode);
    const clickData = analytics.get(shortcode);

    if (!urlData) {
      logger.warn('Shortcode not found for statistics', { shortcode });
      await Log('backend', 'warn', 'handler', `Shortcode not found for statistics: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const stats = {
      shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiryDate: urlData.expiryDate,
      clicks: urlData.clicks,
      clickDetails: clickData || []
    };

    logger.info('Shortcode statistics requested', { shortcode });
    await Log('backend', 'info', 'handler', `Shortcode statistics requested: ${shortcode}`);
    res.json(stats);

  } catch (error) {
    logger.error('Error fetching shortcode statistics', { error: error.message });
    await Log('backend', 'error', 'handler', `Error fetching shortcode statistics: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  await Log('backend', 'info', 'service', `Server running on port ${PORT}`);
});
