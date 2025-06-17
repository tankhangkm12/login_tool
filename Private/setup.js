const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// ✅ Dùng process.execPath thay cho __dirname khi chạy từ file .exe đã đóng gói
const realAppDir = path.dirname(process.execPath);

// === Cấu hình các biến cần thiết ===
const domain = 'thanhtan.xyz';
const SUBDOMAIN = process.env.SUBDOMAIN || uuidv4();
const tunnelName = `control_computer_tunnel_${SUBDOMAIN.slice(0, 8)}`;

const configDir = path.join(os.homedir(), '.cloudflared');
const exeDir = path.join(realAppDir, 'ControlComputer');
const configPath = path.join(exeDir, 'config.yml');
const cloudflaredPath = path.join(exeDir, 'cloudflared-windows-amd64.exe');

// === Kiểm tra xem cloudflared.exe có tồn tại không ===
if (!fs.existsSync(cloudflaredPath)) {
  console.error('❌ Lỗi: Không tìm thấy file cloudflared tại:', cloudflaredPath);
  process.exit(1);
}

console.log('✅ Đang tạo tunnel bằng Cloudflare:', cloudflaredPath);

// === Tạo tunnel mới ===
execSync(`${cloudflaredPath} tunnel create ${tunnelName}`, { stdio: 'inherit' });

// === Lấy danh sách tunnel hiện tại ===
const tunnelListJson = execSync(`${cloudflaredPath} tunnel list --output json`).toString();
const tunnels = JSON.parse(tunnelListJson);
const tunnel = tunnels.find(t => t.name === tunnelName);

if (!tunnel) {
  console.error('❌ Tunnel không được tạo.');
  process.exit(1);
}

const tunnelId = tunnel.id;
const credentialPath = path.join(configDir, `${tunnelId}.json`);

// === Viết file config.yml cho cloudflared ===
const config = {
  tunnel: tunnelId,
  'credentials-file': credentialPath,
  ingress: [
    {
      hostname: `${SUBDOMAIN}.${domain}`,
      service: 'http://localhost:3000'
    },
    {
      service: 'http_status:404'
    }
  ]
};

fs.writeFileSync(configPath, yaml.dump(config), 'utf8');

// === Lưu thông tin tunnel vào thư mục infotunnel ===
const infoDir = path.join(exeDir, 'infotunnel');
if (!fs.existsSync(infoDir)) {
  fs.mkdirSync(infoDir);
}

const tunnelInfo = {
  domain: domain,
  subdomain: SUBDOMAIN,
  cfargotunnel: `${tunnelId}.cfargotunnel.com`
};

const infoPath = path.join(infoDir, `${SUBDOMAIN}.json`);
fs.writeFileSync(infoPath, JSON.stringify(tunnelInfo, null, 2), 'utf8');

console.log('✅ Tunnel đã tạo thành công:');
console.log(tunnelInfo);
