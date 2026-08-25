import readline from 'readline';
import { spawn } from 'child_process';
import crypto from 'crypto';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const EXPECTED_HASH = 'f88457c01a328e71cb972fb9d821df264e91717f533c37ef62b44f25ac870138'; // SHA-256 for 'sumitpatel123'

rl.question('Enter Developer Password to start the frontend: ', (password) => {
    const hash = crypto.createHash('sha256').update(password.trim()).digest('hex');
    
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
