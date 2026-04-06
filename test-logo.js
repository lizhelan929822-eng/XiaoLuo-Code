import { execSync } from 'child_process';

// Test the logo display
console.log('Testing XiaoLuo Code logo display...');
try {
    // Run with --help to trigger logo display without authentication
    const output = execSync('node xiaoluo.js --help', { encoding: 'utf8', timeout: 5000 });
    console.log('Output:');
    console.log(output);
} catch (error) {
    // We expect an authentication error, but we should still see the logo
    console.log('Error output (expected):');
    console.log(error.stdout);
    console.log('Error message:');
    console.log(error.message);
}
