import { spawn } from 'child_process';

console.log('====================================================');
console.log('Starting Raahi AI Safety Companion (Backend + Frontend)');
console.log('====================================================');

const isWin = process.platform === 'win32';
const nodeBin = isWin ? 'node.exe' : 'node';

const backend = spawn(nodeBin, ['server/index.js'], { stdio: 'inherit' });
const frontend = spawn(nodeBin, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' });

backend.on('error', (err) => console.error('Backend error:', err));
frontend.on('error', (err) => console.error('Frontend error:', err));

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
