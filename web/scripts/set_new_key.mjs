import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const key = readFileSync('jwt_key_NEW.pem', 'utf8');

console.log('🔑 New key loaded');
console.log(`📏 Lines: ${key.split('\n').length}`);
console.log(`📊 First 50 chars: ${key.substring(0, 50)}`);

writeFileSync('temp_key.txt', key);

console.log('\n🚀 Setting new JWT_PRIVATE_KEY...\n');

try {
    execSync(`type temp_key.txt | npx convex env set JWT_PRIVATE_KEY`, {
        stdio: 'inherit',
        shell: true
    });
    console.log('\n✅ Successfully set new JWT_PRIVATE_KEY!');
} catch (error) {
    console.error('\n❌ Failed:', error.message);
}
