import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generateAwakenPNG(width, height, isMaskable = false) {
  // RGBA raw scanlines: each line begins with filter byte (0 = None)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Pitch black background (#000000)
      let r = 0, g = 0, b = 0, a = 255;

      // Outer ring: radius 0.75..0.88 * maxR
      const rOuter = dist / maxR;
      if (rOuter >= 0.72 && rOuter <= 0.88) {
        const ringEdge = Math.min(
          (rOuter - 0.72) / 0.05,
          (0.88 - rOuter) / 0.05
        );
        const intensity = Math.max(0, Math.min(1, ringEdge));
        // Cyan (#00f0ff) fading to violet (#8b5cf6)
        const angle = Math.atan2(dy, dx);
        const grad = Math.sin(angle) * 0.5 + 0.5;
        r = Math.round((grad * 139) * intensity);
        g = Math.round((240 - grad * 148) * intensity);
        b = Math.round((255 - grad * 9) * intensity);
      }
      // Inner ring: radius 0.38..0.50 * maxR
      else if (rOuter >= 0.38 && rOuter <= 0.50) {
        const ringEdge = Math.min(
          (rOuter - 0.38) / 0.04,
          (0.50 - rOuter) / 0.04
        );
        const intensity = Math.max(0, Math.min(1, ringEdge));
        r = Math.round(0 * intensity);
        g = Math.round(240 * intensity);
        b = Math.round(255 * intensity);
      }
      // Center luminous core: radius 0..0.22 * maxR
      else if (rOuter <= 0.22) {
        const coreIntensity = Math.pow(1 - rOuter / 0.22, 1.5);
        r = Math.round(220 * coreIntensity);
        g = Math.round(250 * coreIntensity);
        b = Math.round(255 * coreIntensity);
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // Compress with zlib
  const compressedIDAT = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit per channel
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression method 0
  ihdr[11] = 0; // filter method 0
  ihdr[12] = 0; // interlace 0

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedIDAT);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generateAwakenPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generateAwakenPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), generateAwakenPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'pwa-64x64.png'), generateAwakenPNG(64, 64));

// Generate crisp SVG Emblem
const svgEmblem = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#000000"/>
  <circle cx="256" cy="256" r="185" stroke="url(#cyanViolet)" stroke-width="26" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="105" stroke="#00f0ff" stroke-width="18" opacity="0.9"/>
  <circle cx="256" cy="256" r="42" fill="#eef8ff"/>
  <defs>
    <linearGradient id="cyanViolet" x1="71" y1="71" x2="441" y2="441" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00f0ff"/>
      <stop offset="0.5" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgEmblem);
console.log('Successfully generated PWA icons in public/');
