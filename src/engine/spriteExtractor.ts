export interface ExtractedSprites {
  heroes: Record<'barnabe' | 'lyra' | 'cedric' | 'zephyr' | 'ignis', string>;
  icons: Record<'coin' | 'gem' | 'star' | 'mug' | 'potion', string>;
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Crops a normalized region from a sprite sheet and removes its uniform outer
 * background using a border-seeded BFS flood-fill that stops cleanly at the
 * cartoon ink outlines (preserving internal whites like chef hats & foam!).
 */
function extractTransparentSprite(
  img: HTMLImageElement,
  rect: CropRect,
  tolerance: number,
  targetSize: number,
  stripBottomShadow = false
): string {
  const sx = Math.floor(img.naturalWidth * rect.x);
  const sy = Math.floor(img.naturalHeight * rect.y);
  const sw = Math.floor(img.naturalWidth * rect.w);
  const sh = Math.floor(img.naturalHeight * rect.h);

  const scale = Math.min(targetSize / sw, targetSize / sh, 1);
  const cw = Math.max(16, Math.round(sw * scale));
  const ch = Math.max(16, Math.round(sh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  const imgData = ctx.getImageData(0, 0, cw, ch);
  const data = imgData.data;

  // Sample outer corner color as reference background
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const visited = new Uint8Array(cw * ch);
  const queue = new Int32Array(cw * ch);
  let head = 0;
  let tail = 0;

  const colorDist = (idx4: number) => {
    const dr = data[idx4] - bgR;
    const dg = data[idx4 + 1] - bgG;
    const db = data[idx4 + 2] - bgB;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const tryEnqueue = (x: number, y: number) => {
    if (x < 0 || x >= cw || y < 0 || y >= ch) return;
    const p = y * cw + x;
    if (visited[p]) return;
    const dist = colorDist(p * 4);
    const localTol = stripBottomShadow && y > ch * 0.82 ? tolerance * 1.65 : tolerance;
    if (dist <= localTol) {
      visited[p] = 1;
      queue[tail++] = p;
    }
  };

  // Seed flood-fill from all 4 outer borders
  for (let x = 0; x < cw; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, ch - 1);
  }
  for (let y = 0; y < ch; y++) {
    tryEnqueue(0, y);
    tryEnqueue(cw - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    data[p * 4 + 3] = 0;
    const x = p % cw;
    const y = (p - x) / cw;
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  // Soft 1px edge feathering on pixels adjacent to removed background
  for (let y = 1; y < ch - 1; y++) {
    for (let x = 1; x < cw - 1; x++) {
      const p = y * cw + x;
      if (visited[p]) continue;
      const dist = colorDist(p * 4);
      if (
        dist < tolerance * 1.45 &&
        (visited[p - 1] || visited[p + 1] || visited[p - cw] || visited[p + cw])
      ) {
        data[p * 4 + 3] = Math.round(data[p * 4 + 3] * 0.35);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Trim empty transparent margins so sprites center cleanly
  let minX = cw;
  let minY = ch;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      if (data[(y * cw + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return canvas.toDataURL('image/png');
  }

  const trimW = maxX - minX + 1;
  const trimH = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = trimW;
  out.height = trimH;
  const outCtx = out.getContext('2d');
  if (!outCtx) return canvas.toDataURL('image/png');
  outCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
  return out.toDataURL('image/png');
}

let cachedPromise: Promise<ExtractedSprites> | null = null;

export function getExtractedSprites(): Promise<ExtractedSprites> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    const [charSheet, uiSheet] = await Promise.all([
      loadImage('art/personagens_lineup.jpg'),
      loadImage('art/ui_kit_texturas.jpg'),
    ]);

    const heroes: ExtractedSprites['heroes'] = {
      barnabe: extractTransparentSprite(
        charSheet,
        { x: 0.015, y: 0.21, w: 0.265, h: 0.62 },
        42,
        240,
        true
      ),
      lyra: extractTransparentSprite(
        charSheet,
        { x: 0.255, y: 0.24, w: 0.165, h: 0.58 },
        42,
        240,
        true
      ),
      cedric: extractTransparentSprite(
        charSheet,
        { x: 0.415, y: 0.2, w: 0.22, h: 0.62 },
        42,
        240,
        true
      ),
      zephyr: extractTransparentSprite(
        charSheet,
        { x: 0.635, y: 0.23, w: 0.175, h: 0.59 },
        42,
        240,
        true
      ),
      ignis: extractTransparentSprite(
        charSheet,
        { x: 0.805, y: 0.42, w: 0.185, h: 0.41 },
        42,
        220,
        true
      ),
    };

    const icons: ExtractedSprites['icons'] = {
      coin: extractTransparentSprite(uiSheet, { x: 0.03, y: 0.53, w: 0.135, h: 0.22 }, 38, 128),
      gem: extractTransparentSprite(uiSheet, { x: 0.19, y: 0.52, w: 0.11, h: 0.23 }, 38, 128),
      star: extractTransparentSprite(uiSheet, { x: 0.32, y: 0.51, w: 0.15, h: 0.24 }, 44, 128),
      mug: extractTransparentSprite(uiSheet, { x: 0.09, y: 0.74, w: 0.13, h: 0.23 }, 38, 128),
      potion: extractTransparentSprite(uiSheet, { x: 0.295, y: 0.74, w: 0.13, h: 0.23 }, 46, 128),
    };

    return { heroes, icons };
  })();

  return cachedPromise;
}
