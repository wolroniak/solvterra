/**
 * Generate placeholder assets for SolvTerra mobile app
 * Run with: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple colored PNG using raw PNG bytes
function createSimplePNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw image data with zlib compression
  // For simplicity, create a simple solid color image
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b);
    }
  }

  const { deflateSync } = require('zlib');
  const compressed = deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];

  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }

  return crc ^ 0xFFFFFFFF;
}

// Generate assets with SolvTerra brand color (blue: #2563EB = 37, 99, 235)
const brandBlue = { r: 37, g: 99, b: 235 };

console.log('Generating placeholder assets...');

// Icon (1024x1024)
const icon = createSimplePNG(1024, 1024, brandBlue.r, brandBlue.g, brandBlue.b);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
console.log('✓ Created icon.png (1024x1024)');

// Splash (1284x2778 - iPhone dimensions)
const splash = createSimplePNG(1284, 2778, brandBlue.r, brandBlue.g, brandBlue.b);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
console.log('✓ Created splash.png (1284x2778)');

// Adaptive icon (1024x1024)
const adaptiveIcon = createSimplePNG(1024, 1024, brandBlue.r, brandBlue.g, brandBlue.b);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);
console.log('✓ Created adaptive-icon.png (1024x1024)');

// Favicon (48x48)
const favicon = createSimplePNG(48, 48, brandBlue.r, brandBlue.g, brandBlue.b);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon);
console.log('✓ Created favicon.png (48x48)');

console.log('\nAll assets generated successfully!');
console.log('Note: These are solid blue placeholders. Replace with actual branded assets for production.');
