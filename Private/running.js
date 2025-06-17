const { exec } = require('child_process');
const path = require('path');
const exeDir = path.join(__dirname,'ControlComputer')
const serverDir = path.join(exeDir, 'Server_Control');
exec(`start "" /b cmd /c "cd /d ${serverDir} && npm start >nul 2>&1"`);

setTimeout(() => {
  exec(`start "" /b cmd /c "cd /d ${exeDir} && cloudflared-windows-amd64 tunnel --config config.yml run"`);
}, 3000);
