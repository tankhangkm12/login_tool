const express = require('express');
const morgan = require('morgan');
const screenshot = require('screenshot-desktop');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;
const exePath = path.join(__dirname, '..', 'dist','server.exe');
console.log(exePath)

app.use(express.static(__dirname));
app.use(morgan('combined'));

let processRef = null;

// Serve main page
app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "index.html"));
});

// Start the EXE
app.get('/turnon', (req, res) => {
  if (processRef) return res.json({ status: 'already running' });

  processRef = spawn(exePath, [], { detached: true, stdio: 'ignore' });
  processRef.unref();

  processRef.on('exit', (code) => {
    console.log(`App exited with code ${code}`);
    processRef = null;
  });

  return res.json({ status: 'started' });
});

// Kill the EXE
app.get('/turnoff', (req, res) => {
  if (!processRef) return res.json({ status: 'not running' });

  try {
    process.kill(-processRef.pid);
    processRef = null;
    return res.json({ status: 'killed' });
  } catch (err) {
    console.error(err);
    exec('taskkill /f /im server.exe', () => {
      processRef = null;
      return res.json({ status: 'killed with taskkill' });
    });
  }
});

// Start with delay
app.get('/turnon/:time', (req, res) => {
  const minutes = parseFloat(req.params.time) || 0;
  const delayMs = minutes * 60 * 1000;

  if (processRef) return res.json({ status: 'already running' });

  setTimeout(() => {
    if (processRef) return;

    processRef = spawn(exePath, [], { detached: true, stdio: 'ignore' });
    processRef.unref();

    processRef.on('exit', (code) => {
      console.log(`App exited with code ${code}`);
      processRef = null;
    });

    console.log(`EXE started after ${minutes} minutes.`);
  }, delayMs);

  return res.json({ status: `will start in ${minutes} minute(s)` });
});

// Screenshot API
app.get('/screenshot', async (req, res) => {
  const imagePath = path.join(__dirname, 'latest_screenshot.jpg');
  try {
    await screenshot({ filename: imagePath });
    res.json({ status: 'captured', image: '/latest_screenshot.jpg' });
  } catch (err) {
    console.error('Screenshot error:', err);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

// Auto-start app and listen
app.listen(port, '0.0.0.0', () => {
  console.log(`Control server running on http://localhost:${port}`);
  if (!processRef) {
    processRef = spawn(exePath, [], { detached: true, stdio: 'ignore' });
    processRef.unref();
    processRef.on('exit', (code) => {
      console.log(`App exited with code ${code}`);
      processRef = null;
    });
    console.log("EXE auto-started with control server.");
  }
});
