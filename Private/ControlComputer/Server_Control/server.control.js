const express = require('express');
const morgan = require('morgan');
const screenshot = require('screenshot-desktop');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

const baseDir = path.dirname(process.execPath);
const exePath = path.join(baseDir, '..', 'dist', 'server.exe');
const photoExePath = path.join(baseDir, '..', 'dist', 'takephoto.exe');
const imagePath = path.join(baseDir, 'latest_screenshot.jpg');
const photoOutput = path.join(baseDir, 'webcam_photo.png');
const configPath = path.join(baseDir, '..','accounts','credentials.json'); // 🟨 File chứa thông tin username/password

app.use(express.static(baseDir));
app.use(morgan('combined'));

let processRef = null;

// === Trang chính
app.get("/", (req, res) => {
  return res.sendFile(path.join(baseDir, "index.html"));
});

// === Bật EXE
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

// === Tắt EXE
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

// === Bật EXE sau vài phút
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

// === Chụp màn hình
app.get('/screenshot', async (req, res) => {
  try {
    await screenshot({ filename: imagePath });
    res.json({ status: 'captured', image: '/latest_screenshot.jpg' });
  } catch (err) {
    console.error('Screenshot error:', err);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

// === Chụp webcam
app.get('/takephoto', (req, res) => {
  exec(`"${photoExePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("Take photo error:", error.message);
      return res.status(500).json({ error: 'Failed to take photo' });
    }
    if (stderr) console.error("takephoto.exe stderr:", stderr);

    if (fs.existsSync(photoOutput)) {
      res.json({ status: 'captured', image: '/webcam_photo.png' });
    } else {
      res.status(500).json({ error: 'Photo not found after capture' });
    }
  });
});

// === 🟦 Cập nhật username + password
app.get('/update-credentials', (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const data = { username, password };

  try {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log("✅ Updated credentials:", data);
    res.json({ status: 'Credentials updated' });
  } catch (err) {
    console.error("❌ Error writing credentials:", err.message);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

app.get('/shutdown', (req, res) => {
  exec('shutdown /s /t 0', (error, stdout, stderr) => {
    if (error) {
      console.error('Shutdown error:', error.message);
      return res.status(500).json({ error: 'Failed to shutdown' });
    }
    res.json({ status: 'Shutting down...' });
  });
});
// === Khởi chạy server
app.listen(port, '0.0.0.0', () => {
  console.log(`Control server running on http://localhost:${port}`);
});
