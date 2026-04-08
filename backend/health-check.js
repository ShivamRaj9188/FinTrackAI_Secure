const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔍 Starting FinTrackAI Health Check...\n');

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
];

const optionalEnvVars = [
    'BACKEND_URL',
    'FRONTEND_URL',
    'SESSION_SECRET',
    'GEMINI_API_KEY'
];

let hasErrors = false;

console.log('🛡️ Check Environment Variables:');
requiredEnvVars.forEach(v => {
    if (!process.env[v] || process.env[v].includes('mock_')) {
        console.error(`  ❌ MISSING REQUIRED: ${v}`);
        hasErrors = true;
    } else {
        console.log(`  ✅ FOUND: ${v}`);
    }
});

optionalEnvVars.forEach(v => {
    if (!process.env[v]) {
        console.warn(`  ⚠️ MISSING OPTIONAL: ${v} (Highly recommended for production)`);
    } else {
        console.log(`  ✅ FOUND: ${v}`);
    }
});

console.log('\n📦 Checking Dependencies:');
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = ['express-session', 'passport', 'passport-google-oauth20', 'jsonwebtoken', 'mongoose', 'cors'];
    deps.forEach(d => {
        if (!pkg.dependencies[d]) {
            console.error(`  ❌ MISSING DEPENDENCY: ${d}`);
            hasErrors = true;
        } else {
            console.log(`  ✅ INSTALLED: ${d}`);
        }
    });
}

console.log('\n🚀 Summary:');
if (hasErrors) {
    console.error('  ❌ Project has critical issues. Please fix the missing requirements above.');
} else {
    console.log('  ✅ Backend configuration looks solid. Ensure you have set these in your Vercel/Production settings.');
}

if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'production') {
    console.warn('\n  💡 PRO TIP: Set BACKEND_URL in production to avoid Google OAuth redirect mismatches.');
}
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    console.warn('\n  💡 PRO TIP: Set FRONTEND_URL in production to ensure successful redirection back to UI.');
}
