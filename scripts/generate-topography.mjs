// Gera public/topography/1.svg, 2.svg, ...: linhas de relevo (curvas de nível) usadas no
// fundo da conversa. Cada arquivo é um desenho diferente, e cada conversa usa um deles.
//
// Como funciona:
// 1. Cria um "terreno" suave com ruído de Perlin em várias escalas.
// 2. Corta esse terreno em várias alturas (marching squares) e liga os pedaços em linhas.
// 3. Simplifica as linhas e as desenha como curvas suaves no SVG.
//
// Para gerar de novo: node scripts/generate-topography.mjs
// Cada número em SEEDS vira um desenho. Se mudar a quantidade de SEEDS, atualize
// TOPOGRAPHY_VARIANTS em src/lib/topography.ts. LEVELS controla quantas linhas aparecem.

import { mkdirSync, writeFileSync } from "node:fs";

const WIDTH = 1600;
const HEIGHT = 1000;
const CELL = 8; // resolução da grade em pixels; menor = linhas mais precisas e arquivo maior
const LEVELS = 55; // quantidade de alturas cortadas; mais níveis = mais linhas
const BASE_FREQUENCY = 1 / 600;
// Inclinação suave: garante linhas em toda a área, sem platôs vazios.
// A direção muda em cada desenho, para as linhas fluírem para lados diferentes.
const SLOPE = 0.0008;
const OCTAVES = 2;
const SEEDS = [17, 3, 42, 88, 131, 256, 512, 777];
const SIMPLIFY_TOLERANCE = 0.9;
const STROKE_WIDTH = 1.1;

// Gerador de números aleatórios com semente, para o desenho ser sempre o mesmo.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ruído de Perlin 2D clássico.
function createPerlin(random) {
  const permutation = Array.from({ length: 256 }, (_, index) => index);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const p = [...permutation, ...permutation];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grad = (hash, x, y) => {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x, y) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v,
    );
  };
}

// Cria o terreno de um desenho a partir da semente.
function createTerrain(seed) {
  const random = createRandom(seed);
  const perlin = createPerlin(random);
  const slopeAngle = random() * Math.PI * 2;
  const slopeX = Math.cos(slopeAngle) * Math.SQRT2 * SLOPE;
  const slopeY = Math.sin(slopeAngle) * Math.SQRT2 * SLOPE;

  function fbm(x, y) {
    let value = 0;
    let amplitude = 1;
    let frequency = BASE_FREQUENCY;
    for (let octave = 0; octave < OCTAVES; octave++) {
      value += amplitude * perlin(x * frequency, y * frequency);
      amplitude *= 0.3;
      frequency *= 2.1;
    }
    return value;
  }

  // Distorce as coordenadas com o próprio ruído, para as curvas ficarem mais orgânicas.
  return (x, y) => {
    const warpX = 60 * fbm(x + 311, y + 97);
    const warpY = 60 * fbm(x - 523, y + 431);
    return fbm(x + warpX, y + warpY) + slopeX * x + slopeY * y;
  };
}

const cols = Math.ceil(WIDTH / CELL);
const rows = Math.ceil(HEIGHT / CELL);

// Alturas nos cantos de cada célula da grade.
function computeHeights(terrain) {
  const heights = [];
  for (let j = 0; j <= rows; j++) {
    const row = [];
    for (let i = 0; i <= cols; i++) {
      row.push(terrain(i * CELL, j * CELL));
    }
    heights.push(row);
  }
  return heights;
}

// Marching squares: para cada altura, encontra os segmentos onde o terreno cruza aquele valor.
// Cada ponto é identificado pela aresta da grade onde está, para ligar os segmentos sem erro.
function contourSegments(heights, level) {
  const segments = [];
  const point = (edgeKey, x, y) => ({ key: edgeKey, x, y });
  const interpolate = (a, b) => (level - a) / (b - a);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tl = heights[j][i];
      const tr = heights[j][i + 1];
      const br = heights[j + 1][i + 1];
      const bl = heights[j + 1][i];
      const x = i * CELL;
      const y = j * CELL;

      const top = () => point(`h${i},${j}`, x + CELL * interpolate(tl, tr), y);
      const right = () => point(`v${i + 1},${j}`, x + CELL, y + CELL * interpolate(tr, br));
      const bottom = () => point(`h${i},${j + 1}`, x + CELL * interpolate(bl, br), y + CELL);
      const left = () => point(`v${i},${j}`, x, y + CELL * interpolate(tl, bl));

      const index =
        (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);

      switch (index) {
        case 1: case 14: segments.push([left(), bottom()]); break;
        case 2: case 13: segments.push([bottom(), right()]); break;
        case 3: case 12: segments.push([left(), right()]); break;
        case 4: case 11: segments.push([top(), right()]); break;
        case 6: case 9: segments.push([top(), bottom()]); break;
        case 7: case 8: segments.push([left(), top()]); break;
        case 5: case 10: {
          // Caso ambíguo: a média do centro decide como ligar os cantos.
          const centerAbove = (tl + tr + br + bl) / 4 > level;
          if ((index === 5) === centerAbove) {
            segments.push([left(), top()], [bottom(), right()]);
          } else {
            segments.push([left(), bottom()], [top(), right()]);
          }
          break;
        }
        default: break;
      }
    }
  }
  return segments;
}

