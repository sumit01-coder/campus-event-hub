const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Pass the password as an argument
const password = process.argv[2] || 'sumitpatel123';
const algorithm = 'aes-256-cbc';

// Read the original server code
const coreJsPath = path.join(__dirname, '../core.js');
const coreEncPath = path.join(__dirname, '../core.enc');

if (!fs.existsSync(coreJsPath)) {
    console.error('core.js not found. Make sure you rename server.js to core.js first.');
    process.exit(1);
}

const rawCode = fs.readFileSync(coreJsPath, 'utf8');

// Encrypt the code
const key = crypto.scryptSync(password, 'salt', 32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(algorithm, key, iv);

let encrypted = cipher.update(rawCode, 'utf8', 'hex');
encrypted += cipher.final('hex');

// Save the IV + encrypted data
const payload = {
    iv: iv.toString('hex'),
    content: encrypted
};

fs.writeFileSync(coreEncPath, JSON.stringify(payload));
console.log('Project core successfully encrypted to core.enc');
console.log('You can now safely delete core.js if you want to distribute the project.');
