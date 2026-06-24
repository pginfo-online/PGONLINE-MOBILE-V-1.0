const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets', 'brand');

const COLORS = {
  primary: [79, 70, 229, 255],
  primaryDark: [49, 46, 129, 255],
  accent: [124, 58, 237, 255],
  sky: [56, 189, 248, 255],
  white: [255, 255, 255, 255],
  lavender: [224, 231, 255, 255],
  door: [67, 56, 202, 255],
  shadow: [17, 24, 39, 38],
  transparent: [0, 0, 0, 0],
};

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function createPng(size, transparent = false) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (size * y + x) << 2;
      const t = (x + y) / (size * 2);
      const color = transparent ? COLORS.transparent : mix(COLORS.primaryDark, COLORS.accent, t);
      png.data[idx] = color[0];
      png.data[idx + 1] = color[1];
      png.data[idx + 2] = color[2];
      png.data[idx + 3] = color[3];
    }
  }
  return png;
}

function setPixel(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  const srcA = color[3] / 255;
  const dstA = png.data[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) return;
  for (let i = 0; i < 3; i += 1) {
    png.data[idx + i] = Math.round((color[i] * srcA + png.data[idx + i] * dstA * (1 - srcA)) / outA);
  }
  png.data[idx + 3] = Math.round(outA * 255);
}

function rect(png, x, y, w, h, color) {
  for (let yy = Math.round(y); yy < Math.round(y + h); yy += 1) {
    for (let xx = Math.round(x); xx < Math.round(x + w); xx += 1) {
      setPixel(png, xx, yy, color);
    }
  }
}

function roundedRect(png, x, y, w, h, r, color) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const x1 = Math.round(x + w);
  const y1 = Math.round(y + h);
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) {
      const dx = Math.max(x0 + r - xx, 0, xx - (x1 - r));
      const dy = Math.max(y0 + r - yy, 0, yy - (y1 - r));
      if (dx * dx + dy * dy <= r * r) setPixel(png, xx, yy, color);
    }
  }
}

function circle(png, cx, cy, r, color) {
  const x0 = Math.round(cx - r);
  const x1 = Math.round(cx + r);
  const y0 = Math.round(cy - r);
  const y1 = Math.round(cy + r);
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) setPixel(png, x, y, color);
    }
  }
}

function line(png, x1, y1, x2, y2, width, color) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    circle(png, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color);
  }
}

function triangle(png, ax, ay, bx, by, cx, cy, color) {
  const minX = Math.floor(Math.min(ax, bx, cx));
  const maxX = Math.ceil(Math.max(ax, bx, cx));
  const minY = Math.floor(Math.min(ay, by, cy));
  const maxY = Math.ceil(Math.max(ay, by, cy));
  const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const w1 = ((bx - x) * (cy - y) - (by - y) * (cx - x)) / area;
      const w2 = ((cx - x) * (ay - y) - (cy - y) * (ax - x)) / area;
      const w3 = 1 - w1 - w2;
      if (w1 >= 0 && w2 >= 0 && w3 >= 0) setPixel(png, x, y, color);
    }
  }
}

function drawMark(png, scale = png.width / 1024) {
  const s = scale;
  circle(png, 784 * s, 224 * s, 176 * s, [56, 189, 248, 42]);
  circle(png, 204 * s, 808 * s, 220 * s, [167, 139, 250, 46]);
  line(png, 220 * s, 486 * s, 512 * s, 254 * s, 64 * s, COLORS.white);
  line(png, 512 * s, 254 * s, 804 * s, 486 * s, 64 * s, COLORS.white);
  roundedRect(png, 270 * s, 424 * s, 484 * s, 362 * s, 52 * s, COLORS.white);
  triangle(png, 270 * s, 492 * s, 512 * s, 300 * s, 754 * s, 492 * s, COLORS.white);
  roundedRect(png, 384 * s, 396 * s, 256 * s, 88 * s, 32 * s, COLORS.lavender);
  roundedRect(png, 407 * s, 505 * s, 210 * s, 310 * s, 105 * s, COLORS.door);
  roundedRect(png, 450 * s, 548 * s, 124 * s, 165 * s, 62 * s, COLORS.shadow);
  line(png, 390 * s, 832 * s, 634 * s, 832 * s, 34 * s, COLORS.white);
}

function writePng(file, png) {
  fs.writeFileSync(file, PNG.sync.write(png));
}

function makeIcon(file, size, transparent = false) {
  const png = createPng(size, transparent);
  drawMark(png);
  writePng(file, png);
}

function makeSplash(file) {
  const width = 2048;
  const height = 2048;
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (width * y + x) << 2;
      // Dark theme background: #1e1b4b (30, 27, 75)
      png.data[idx] = 30;
      png.data[idx + 1] = 27;
      png.data[idx + 2] = 75;
      png.data[idx + 3] = 255;
    }
  }
  // Center is a gorgeous rounded card with our primary indigo color
  roundedRect(png, 640, 520, 768, 768, 170, COLORS.primary);
  const mark = createPng(768, true);
  drawMark(mark, 768 / 1024);
  for (let y = 0; y < 768; y += 1) {
    for (let x = 0; x < 768; x += 1) {
      const idx = (768 * y + x) << 2;
      setPixel(png, 640 + x, 520 + y, [
        mark.data[idx],
        mark.data[idx + 1],
        mark.data[idx + 2],
        mark.data[idx + 3],
      ]);
    }
  }
  writePng(file, png);
}

fs.mkdirSync(outDir, { recursive: true });
makeIcon(path.join(root, 'assets', 'icon.png'), 1024);
makeIcon(path.join(root, 'assets', 'adaptive-icon.png'), 1024, true);
makeIcon(path.join(root, 'assets', 'favicon.png'), 512);
makeIcon(path.join(outDir, 'pginfo-icon-1024.png'), 1024);
makeIcon(path.join(outDir, 'pginfo-adaptive-foreground.png'), 1024, true);
makeIcon(path.join(outDir, 'pginfo-favicon-512.png'), 512);
makeSplash(path.join(root, 'assets', 'splash.png'));
makeSplash(path.join(outDir, 'pginfo-splash-2048.png'));
