/* eslint-disable */
const fs = require('fs');
const path = require('path');

try {
  const rootDir = path.join(__dirname, '..');
  const staticSrc = path.join(rootDir, '.next/static');
  const staticDest = path.join(rootDir, '.next/standalone/.next/static');
  const publicSrc = path.join(rootDir, 'public');
  const publicDest = path.join(rootDir, '.next/standalone/public');

  // Copy .next/static
  if (fs.existsSync(staticSrc)) {
    fs.mkdirSync(path.dirname(staticDest), { recursive: true });
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('Successfully copied .next/static to .next/standalone/.next/static');
  } else {
    console.warn('.next/static directory not found, skipping copy.');
  }

  // Copy public
  if (fs.existsSync(publicSrc)) {
    fs.mkdirSync(path.dirname(publicDest), { recursive: true });
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log('Successfully copied public to .next/standalone/public');
  } else {
    console.warn('public directory not found, skipping copy.');
  }
} catch (err) {
  console.error('Error copying assets for standalone build:', err);
  process.exit(1);
}
