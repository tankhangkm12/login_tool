const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 🟩 Lấy thư mục thật chứa file EXE đã đóng gói (pkg)
const baseDir = path.dirname(process.execPath);

// === Các đường dẫn ===
const exeDir = path.join(baseDir, 'ControlComputer');
const serverExePath = path.join(exeDir, 'Server_Control','server_control.exe'); // bạn cần xác nhận tên đúng
const cloudflaredExe = path.join(exeDir, 'cloudflared-windows-amd64.exe');
const configPath = path.join(exeDir, 'config.yml');

// === Kiểm tra server_control.exe tồn tại ===
if (!fs.existsSync(serverExePath)) {
  console.error('File server_control.exe không tồn tại tại:', serverExePath);
} else {
  // === Chạy server_control.exe (ẩn cửa sổ) ===
  exec(`start "" /b "${serverExePath}"`, (err) => {
    if (err) console.error('Lỗi khi chạy server_control.exe:', err);
  });
}

// === Sau 3s, chạy Cloudflare Tunnel ===
setTimeout(() => {
  if (!fs.existsSync(cloudflaredExe)) {
    console.error('File cloudflared không tồn tại tại:', cloudflaredExe);
    return;
  }

  exec(`start "" /b cmd /c "cd /d ${exeDir} && ${cloudflaredExe} --config ${configPath} tunnel run"`, (err) => {
    if (err) console.error('Lỗi khi chạy cloudflared tunnel:', err);
  });
}, 3000);
