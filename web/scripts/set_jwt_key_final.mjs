import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const key = readFileSync('jwt_key_dashboard.txt', 'utf8');

console.log('🔑 Key loaded from file');
console.log(`📏 Lines: ${key.split('\n').length}`);
console.log(`📊 Length: ${key.length} chars`);

// Save to temp file for convex CLI
writeFileSync('temp_key.txt', key);

console.log('\n🚀 Setting JWT_PRIVATE_KEY via Convex CLI...\n');

try {
    // On Windows, use cmd /c to execute the command properly
    const result = execSync(`type temp_key.txt | npx convex env set JWT_PRIVATE_KEY`, {
        stdio: 'inherit',
        shell: true
    });
    console.log('\n✅ Successfully set JWT_PRIVATE_KEY!');
} catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.log('\n📝 Manual step required:');
    console.log('Copy the key from jwt_key_dashboard.txt and paste it in the Convex Dashboard.');
}
