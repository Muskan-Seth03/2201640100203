import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material';
import URLShortener from './components/URLShortener';
import Statistics from './components/Statistics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Shorten URLs" />
          <Tab label="Statistics" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <URLShortener />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Statistics />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;