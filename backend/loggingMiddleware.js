const fetch = require('node-fetch');

const LOG_API_URL = 'http://20.244.56.144/evaluation-service/logs';

// Allowed values for validation
const allowedStacks = ['backend', 'frontend'];
const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
const allowedPackages = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service',
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style',
  'auth',
  'config',
  'middleware',
  'utils'
];

// Reusable Log function
async function Log(stack, level, packageName, message) {
  try {
    // Validate inputs
    if (!allowedStacks.includes(stack.toLowerCase())) {
      throw new Error(`Invalid stack value: ${stack}`);
    }
    if (!allowedLevels.includes(level.toLowerCase())) {
      throw new Error(`Invalid level value: ${level}`);
    }
    if (!allowedPackages.includes(packageName.toLowerCase())) {
      throw new Error(`Invalid package value: ${packageName}`);
    }

    const payload = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message
    };

    const response = await fetch(LOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add auth headers here if needed
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send log: ${response.status} - ${errorText}`);
    } else {
      const data = await response.json();
      console.info(`Log sent successfully: ${data.message}`);
    }
  } catch (error) {
    console.error(`Logging error: ${error.message}`);
  }
}

module.exports = { Log };
