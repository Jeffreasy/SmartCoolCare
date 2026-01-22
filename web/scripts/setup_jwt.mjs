import { generateKeyPairSync } from 'crypto';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

console.log("🔑 Generating secure PKCS#8 Key...");

const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Save raw key for reference
writeFileSync('jwt_key_raw.pem', privateKey);

// Flatten for Env Var (replace actual newlines with literal \n)
const start = "-----BEGIN PRIVATE KEY-----";
const end = "-----END PRIVATE KEY-----";
const body = privateKey
    .replace(start, "")
    .replace(end, "")
    .replace(/\n/g, "")
    .trim();

// Reconstruct with literal \n
// Convex Auth expects: "-----BEGIN ...-----\n...\n-----END ...-----"
// But sometimes passed as one line. 
// Actually standard is to keep newlines.
// If we pass in CLI, we usually need to escape nicely.
// Let's try passing the flattened version with literal \n sequences.
const flattened = privateKey.replace(/\n/g, '\\n');

writeFileSync('jwt_key_flattened.txt', flattened);

console.log("🚀 Setting JWT_PRIVATE_KEY on Convex via spawn...");

// Use spawn to avoid shell interpretation issues
const child = spawn('npx.cmd', ['convex', 'env', 'set', 'JWT_PRIVATE_KEY', flattened], {
    stdio: 'inherit',
    shell: true
    // Shell true is needed for npx on windows sometimes, 
    // but implies quoting rules apply. 
    // On Windows 'npx.cmd' handles it.
});

child.on('close', (code) => {
    if (code === 0) {
        console.log("✅ Successfully set JWT_PRIVATE_KEY!");
    } else {
        console.error(`❌ Process exited with code ${code}`);
    }
});
