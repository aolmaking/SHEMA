'use strict';
/**
 * Draws the tray and app icons as PNGs.
 *
 * They are generated rather than shipped as binaries so the project has no
 * opaque image blobs, and so the icon can follow the accent colour if it ever
 * needs to. Pixels are supersampled 4x4 for clean edges at tray size.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets');

function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;                       // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* -- geometry helpers, all in 0..1 space -- */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function roundedBox(x, y, r) {
  // signed distance to a rounded square centred on (0.5, 0.5)
  const dx = Math.abs(x - 0.5) - (0.5 - r);
  const dy = Math.abs(y - 0.5) - (0.5 - r);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - r;
}

function mix(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/**
 * The mark: a rounded plate with a crescent cut from a disc — a widget tile
 * and a hilal in one shape.
 */
function sample(u, v) {
  const inPlate = roundedBox(u, v, 0.26) < 0;
  if (!inPlate) return null;

  const top = [0x8F, 0xC4, 0xF2];
  const bottom = [0x6E, 0x8A, 0xE0];
  let rgb = mix(top, bottom, clamp01((u * 0.35 + v * 0.8)));

  // Outer disc of the crescent
  const cx = 0.53, cy = 0.5, R = 0.235;
  const d1 = Math.hypot(u - cx, v - cy) - R;
  // Inner disc, offset to carve the crescent
  const d2 = Math.hypot(u - (cx + 0.105), v - (cy - 0.045)) - R * 0.86;
  const crescent = d1 < 0 && d2 > 0;

  if (crescent) rgb = [0xFF, 0xFF, 0xFF];

  // A small star to balance the composition
  const sd = Math.hypot(u - 0.295, v - 0.325) - 0.043;
  if (sd < 0) rgb = [0xFF, 0xFF, 0xFF];

  return rgb;
}

function render(size) {
  const SS = 4;                       // supersample factor
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / size;
          const v = (y + (sy + 0.5) / SS) / size;
          const c = sample(u, v);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a += 255; }
        }
      }
      const n = SS * SS;
      const alpha = a / n;
      const i = (y * size + x) * 4;
      // Premultiplied averaging keeps edges from darkening.
      out[i] = a ? Math.round(r / (a / 255)) : 0;
      out[i + 1] = a ? Math.round(g / (a / 255)) : 0;
      out[i + 2] = a ? Math.round(b / (a / 255)) : 0;
      out[i + 3] = Math.round(alpha);
    }
  }
  return encodePng(size, size, out);
}

/**
 * A Windows .ico holding PNG images at every size the shell asks for, so
 * the desktop and Start-menu icons stay sharp at any display scaling.
 */
function encodeIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);              // type: icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, png } of images) {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;          // 0 means 256
    e[1] = size >= 256 ? 0 : size;
    e[2] = 0;                               // no palette
    e[3] = 0;
    e.writeUInt16LE(1, 4);                  // planes
    e.writeUInt16LE(32, 6);                 // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, size] of [['tray.png', 32], ['tray@2x.png', 64], ['icon.png', 256]]) {
  const png = render(size);
  fs.writeFileSync(path.join(OUT, name), png);
  console.log(`${name}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
const ico = encodeIco([16, 20, 24, 32, 40, 48, 64, 96, 128, 256].map((size) => ({ size, png: render(size) })));
fs.writeFileSync(path.join(OUT, 'icon.ico'), ico);
console.log(`icon.ico  ${(ico.length / 1024).toFixed(1)} KB`);
