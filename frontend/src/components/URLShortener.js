import React, { useState } from 'react';
import {
  Paper, TextField, Button, Grid, Typography, Alert, Card, CardContent,
  Box, Chip, IconButton
} from '@mui/material';
import { ContentCopy, Delete } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

function URLShortener() {
  const [urls, setUrls] = useState([{ url: '', validity: 30, shortcode: '' }]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', validity: 30, shortcode: '' }]);
    }
  };

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const validateInputs = () => {
    for (let i = 0; i < urls.length; i++) {
      const { url, validity } = urls[i];
      
      if (!url.trim()) {
        setError(`URL ${i + 1} is required`);
        return false;
      }
      
      try {
        new URL(url);
      } catch {
        setError(`URL ${i + 1} is not valid`);
        return false;
      }
      
      if (validity && (!Number.isInteger(Number(validity)) || Number(validity) <= 0)) {
        setError(`Validity for URL ${i + 1} must be a positive integer`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateInputs()) return;
    
    setLoading(true);
    const newResults = [];
    
    try {
      for (const urlData of urls) {
        const response = await axios.post(`${API_BASE}/shorturls`, {
          url: urlData.url,
          validity: Number(urlData.validity) || 30,
          shortcode: urlData.shortcode || undefined
        });
        
        newResults.push({
          originalUrl: urlData.url,
          shortLink: response.data.shortLink,
          expiry: response.data.expiry
        });
      }
      
      setResults(newResults);
      setUrls([{ url: '', validity: 30, shortcode: '' }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create short URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {urls.map((urlData, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label={`URL ${index + 1}`}
                value={urlData.url}
                onChange={(e) => updateUrl(index, 'url', e.target.value)}
                placeholder="https://example.com"
                required
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Validity (min)"
                type="number"
                value={urlData.validity}
                onChange={(e) => updateUrl(index, 'validity', e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Custom Code"
                value={urlData.shortcode}
                onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                placeholder="optional"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <IconButton 
                onClick={() => removeUrlField(index)}
                disabled={urls.length === 1}
                color="error"
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        
        <Box sx={{ mt: 2 }}>
          <Button 
            onClick={addUrlField} 
            disabled={urls.length >= 5}
            sx={{ mr: 2 }}
          >
            Add URL ({urls.length}/5)
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Shorten URLs'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Shortened URLs
          </Typography>
          {results.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original: {result.originalUrl}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1">
                    {result.shortLink}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => copyToClipboard(result.shortLink)}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                <Chip 
                  label={`Expires: ${new Date(result.expiry).toLocaleString()}`}
                  size="small"
                  color="primary"
                />
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default URLShortener;