const { execSync } = require('child_process');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const domain = 'thanhtan.xyz';
const SUBDOMAIN = process.env.SUBDOMAIN || uuidv4();
const tunnelName = `control_computer_tunnel_${SUBDOMAIN.slice(0, 8)}`;
const configDir = path.join(os.homedir(), '.cloudflared');
const exeDir = __dirname+'\\ControlComputer';
const configPath = path.join(exeDir, 'config.yml');

execSync(`cloudflared tunnel create ${tunnelName}`, { stdio: 'inherit' });

const tunnelListJson = execSync('cloudflared tunnel list --output json').toString();
const tunnels = JSON.parse(tunnelListJson);
const tunnel = tunnels.find(t => t.name === tunnelName);

if (!tunnel) {
  process.exit(1);
}

const tunnelId = tunnel.id;
const credentialPath = path.join(configDir, `${tunnelId}.json`);

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
// === Save tunnel info to infotunnel folder ===
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
