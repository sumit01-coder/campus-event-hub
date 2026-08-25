const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const readline = require('readline');

const coreEncPath = path.join(__dirname, 'core.enc');

if (!fs.existsSync(coreEncPath)) {
    console.error('CRITICAL ERROR: core.enc is missing. The project is corrupted.');
    process.exit(1);
}

const payloadStr = fs.readFileSync(coreEncPath, 'utf8');
const payload = JSON.parse(payloadStr);

function bootServer(password) {
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = Buffer.from(payload.iv, 'hex');
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        
        let decrypted = decipher.update(payload.content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        console.log('✅ Access Granted. Starting Application Engine...');
        
        // Execute the decrypted source code
        const Module = require('module');
        const m = new Module(path.join(__dirname, 'core.js'), module);
        m.filename = path.join(__dirname, 'core.js');
        m.paths = Module._nodeModulePaths(__dirname);
        m._compile(decrypted, m.filename);
        
    } catch (error) {
        console.error('❌ ACCESS DENIED: Invalid Password or Corrupted File.');
        console.error('Actual Error:', error);
        process.exit(1);
    }
}

// Check for cloud environment variable first
if (process.env.DEVELOPER_PASSWORD) {
    console.log('☁️ Cloud Environment Detected. Booting from Environment Variable...');
    bootServer(process.env.DEVELOPER_PASSWORD);
} else {
    // If running locally, prompt via terminal
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter Developer Password to start the server: ', (password) => {
        bootServer(password.trim());
        rl.close();
    });

    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted)
        rl.output.write("*");
      else
        rl.output.write(stringToWrite);
    };
    rl.stdoutMuted = true;
}
