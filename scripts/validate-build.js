const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const manifest = path.join(root, 'dist', 'manifest.xml');
const requiredFiles = ['taskpane.html', 'settings.html', 'commands.html'];

if (!fs.existsSync(manifest)) throw new Error('dist/manifest.xml is missing. Run npm run build first.');
try {
  execFileSync('xmllint', ['--noout', manifest], { stdio: 'inherit' });
} catch {
  throw new Error('dist/manifest.xml is not valid XML.');
}
const contents = fs.readFileSync(manifest, 'utf8');
if (contents.includes('localhost')) throw new Error('Production manifest must not contain localhost.');
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, 'dist', file))) throw new Error(`dist/${file} is missing.`);
}
console.log('Build validation passed.');
