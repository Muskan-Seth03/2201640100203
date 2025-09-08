import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Card, CardContent, Grid, Chip, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

function Statistics() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/urls`);
      setUrls(response.data);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>
      
      {urls.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No URLs created yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {urls.map((url, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {url.shortLink}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Original: {url.originalUrl}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Created: ${new Date(url.createdAt).toLocaleString()}`}
                      size="small"
                    />
                    <Chip 
                      label={`Expires: ${new Date(url.expiryDate).toLocaleString()}`}
                      size="small"
                      color={new Date() > new Date(url.expiryDate) ? 'error' : 'success'}
                    />
                    <Chip 
                      label={`Clicks: ${url.clicks}`}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  {url.clickDetails.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Click Details ({url.clickDetails.length})</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell>User Agent</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {url.clickDetails.map((click, clickIndex) => (
                                <TableRow key={clickIndex}>
                                  <TableCell>
                                    {new Date(click.timestamp).toLocaleString()}
                                  </TableCell>
                                  <TableCell>{click.referer}</TableCell>
                                  <TableCell>
                                    {click.userAgent.substring(0, 50)}...
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Statistics;