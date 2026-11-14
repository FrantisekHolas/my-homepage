// Obnoví data vložená v ../index.html:
//   NAMES – jmenný kalendář (balíček namedays-cs)
//   GRID  – tečková mapa pevniny 1,5° × 1,5° s časovým pásmem každé tečky
//           (Natural Earth 1:50m přes world-atlas, pásma přes @photostructure/tz-lookup)
// Použití:  cd tools && npm install && npm run update-data
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import tzlookup from '@photostructure/tz-lookup';

const require = createRequire(import.meta.url);
const INDEX = new URL('../index.html', import.meta.url);

// --- jmenný kalendář ---
// balíček nezveřejňuje names.json přes "exports", proto cesta přímo v node_modules
const names = JSON.parse(fs.readFileSync(new URL('./node_modules/namedays-cs/dist/names.json', import.meta.url), 'utf8'));

// --- mřížka pevniny + časová pásma ---
const STEP = 1.5, LAT_TOP = 78, ROWS = 90, COLS = 240;   // 78° s. š. až 57° j. š., bez Antarktidy
const topo = JSON.parse(fs.readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);
const polys = [];
for (const f of (land.features || [land])) {
  const g = f.geometry || f;
  for (const rings of (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of rings[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    polys.push({ rings, x0, y0, x1, y1 });
  }
}
// rovinný test bodu v polygonu (data jsou oříznutá na ±180°, Antarktida je mimo rozsah)
const inRing = (r, x, y) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const isLand = (x, y) => polys.some(p => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1 && inRing(p.rings[0], x, y) && !p.rings.slice(1).some(h => inRing(h, x, y)));
const validTz = tz => { try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; } };

const tzNames = [], tzIdx = new Map(), rle = [];
for (let j = 0; j < ROWS; j++) {
  const lat = LAT_TOP - (j + 0.5) * STEP, row = [];
  for (let i = 0; i < COLS; i++) {
    const lon = -180 + (i + 0.5) * STEP, d = STEP * 0.3;
    // tečka je pevnina, když na pevninu padne střed nebo některý ze 4 pomocných bodů (malé ostrovy)
    const hit = [[lon, lat], [lon - d, lat - d], [lon + d, lat - d], [lon - d, lat + d], [lon + d, lat + d]].find(([x, y]) => isLand(x, y));
    if (!hit) { row.push(0); continue; }
    let tz = tzlookup(hit[1], hit[0]);
    if (!validTz(tz)) { const o = Math.round(lon / 15); tz = o === 0 ? 'Etc/GMT' : 'Etc/GMT' + (o > 0 ? '-' : '+') + Math.abs(o); }
    if (!tzIdx.has(tz)) { tzIdx.set(tz, tzNames.length); tzNames.push(tz); }
    row.push(tzIdx.get(tz) + 1);
  }
  const r = [];   // run-length: [hodnota, počet, hodnota, počet, …]; 0 = moře
  for (let i = 0; i < row.length;) { let k = i; while (k < row.length && row[k] === row[i]) k++; r.push(row[i], k - i); i = k; }
  rle.push(r);
}
const grid = { step: STEP, top: LAT_TOP, rows: ROWS, cols: COLS, tz: tzNames, rle };

// --- vložení do index.html mezi značky /*DATA:X*/ … /*END:X*/ ---
let html = fs.readFileSync(INDEX, 'utf8');
const put = (key, value) => {
  const re = new RegExp('/\\*DATA:' + key + '\\*/[\\s\\S]*?/\\*END:' + key + '\\*/');
  if (!re.test(html)) throw new Error('V index.html chybí značky pro ' + key);
  html = html.replace(re, () => '/*DATA:' + key + '*/' + JSON.stringify(value) + '/*END:' + key + '*/');
};
put('NAMES', names);
put('GRID', grid);
fs.writeFileSync(INDEX, html);
console.log('Hotovo: jmeniny ' + Object.keys(names).length + ' dní, mapa ' + rle.flat().filter((v, i) => i % 2 === 0 && v).length + ' úseků pevniny, ' + tzNames.length + ' časových pásem.');
