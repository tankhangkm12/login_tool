const express = require('express');
const morgan = require('morgan');
const screenshot = require('screenshot-desktop');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

// 🟩 Lấy thư mục thực tế chứa file thực thi .exe
const baseDir = path.dirname(process.execPath);

// 🟩 Dẫn đến file exe server cần điều khiển
const exePath = path.join(baseDir,'..', 'dist', 'server.exe');

// 🟩 Dùng thư mục thực để static và file HTML
const publicDir = baseDir;
const imagePath = path.join(publicDir, 'latest_screenshot.jpg');

app.use(express.static(publicDir));
app.use(morgan('combined'));

let processRef = null;

// === Serve trang chính
app.get("/", (req, res) => {
  return res.sendFile(path.join(publicDir, "index.html"));
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

// === Bật EXE sau một khoảng thời gian
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

// === API chụp màn hình
app.get('/screenshot', async (req, res) => {
  try {
    await screenshot({ filename: imagePath });
    res.json({ status: 'captured', image: '/latest_screenshot.jpg' });
  } catch (err) {
    console.error('Screenshot error:', err);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
});

// === Tự động bật EXE và chạy server
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