// Liga os segmentos que compartilham pontos em linhas contínuas.
function joinSegments(segments) {
  const byKey = new Map();
  segments.forEach((segment, index) => {
    for (const end of segment) {
      if (!byKey.has(end.key)) byKey.set(end.key, []);
      byKey.get(end.key).push(index);
    }
  });

  const used = new Array(segments.length).fill(false);
  const lines = [];

  const extend = (line, fromKey) => {
    let key = fromKey;
    for (;;) {
      const next = (byKey.get(key) ?? []).find((index) => !used[index]);
      if (next === undefined) return;
      used[next] = true;
      const [a, b] = segments[next];
      const other = a.key === key ? b : a;
      line.push(other);
      key = other.key;
    }
  };

  segments.forEach((segment, index) => {
    if (used[index]) return;
    used[index] = true;
    const forward = [segment[0], segment[1]];
    extend(forward, segment[1].key);
    const backward = [];
    extend(backward, segment[0].key);
    const line = [...backward.reverse(), ...forward];
    const closed = line.length > 3 && line[0].key === line.at(-1).key;
    lines.push({ points: line, closed });
  });
  return lines;
}

// Ramer-Douglas-Peucker: remove pontos que quase não mudam o formato da linha.
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const [first, last] = [points[0], points.at(-1)];
  let maxDistance = 0;
  let splitIndex = 0;
  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const length = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = Math.abs(dy * points[i].x - dx * points[i].y + last.x * first.y - last.y * first.x) / length;
    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = i;
    }
  }
  if (maxDistance <= tolerance) return [first, last];
  const left = simplify(points.slice(0, splitIndex + 1), tolerance);
  const right = simplify(points.slice(splitIndex), tolerance);
  return [...left.slice(0, -1), ...right];
}

const format = (n) => (Math.round(n * 10) / 10).toString();

// Desenha a linha como curva suave (Catmull-Rom convertida em Bézier).
function toPath(points, closed) {
  const pts = closed ? points.slice(0, -1) : points;
  const count = pts.length;
  if (count < 2) return "";
  const at = (index) =>
    closed ? pts[(index + count) % count] : pts[Math.max(0, Math.min(count - 1, index))];

  let d = `M${format(pts[0].x)} ${format(pts[0].y)}`;
  const segmentsCount = closed ? count : count - 1;
  for (let i = 0; i < segmentsCount; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${format(c1x)} ${format(c1y)} ${format(c2x)} ${format(c2y)} ${format(p2.x)} ${format(p2.y)}`;
  }
  return closed ? `${d}Z` : d;
}

function buildSvg(seed) {
  const heights = computeHeights(createTerrain(seed));

  // Alturas de corte em intervalos iguais entre a menor e a maior altura do terreno.
  const allHeights = heights.flat();
  const minHeight = Math.min(...allHeights);
  const maxHeight = Math.max(...allHeights);
  const levelValues = Array.from(
    { length: LEVELS },
    (_, index) => minHeight + ((maxHeight - minHeight) * (index + 1)) / (LEVELS + 1),
  );

  const paths = [];
  for (const value of levelValues) {
    for (const line of joinSegments(contourSegments(heights, value))) {
      const simplified = simplify(line.points, SIMPLIFY_TOLERANCE);
      if (simplified.length < 3 && !line.closed) continue;
      const path = toPath(simplified, line.closed);
      if (path) paths.push(path);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" preserveAspectRatio="xMidYMid slice"><path fill="none" stroke="#000" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round" d="${paths.join("")}"/></svg>\n`;
}

const outputDir = new URL("../public/topography/", import.meta.url);
mkdirSync(outputDir, { recursive: true });

SEEDS.forEach((seed, index) => {
  const svg = buildSvg(seed);
  const fileName = `${index + 1}.svg`;
  writeFileSync(new URL(fileName, outputDir), svg);
  console.log(`topography/${fileName}: ${(svg.length / 1024).toFixed(1)} KB`);
});
