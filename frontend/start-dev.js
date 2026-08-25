import { spawn } from 'child_process';

console.log('✅ Starting Vite Dev Server...');

const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'vite-dev'], {
    stdio: 'inherit',
    shell: true
});

child.on('error', (err) => {
    console.error('Failed to start Vite:', err);
});
