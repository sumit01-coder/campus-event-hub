import readline from 'readline';
import { spawn } from 'child_process';
import crypto from 'crypto';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const EXPECTED_HASH = '1f6c49cc8b7fdb2c8f85f1c4e97eb3f1737e8c3b77be32bc9d5926ec0e0db129'; // SHA-256 for 'sumitpatel123'

rl.question('Enter Developer Password to start the frontend: ', (password) => {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (hash === EXPECTED_HASH) {
        console.log('✅ Access Granted. Starting Vite Dev Server...');
        rl.close();
        
        const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'vite-dev'], {
            stdio: 'inherit',
            shell: true
        });
        
        child.on('error', (err) => {
            console.error('Failed to start Vite:', err);
        });
    } else {
        console.error('❌ ACCESS DENIED: Invalid Password.');
        process.exit(1);
    }
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};
rl.stdoutMuted = true;
