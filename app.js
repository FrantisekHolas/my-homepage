// František Homepage – logika stránky. Načítá ji index.html po config.js a data/*.js.
(() => {
'use strict';

/* ===== Nastavení ===== */
// Výchozí hodnoty; přepisuje je soubor config.js (window.MY_HOMEPAGE_CONFIG)
const DEFAULTS = {
  place: { name: 'Brno', nameIn: 'v Brně', lat: 49.1951, lon: 16.6068 },
  timeFormat: '24h',
  calendarView: '3m',
  sections: { calendar: true, forecast: true, worldMap: true, timeChange: true },
  people: [],
};
const USER_CFG = (window.MY_HOMEPAGE_CONFIG && typeof window.MY_HOMEPAGE_CONFIG === 'object') ? window.MY_HOMEPAGE_CONFIG : {};
const UP = USER_CFG.place;
const CFG = {
  place: UP && Number.isFinite(+UP.lat) && Number.isFinite(+UP.lon) && Math.abs(+UP.lat) <= 90 && Math.abs(+UP.lon) <= 180
    ? { name: String(UP.name || 'Moje místo'), nameIn: UP.nameIn ? String(UP.nameIn) : '', lat: +UP.lat, lon: +UP.lon } : DEFAULTS.place,
  timeFormat: USER_CFG.timeFormat === '12h' ? '12h' : '24h',
  calendarView: USER_CFG.calendarView === 'year' ? 'year' : '3m',
  sections: Object.assign({}, DEFAULTS.sections, USER_CFG.sections || {}),
};
if (!window.HOMEPAGE_MAPA) { CFG.sections.worldMap = false; console.warn('data/mapa.js se nenačetl – sekce Světový čas je skrytá.'); }
if (UP && CFG.place === DEFAULTS.place) console.warn('config.js: místo nemá platné souřadnice lat/lon – použito výchozí místo.');
// Místo pro kartičky Slunce a Počasí a pro týdenní předpověď
const HOME_WX = CFG.place;
const SUN_AT = CFG.place;
// popisek kartiček: „v Brně“, když je v configu nameIn, jinak „· Brno“
const PLACE_IN = CFG.place.nameIn || '· ' + CFG.place.name;
const TZ = 'Europe/Prague';

// Jedno hlavní město za každé časové pásmo:
// [název, země, IANA pásmo, zeměpisná šířka, délka, umístění bubliny (n/s/e/w/ne/nw/se/sw), priorita na úzké obrazovce]
const CITIES = [
  ['Honolulu','USA – Havaj','Pacific/Honolulu',21.3069,-157.8583,'e',0],
  ['Anchorage','USA – Aljaška','America/Anchorage',61.2181,-149.9003,'e',0],
  ['Los Angeles','USA','America/Los_Angeles',34.0522,-118.2437,'w',1],
  ['Denver','USA','America/Denver',39.7392,-104.9903,'n',0],
  ['Mexiko','Mexiko','America/Mexico_City',19.4326,-99.1332,'s',0],
  ['New York','USA','America/New_York',40.7128,-74.0060,'e',1],
  ['Caracas','Venezuela','America/Caracas',10.4806,-66.9036,'e',0],
  ['São Paulo','Brazílie','America/Sao_Paulo',-23.5505,-46.6333,'e',1],
  ['Nuuk','Grónsko','America/Nuuk',64.1814,-51.6941,'w',0],
  ['Praia','Kapverdy','Atlantic/Cape_Verde',14.9330,-23.5133,'e',0],
  ['Londýn','Velká Británie','Europe/London',51.5074,-0.1278,'w',1],
  ['Praha','Česko','Europe/Prague',50.0755,14.4378,'n',1],
  ['Johannesburg','JAR','Africa/Johannesburg',-26.2041,28.0473,'e',0],
  ['Moskva','Rusko','Europe/Moscow',55.7558,37.6173,'e',1],
  ['Dubaj','SAE','Asia/Dubai',25.2048,55.2708,'w',1],
  ['Male','Maledivy','Indian/Maldives',4.1755,73.5093,'w',0],
  ['Nové Dillí','Indie','Asia/Kolkata',28.6139,77.2090,'n',1],
  ['Bangkok','Thajsko','Asia/Bangkok',13.7563,100.5018,'s',0],
  ['Peking','Čína','Asia/Shanghai',39.9042,116.4074,'n',1],
  ['Tokio','Japonsko','Asia/Tokyo',35.6762,139.6503,'e',1],
  ['Sydney','Austrálie','Australia/Sydney',-33.8688,151.2093,'s',1],
  ['Auckland','Nový Zéland','Pacific/Auckland',-36.8485,174.7633,'nw',0],
];

// Jmenný kalendář ČR – zdroj: balíček namedays-cs (Roman Ožana, licence MIT)
const NAMES = window.HOMEPAGE_JMENINY || {};   // data/jmeniny.js
const NO_NAME = {'01-01':'Nový rok','05-01':'Svátek práce','05-08':'Den vítězství','07-06':'Mistr Jan Hus','12-25':'Boží hod vánoční'};
// Státní a ostatní svátky ČR (zákon č. 245/2000 Sb.) – pevná data; Velikonoce se počítají
const HOLIDAYS = {
  '01-01':'Den obnovy samostatného českého státu, Nový rok',
  '05-01':'Svátek práce','05-08':'Den vítězství',
  '07-05':'Den slovanských věrozvěstů Cyrila a Metoděje','07-06':'Den upálení mistra Jana Husa',
  '09-28':'Den české státnosti','10-28':'Den vzniku samostatného československého státu',
  '11-17':'Den boje za svobodu a demokracii',
  '12-24':'Štědrý den','12-25':'1. svátek vánoční','12-26':'2. svátek vánoční',
};

const WEEKDAY = ['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
const WEEKDAY_IN = ['v neděli','v pondělí','v úterý','ve středu','ve čtvrtek','v pátek','v sobotu'];
const WD_SHORT = ['ne','po','út','st','čt','pá','so'];
const WD_HEAD = ['Po','Út','St','Čt','Pá','So','Ne'];
const MONTH = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
const MONTH_GEN = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];
const WMO = {0:'jasno',1:'skoro jasno',2:'polojasno',3:'zataženo',45:'mlha',48:'mlha s námrazou',
  51:'slabé mrholení',53:'mrholení',55:'silné mrholení',56:'mrznoucí mrholení',57:'mrznoucí mrholení',
  61:'slabý déšť',63:'déšť',65:'silný déšť',66:'mrznoucí déšť',67:'mrznoucí déšť',
  71:'slabé sněžení',73:'sněžení',75:'silné sněžení',77:'sněhová zrna',
  80:'přeháňky',81:'přeháňky',82:'silné přeháňky',85:'sněhové přeháňky',86:'sněhové přeháňky',
  95:'bouřka',96:'bouřka s kroupami',99:'bouřka s kroupami'};

const SUN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
const MOON_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';
const DROP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.7c-3.6 4.6-6.3 8.4-6.3 11.8a6.3 6.3 0 0 0 12.6 0c0-3.4-2.7-7.2-6.3-11.8z"/></svg>';

/* ===== Pomocné funkce ===== */
const $ = id => document.getElementById(id);
const set = (el, txt) => { if (el.textContent !== txt) el.textContent = txt; };
const setHTML = (el, html) => { if (el.innerHTML !== html) el.innerHTML = html; };
const pad = n => String(n).padStart(2, '0');
const dec = (x, d) => x.toFixed(d).replace('.', ',');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MINUS = '−';
const D = 864e5;
const store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
  del(k){ try { localStorage.removeItem(k); } catch(e){} },
};
function plural(n, one, few, many){ return n === 1 ? one : (n >= 2 && n <= 4 ? few : many); }
const dny = n => n + ' ' + plural(n, 'den', 'dny', 'dní');

const fmtCache = {};
const WDMAP = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
function parts(tz, ms){
  const f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat('en-GB', {timeZone:tz, hourCycle:'h23',
    year:'numeric', month:'numeric', day:'numeric', hour:'numeric', minute:'numeric', second:'numeric', weekday:'short'}));
  const o = {};
  for (const p of f.formatToParts(ms)) o[p.type] = p.value;
  return {y:+o.year, mo:+o.month, d:+o.day, h:(+o.hour)%24, mi:+o.minute, s:+o.second, wd:WDMAP[o.weekday]};
}
// posun pásma vůči UTC v minutách
function offsetMin(tz, ms){
  const p = parts(tz, ms);
  return Math.round((Date.UTC(p.y, p.mo-1, p.d, p.h, p.mi, p.s) - Math.floor(ms/1000)*1000) / 60000);
}
const dayKey = p => p.y*10000 + p.mo*100 + p.d;
const mmdd = (mo, d) => pad(mo) + '-' + pad(d);
// kalendářní den jako UTC půlnoc (pro počítání s daty bez časových pásem)
const utc = (y, mo, d) => Date.UTC(y, mo-1, d);
const ymd = t => { const x = new Date(t); return { y:x.getUTCFullYear(), mo:x.getUTCMonth()+1, d:x.getUTCDate(), wd:x.getUTCDay() }; };
const shortD = t => { const p = ymd(t); return WD_SHORT[p.wd] + ' ' + p.d + '. ' + p.mo + '.'; };

function isoWeek(y, mo, d){
  const t = new Date(Date.UTC(y, mo-1, d));
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay()+6)%7) + 3);       // čtvrtek téhož týdne
  const f = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  f.setUTCDate(f.getUTCDate() - ((f.getUTCDay()+6)%7) + 3);       // čtvrtek 1. týdne
  return 1 + Math.round((t - f) / 6048e5);
}
const easterCache = {};
function easter(y){ // gregoriánský algoritmus (Meeus/Jones/Butcher)
  if (easterCache[y]) return easterCache[y];
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
    h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
    mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;
  return (easterCache[y] = Date.UTC(y, mo-1, da));
}
function holidayOf(y, mo, d){
  const k = mmdd(mo, d); if (HOLIDAYS[k]) return HOLIDAYS[k];
  const t = Date.UTC(y, mo-1, d), e = easter(y);
  if (t === e - 2*D) return 'Velký pátek';
  if (t === e + D) return 'Velikonoční pondělí';
  return '';
}
const holT = t => { const p = ymd(t); return holidayOf(p.y, p.mo, p.d); };
// Prodejní doba o svátcích (zákon č. 223/2016 Sb.): obchody nad 200 m² mají zavřeno, Štědrý den od 12:00
const SHOPS_CLOSED = { '01-01': 'closed', '05-08': 'closed', '09-28': 'closed', '10-28': 'closed', '12-24': 'noon', '12-25': 'closed', '12-26': 'closed' };
function shopsOf(y, mo, d){   // '' = není státní svátek, jinak 'closed' | 'noon' | 'open'
  if (!holidayOf(y, mo, d)) return '';
  if (SHOPS_CLOSED[mmdd(mo, d)]) return SHOPS_CLOSED[mmdd(mo, d)];
  return Date.UTC(y, mo - 1, d) === easter(y) + D ? 'closed' : 'open';   // Velikonoční pondělí zavřeno
}
const SHOP_TXT = { closed: 'velké obchody zavřené', noon: 'velké obchody zavřené od 12:00', open: 'velké obchody otevřené' };
const SHOP_TAG = { closed: 'obchody zavřené', noon: 'obchody zavřené od 12:00', open: 'obchody otevřené' };
const isWeekend = t => { const w = new Date(t).getUTCDay(); return w === 0 || w === 6; };
const isFree = t => isWeekend(t) || !!holT(t);
function nameOf(mo, d){
  const v = NAMES[mmdd(mo, d)];
  if (!v) return null;
  return Array.isArray(v) ? v.join(', ') : v;
}

/* ===== Narozeniny a svátky lidí z config.js ===== */
// osoba: { name, birthday: 'D.M.', nameday: 'D.M.' | false, firstName }; rok se ignoruje, věk se nikde neukazuje
function parseDM(s){
  const m = String(s).trim().match(/^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.?(\s*\d{4})?$/);
  if (!m) return null;
  const d = +m[1], mo = +m[2];
  if (mo < 1 || mo > 12 || d < 1 || d > new Date(Date.UTC(2024, mo, 0)).getUTCDate()) return null;   // 2024 je přestupný, projde i 29. 2.
  return mmdd(mo, d);
}
const NAME_DAYS = {};   // jméno malými písmeny → ['MM-DD', …]
for (const k in NAMES) for (const n of [].concat(NAMES[k])) (NAME_DAYS[n.toLowerCase()] = NAME_DAYS[n.toLowerCase()] || []).push(k);
const PEOPLE_EV = {};   // 'MM-DD' → { b: [jména s narozeninami], n: [jména, která mají svátek] }
function addEv(key, type, name){ const e = PEOPLE_EV[key] || (PEOPLE_EV[key] = { b: [], n: [] }); if (!e[type].includes(name)) e[type].push(name); }
(Array.isArray(USER_CFG.people) ? USER_CFG.people : []).forEach((p, i) => {
  const name = p && p.name ? String(p.name).trim() : '';
  if (!name) { console.warn('config.js: osoba č. ' + (i + 1) + ' nemá jméno – přeskočeno.'); return; }
  if (p.birthday) {
    const k = parseDM(p.birthday);
    if (k) addEv(k, 'b', name); else console.warn('config.js: ' + name + ' – neplatné datum narozenin „' + p.birthday + '“ (zadejte např. 3.4.).');
  }
  if (p.nameday === false) return;
  if (p.nameday) {
    const k = parseDM(p.nameday);
    if (k) addEv(k, 'n', name); else console.warn('config.js: ' + name + ' – neplatné datum svátku „' + p.nameday + '“ (zadejte např. 23.4.).');
    return;
  }
  const first = String(p.firstName || name.split(/\s+/)[0]).toLowerCase();
  if (NAME_DAYS[first]) NAME_DAYS[first].forEach(k => addEv(k, 'n', name));
  else console.warn('config.js: ' + name + ' – jméno „' + first + '“ v kalendáři svátků není, doplňte nameday nebo firstName.');
});
const HAS_PEOPLE = Object.keys(PEOPLE_EV).length > 0;
// události pro konkrétní den; kdo má 29. 2., slaví v nepřestupném roce 28. 2.
function peopleOn(y, mo, d){
  const e = PEOPLE_EV[mmdd(mo, d)];
  let b = e ? e.b : [], n = e ? e.n : [];
  if (mo === 2 && d === 28 && new Date(Date.UTC(y, 2, 0)).getUTCDate() === 28 && PEOPLE_EV['02-29']) {
    b = b.concat(PEOPLE_EV['02-29'].b); n = n.concat(PEOPLE_EV['02-29'].n);
  }
  return b.length || n.length ? { b, n } : null;
}

/* ===== Slunce (algoritmus NOAA Solar Calculator) ===== */
const RAD = Math.PI/180;
function solar(ms){ // deklinace [rad] a časová rovnice [min]
  const jc = (ms/864e5 + 2440587.5 - 2451545) / 36525;
  const L0 = ((280.46646 + jc*(36000.76983 + jc*0.0003032)) % 360) * RAD;
  const M = (357.52911 + jc*(35999.05029 - 0.0001537*jc)) * RAD;
  const e = 0.016708634 - jc*(0.000042037 + 0.0000001267*jc);
  const C = Math.sin(M)*(1.914602 - jc*(0.004817 + 0.000014*jc)) + Math.sin(2*M)*(0.019993 - 0.000101*jc) + Math.sin(3*M)*0.000289;
  const om = (125.04 - 1934.136*jc) * RAD;
  const lam = (L0/RAD + C - 0.00569 - 0.00478*Math.sin(om)) * RAD;
  const eps = (23 + (26 + (21.448 - jc*(46.815 + jc*(0.00059 - jc*0.001813)))/60)/60 + 0.00256*Math.cos(om)) * RAD;
  const decl = Math.asin(Math.sin(eps)*Math.sin(lam));
  const y = Math.tan(eps/2)**2;
  const eqt = 4/RAD*(y*Math.sin(2*L0) - 2*e*Math.sin(M) + 4*e*y*Math.sin(M)*Math.cos(2*L0) - 0.5*y*y*Math.sin(4*L0) - 1.25*e*e*Math.sin(2*M));
  return { decl, eqt };
}
function sunAltitude(ms, lat, lon){ // výška Slunce nad obzorem [°]
  const { decl, eqt } = solar(ms), phi = lat*RAD;
  const tst = ((((ms % 864e5) + 864e5) % 864e5)/60000 + eqt + 4*lon) % 1440;
  const ha = (tst/4 - 180) * RAD;
  const cz = Math.sin(phi)*Math.sin(decl) + Math.cos(phi)*Math.cos(decl)*Math.cos(ha);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cz)))/RAD;
}
function sunTimes(y, mo, d, lat, lon){ // východ/západ pro místní datum; null = polární den/noc
  const day0 = Date.UTC(y, mo-1, d), phi = lat*RAD;
  const ev = sign => {
    let t = day0 + (720 - 4*lon)*60000;
    for (let i = 0; i < 3; i++) {
      const { decl, eqt } = solar(t);
      const c = Math.cos(90.833*RAD)/(Math.cos(phi)*Math.cos(decl)) - Math.tan(phi)*Math.tan(decl);
      if (c < -1 || c > 1) return null;
      t = day0 + (720 - 4*lon - eqt + sign*4*Math.acos(c)/RAD)*60000;
    }
    return t;
  };
  const rise = ev(-1), set = ev(1);
  return (rise === null || set === null) ? null : { rise, set };
}
const hm = (tz, ms) => { const p = parts(tz, ms + 30000); return p.h + ':' + pad(p.mi); }; // zaokrouhlení na minuty
const hoursTxt = x => dec(Math.abs(x), Number.isInteger(x) ? 0 : (Math.abs(x*4) % 2 ? 2 : 1));

/* ===== Ověření času: měření odchylky hodin zařízení (podobně jako NTP) ===== */
const SOURCES = [
  { name:'time.akamai.com', url:'https://time.akamai.com/?iso&ms',
    parse: async r => Date.parse((await r.text()).trim()) },
  { name:'worldtimeapi.org', url:'https://worldtimeapi.org/api/timezone/Etc/UTC',
    parse: async r => Date.parse((await r.json()).utc_datetime.replace(/(\.\d{3})\d+/, '$1')) },
  { name:'timeapi.io', url:'https://timeapi.io/api/time/current/zone?timeZone=UTC',
    parse: async r => Date.parse((await r.json()).dateTime.replace(/(\.\d{3})\d*/, '$1') + 'Z') },
];
let offset = 0, syncInfo = null, lastSyncAt = 0, syncing = false;
const now = () => Date.now() + offset;

async function sample(src){
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 4000);
  try {
    const t0 = performance.now(), w0 = Date.now();
    const r = await fetch(src.url, { cache:'no-store', signal:ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const server = await src.parse(r);
    const rtt = performance.now() - t0;
    if (!Number.isFinite(server)) throw new Error('parse');
    return { off: server - (w0 + rtt/2), rtt };
  } finally { clearTimeout(to); }
}
async function syncTime(){
  if (syncing) return; syncing = true;
  try {
    for (const src of SOURCES) {
      const res = [];
      for (let i = 0; i < 5; i++) {
        try { res.push(await sample(src)); } catch(e) { if (!res.length) break; }
      }
      if (res.length) {
        const best = res.reduce((a, b) => b.rtt < a.rtt ? b : a);
        offset = best.off; lastSyncAt = Date.now();
        syncInfo = { src: src.name, off: best.off/1000, prec: Math.max(best.rtt/2000, 0.005) };
        renderSync(); return;
      }
    }
    syncInfo = { fail: true }; offset = 0; lastSyncAt = Date.now() - 25*60000; // zkusit znovu za ~5 min
    renderSync();
  } finally { syncing = false; }
}
function renderSync(){
  const el = $('sync');
  if (!syncInfo) return;
  if (syncInfo.fail) { el.innerHTML = 'Přesný čas se nepodařilo ověřit – zobrazuji čas tohoto zařízení.'; return; }
  const a = Math.abs(syncInfo.off), p = syncInfo.prec, d = (p < 0.1) ? 2 : 1;
  const prec = '(přesnost ±' + dec(p, d) + ' s)';
  el.innerHTML = (a <= Math.max(p, 0.05))
    ? 'Hodiny tohoto zařízení <b>jdou přesně</b> ' + prec
    : 'Hodiny tohoto zařízení se <b>' + (syncInfo.off < 0 ? 'předbíhají' : 'zpožďují') + ' o ' + dec(a, a < 10 ? d : 0) + ' s</b> ' + prec;
  setFooter();
}

/* ===== Ikony počasí (WMO kódy) ===== */
const CLOUD = 'M6.5 19h11a4.5 4.5 0 0 0 .4-8.98 6 6 0 0 0-11.6 1.6A3.7 3.7 0 0 0 6.5 19z';
const IC_SUN = '<g class="i-sun"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3L7 7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/></g>';
const IC_MOON = '<path class="i-moon" d="M19.5 14.9A8 8 0 0 1 9.1 4.5a8 8 0 1 0 10.4 10.4z"/>';
function wxIcon(code, isDay){
  const sky = isDay === false ? IC_MOON : IC_SUN;
  const cloudUp = '<path class="i-cloud" transform="translate(1.2 -2.6) scale(.9)" d="' + CLOUD + '"/>';
  if (code === 0) return sky;
  if (code <= 2) return '<g transform="translate(-2.2 -2.4) scale(.72)">' + sky + '</g><path class="i-cloud" transform="translate(4.4 4.6) scale(.82)" d="' + CLOUD + '"/>';
  if (code === 3) return '<path class="i-cloud" transform="translate(0 -1)" d="' + CLOUD + '"/>';
  if (code <= 48) return cloudUp + '<path class="i-fog" d="M4 18.6h16M6.5 22h11"/>';
  if (code <= 57) return cloudUp + '<g class="i-dot"><circle cx="8.5" cy="19.6" r="1.1"/><circle cx="12.5" cy="21.6" r="1.1"/><circle cx="16.5" cy="19.6" r="1.1"/></g>';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return cloudUp + '<g class="i-snow"><circle cx="8" cy="19.4" r="1.4"/><circle cx="12" cy="21.9" r="1.4"/><circle cx="16" cy="19.4" r="1.4"/></g>';
  if (code >= 95) return cloudUp + '<path class="i-bolt" d="M12.9 14.6l-3.2 4.6h2.9l-1.5 4 4.3-5.4h-3l1.7-3.2z"/>';
  return cloudUp + '<path class="i-rain" d="M8.6 17.8l-1.3 3.8M12.6 17.8l-1.3 3.8M16.6 17.8l-1.3 3.8"/>';
}
// barva teploty pro pruh rozpětí
const TSTOPS = [[-15,[99,102,241]],[0,[96,165,250]],[10,[52,211,153]],[20,[245,158,11]],[30,[239,68,68]]];
function tcol(t){
  if (t <= TSTOPS[0][0]) return 'rgb(' + TSTOPS[0][1] + ')';
  for (let i = 1; i < TSTOPS.length; i++) {
    const [t1, c1] = TSTOPS[i];
    if (t <= t1) { const [t0, c0] = TSTOPS[i-1], f = (t - t0)/(t1 - t0); return 'rgb(' + c0.map((v, k) => Math.round(v + (c1[k] - v)*f)) + ')'; }
  }
  return 'rgb(' + TSTOPS[TSTOPS.length-1][1] + ')';
}
const rnd = t => { const r = Math.round(t); return r === 0 ? 0 : r; };
const tempTxt = t => (rnd(t) < 0 ? MINUS + Math.abs(rnd(t)) : String(rnd(t))) + ' °C';
const deg = t => (rnd(t) < 0 ? MINUS + Math.abs(rnd(t)) : String(rnd(t))) + '°';
const clockTxt = ms => { const p = parts(TZ, ms); return p.h + ':' + pad(p.mi); };

/* ===== Počasí (Open-Meteo) ===== */
// Dva dotazy: (1) aktuální teplota měst na mapě, (2) aktuální stav + denní předpověď pro Brno.
// Výsledek se ukládá do localStorage a sdílí mezi záložkami; nový dotaz nejdřív za 15 minut a jen u viditelné stránky.
const API = 'https://api.open-meteo.com/v1/forecast';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WX_KEY = 'pc_wx5:' + HOME_WX.lat.toFixed(3) + ',' + HOME_WX.lon.toFixed(3), WX_TTL = 15*60000;
['pc_wx', 'pc_wx2', 'pc_wx3', 'pc_wx4', 'pc_fc'].forEach(store.del); // úložiště ze starších verzí
let wx = store.get(WX_KEY) || {}, wxTried = false, wxLoading = false;

async function getJSON(url){
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch(url, { cache:'no-store', signal:ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(to); }
}
const coords = pts => 'latitude=' + pts.map(p => p[0]).join(',') + '&longitude=' + pts.map(p => p[1]).join(',');
const DAILY = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max';
const fcURL = (lat, lon, tz) => API + '?' + coords([[lat, lon]]) + '&current=temperature_2m,weather_code,is_day&daily=' + DAILY +
  '&forecast_days=8&timezone=' + encodeURIComponent(tz);
function parsePlace(x){
  const d = x.daily, c = x.current;
  return {
    tz: x.timezone || TZ,
    cur: { temp: c.temperature_2m, code: c.weather_code, isDay: c.is_day !== 0 },
    daily: d.time.map((date, i) => ({ date, code: d.weather_code[i], tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i],
      prec: d.precipitation_sum[i] || 0, prob: d.precipitation_probability_max[i], snow: d.snowfall_sum[i] || 0,
      wind: d.wind_speed_10m_max[i], gust: d.wind_gusts_10m_max[i] })),
  };
}
async function loadWeather(){
  const cached = store.get(WX_KEY);
  if (cached && cached.tc && cached.tp && Date.now() - cached.tc < WX_TTL && Date.now() - cached.tp < WX_TTL) {
    wx = cached; wxTried = true; renderWeather();
  } else if (!wxLoading && !(document.visibilityState === 'hidden' && wxTried)) {
    wxLoading = true;
    try {
      const urlC = API + '?' + coords(CITIES.map(c => [c[3], c[4]])) + '&current=temperature_2m,weather_code&timezone=GMT';
      const [rc, rp] = await Promise.allSettled([CFG.sections.worldMap === false ? Promise.reject(0) : getJSON(urlC), getJSON(fcURL(HOME_WX.lat, HOME_WX.lon, TZ))]);
      const nw = Object.assign({}, cached || wx);
      if (rc.status === 'fulfilled') {
        const j = [].concat(rc.value);
        if (j.length === CITIES.length) { nw.cities = j.map(x => ({ temp: x.current.temperature_2m, code: x.current.weather_code })); nw.tc = Date.now(); }
      }
      if (rp.status === 'fulfilled') { try { nw.home = parsePlace([].concat(rp.value)[0]); nw.tp = Date.now(); } catch(e) {} }
      wx = nw; store.set(WX_KEY, wx);
    } finally { wxLoading = false; wxTried = true; }
    renderWeather();
  }
  if (fcLoc && fcLoc.t && Date.now() - fcLoc.t > WX_TTL && document.visibilityState !== 'hidden') loadLoc(fcLoc, true);
}
function renderWeather(){
  const age = t => t ? Date.now() - t : Infinity;
  const okC = wx.cities && wx.cities.length === CITIES.length && age(wx.tc) < 3*3600e3;
  if (okC || wx.cities) updatePins(now());
  const ic = $('wx-home-ic'), v = $('wx-home'), s = $('wx-home-s');
  if (wx.home && age(wx.tp) < 3*3600e3) {
    const c = wx.home.cur;
    setHTML(ic, wxIcon(c.code, c.isDay)); set(v, tempTxt(c.temp));
    set(s, (WMO[c.code] || '') + ' · ' + clockTxt(wx.tp));
  } else {
    setHTML(ic, ''); set(v, '–'); set(s, wxTried ? 'nedostupné' : 'načítám…');
  }
  renderForecast();
}

/* ===== Předpověď na týden: Brno, nebo jiné místo (hledání / poloha) – volba se nepamatuje ===== */
let fcLoc = null;   // { name, sub, lat, lon, data, t, loading, error }
function fcMsg(txt){ const el = $('fc-msg'); el.hidden = !txt; set(el, txt || ''); }
async function loadLoc(loc, quiet){
  if (!quiet) { loc.loading = true; renderForecast(); }
  try {
    const j = [].concat(await getJSON(fcURL(loc.lat, loc.lon, 'auto')))[0];
    if (fcLoc !== loc) return;   // mezitím zvoleno jiné místo
    loc.data = parsePlace(j); loc.t = Date.now(); loc.error = false;
  } catch(e) {
    if (fcLoc !== loc) return;
    if (!loc.data) loc.error = true;
  }
  loc.loading = false;
  renderForecast();
}
function selectLoc(loc){
  fcMsg('');
  fcLoc = loc;
  loadLoc(loc);
}
function goHome(){ fcLoc = null; fcMsg(''); renderForecast(); }

function renderForecast(){
  const box = $('fc'), meta = $('fc-meta');
  $('fc-home').hidden = !fcLoc;
  const src = fcLoc
    ? { name: fcLoc.name, sub: fcLoc.sub, lat: fcLoc.lat, lon: fcLoc.lon, data: fcLoc.data, t: fcLoc.t, loading: fcLoc.loading, failed: fcLoc.error }
    : { name: HOME_WX.name, sub: '', lat: HOME_WX.lat, lon: HOME_WX.lon, data: wx.home, t: wx.tp, loading: !wxTried, failed: wxTried };
  const tz = (src.data && src.data.tz) || TZ, czech = tz === TZ;
  const tp = parts(tz, now()), today = utc(tp.y, tp.mo, tp.d);
  const todayIso = tp.y + '-' + pad(tp.mo) + '-' + pad(tp.d);
  const fresh = src.data && src.t && Date.now() - src.t < 24*3600e3;
  const days = fresh ? src.data.daily.filter(d => d.date >= todayIso && d.tmax != null).slice(0, 8) : [];
  if (src.loading || !days.length) {
    setHTML(box, '<div class="fc-empty">' + (src.loading ? 'Načítám předpověď – ' + esc(src.name) + '…' :
      'Předpověď pro ' + esc(src.name) + ' se nepodařilo načíst.') + '</div>');
    set(meta, fcLoc ? src.name : '');
    return;
  }
  const lo = Math.min(...days.map(d => d.tmin)), hi = Math.max(...days.map(d => d.tmax)), span = Math.max(hi - lo, 1);
  let h = '';
  for (const d of days) {
    const [y, mo, dd] = d.date.split('-').map(Number);
    const t = utc(y, mo, dd), wd = new Date(t).getUTCDay(), hol = czech ? holidayOf(y, mo, dd) : '';
    const rel = Math.round((t - today) / D);
    const label = rel === 0 ? 'Dnes' : rel === 1 ? 'Zítra' : WEEKDAY[wd];
    const cls = ['fd']; if (rel === 0) cls.push('now'); if (hol) cls.push('hol'); else if (wd === 0 || wd === 6) cls.push('we');
    const st = sunTimes(y, mo, dd, src.lat, src.lon);
    const prob = d.prob == null ? null : Math.round(d.prob);
    const tip = WEEKDAY[wd] + ' ' + dd + '. ' + mo + '. ' + y + (hol ? ' – ' + hol : '') + '\n' +
      (WMO[d.code] || '') + ', ' + tempTxt(d.tmax) + ' / ' + tempTxt(d.tmin) + '\n' +
      'Srážky ' + dec(d.prec, 1) + ' mm' + (prob != null ? ' (pravděpodobnost ' + prob + ' %)' : '') + (d.snow > 0 ? ', sníh ' + dec(d.snow, 1) + ' cm' : '') + '\n' +
      'Vítr až ' + Math.round(d.wind) + ' km/h, nárazy ' + Math.round(d.gust) + ' km/h' +
      (st ? '\nVýchod slunce ' + hm(tz, st.rise) + ', západ ' + hm(tz, st.set) + (czech ? '' : ' (místního času)') : '');
    const wet = d.prec >= 0.1 || (prob != null && prob >= 30);
    const NB = ' ';
    const amount = d.snow >= 0.5 ? 'sníh' + NB + dec(d.snow, d.snow < 10 ? 1 : 0) + NB + 'cm' : dec(d.prec, d.prec < 10 ? 1 : 0) + NB + 'mm';
    const precTxt = wet ? amount + (prob != null ? ' · ' + prob + NB + '%' : '') : 'bez srážek';
    const left = (d.tmin - lo) / span * 100, width = Math.max((d.tmax - d.tmin) / span * 100, 4);
    const gust = Math.round(d.gust);
    const windTxt = gust >= 60 ? 'nárazy ' + gust + ' km/h' : 'vítr ' + Math.round(d.wind) + ' km/h';
    h += '<div class="' + cls.join(' ') + '" title="' + esc(tip) + '">' +
      '<div class="fl"><b>' + label + '</b><span>' + dd + '. ' + mo + '.</span></div>' +
      '<svg class="wi lg" viewBox="0 0 24 24">' + wxIcon(d.code, true) + '</svg>' +
      '<div class="fdsc">' + (WMO[d.code] || '') + '</div>' +
      '<div class="ft"><b>' + deg(d.tmax) + '</b><span>' + deg(d.tmin) + '</span></div>' +
      '<div class="fb"><i style="left:' + left.toFixed(1) + '%;width:' + width.toFixed(1) + '%;background:linear-gradient(90deg,' + tcol(d.tmin) + ',' + tcol(d.tmax) + ')"></i></div>' +
      '<div class="fp' + (wet ? ' wet' : '') + '">' + (wet ? DROP_SVG : '') + precTxt + '</div>' +
      '<div class="fw' + (gust >= 60 ? ' warn' : '') + '">' + windTxt + '</div></div>';
  }
  setHTML(box, h);
  const upd = parts(TZ, src.t), c = src.data.cur;
  set(meta, src.name + (src.sub ? ', ' + src.sub : '') + ' · nyní ' + tempTxt(c.temp) + ', ' + (WMO[c.code] || '') +
    ' · aktualizováno ' + (dayKey(upd) === dayKey(parts(TZ, now())) ? '' : upd.d + '. ' + upd.mo + '. ') + upd.h + ':' + pad(upd.mi));
}

// hledání místa (Open-Meteo Geocoding)
let resList = [], resAct = -1, qSeq = 0, qTimer = 0;
const qEl = $('fc-q'), resEl = $('fc-res');
function showRes(items, note){
  resList = items; resAct = items.length ? 0 : -1;
  if (!items.length && !note) { resEl.hidden = true; return; }
  resEl.innerHTML = items.length
    ? items.map((r, i) => '<li role="option" data-i="' + i + '"' + (i === resAct ? ' class="act"' : '') + '>' + esc(r.name) + '<span>' + esc(r.sub) + '</span></li>').join('')
    : '<li class="none">' + esc(note) + '</li>';
  resEl.hidden = false;
}
function moveAct(dir){
  if (!resList.length) return;
  resAct = (resAct + dir + resList.length) % resList.length;
  resEl.querySelectorAll('li').forEach((li, i) => li.classList.toggle('act', i === resAct));
}
function pickRes(i){
  const r = resList[i]; if (!r) return;
  showRes([]); qEl.value = ''; qEl.blur();
  selectLoc({ name: r.name, sub: r.short, lat: r.lat, lon: r.lon });
}
async function search(q){
  const seq = ++qSeq;
  try {
    const j = await getJSON(GEO_API + '?name=' + encodeURIComponent(q) + '&count=8&language=cs&format=json');
    if (seq !== qSeq) return;
    const items = (j.results || []).map(r => {
      const area = [r.admin1, r.country].filter((x, i, a) => x && a.indexOf(x) === i && x !== r.name);
      return { name: r.name, lat: r.latitude, lon: r.longitude,
        sub: area.join(', ') + (r.elevation != null ? ' · ' + Math.round(r.elevation) + ' m n. m.' : ''),
        short: r.country_code === 'CZ' ? (r.admin1 || '') : (r.country || '') };
    });
    showRes(items, 'Nic nenalezeno');
  } catch(e) {
    if (seq === qSeq) showRes([], 'Hledání se nepodařilo (offline?)');
  }
}
qEl.addEventListener('input', () => {
  clearTimeout(qTimer);
  const q = qEl.value.trim();
  if (q.length < 2) { qSeq++; showRes([]); return; }
  qTimer = setTimeout(() => search(q), 300);
});
qEl.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); moveAct(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); moveAct(-1); }
  else if (e.key === 'Enter') { e.preventDefault(); if (resAct >= 0) pickRes(resAct); }
  else if (e.key === 'Escape') { showRes([]); qEl.value = ''; }
});
qEl.addEventListener('blur', () => setTimeout(() => showRes([]), 150));
resEl.addEventListener('mousedown', e => {
  const li = e.target.closest('li[data-i]');
  if (li) { e.preventDefault(); pickRes(+li.dataset.i); }
});
$('fc-home').addEventListener('click', goHome);

// poloha zařízení
$('fc-geo').addEventListener('click', () => {
  const btn = $('fc-geo');
  if (!navigator.geolocation) { fcMsg('Tento prohlížeč neumí zjistit polohu – zadejte místo ručně.'); return; }
  btn.setAttribute('aria-busy', 'true'); fcMsg('');
  navigator.geolocation.getCurrentPosition(pos => {
    btn.removeAttribute('aria-busy');
    const { latitude: lat, longitude: lon } = pos.coords;
    selectLoc({ name: 'Moje poloha', sub: dec(Math.abs(lat), 3) + '° ' + (lat >= 0 ? 's. š.' : 'j. š.') + ', ' + dec(Math.abs(lon), 3) + '° ' + (lon >= 0 ? 'v. d.' : 'z. d.'), lat, lon });
  }, err => {
    btn.removeAttribute('aria-busy');
    fcMsg(err.code === 1 ? 'Přístup k poloze je zakázaný – povolte ho v nastavení prohlížeče pro tuto stránku, nebo zadejte místo ručně.'
      : 'Polohu se nepodařilo zjistit – zadejte místo ručně.');
  }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 10*60000 });
});

/* ===== Plánovací kalendář ===== */
let calMode = (store.get('pc_calmode') || (CFG.calendarView === 'year' ? 'year' : 'q')) === 'year' ? 'year' : 'q';
let calY = 0, calM = 1; // první zobrazený měsíc (3 měsíce) nebo rok
const todayP = () => parts(TZ, now());
function calReset(){ const p = todayP(); calY = p.y; calM = calMode === 'year' ? 1 : p.mo; }
const daysIn = (y, mo) => new Date(Date.UTC(y, mo, 0)).getUTCDate();
function workDays(y, mo){
  let n = 0;
  for (let d = 1, n2 = daysIn(y, mo); d <= n2; d++) if (!isFree(utc(y, mo, d))) n++;
  return n;
}
function monthHTML(y, mo, today, curWeekMon){
  const days = daysIn(y, mo), lead = (new Date(utc(y, mo, 1)).getUTCDay() + 6) % 7;
  const wdays = workDays(y, mo);
  let h = '<div class="mon"><div class="mh"><b>' + MONTH[mo-1] + ' ' + y + '</b><span title="Pracovní dny (bez víkendů a svátků)">' +
    wdays + ' ' + plural(wdays, 'prac. den', 'prac. dny', 'prac. dní') + '</span></div><table><thead><tr><th class="wk" title="Číslo týdne">T</th>' +
    WD_HEAD.map((w, i) => '<th' + (i >= 5 ? ' class="we"' : '') + '>' + w + '</th>').join('') + '</tr></thead><tbody>';
  for (let day = 1 - lead; day <= days; ) {
    const mon = utc(y, mo, day), mp = ymd(mon);
    const wk = isoWeek(mp.y, mp.mo, mp.d);
    h += '<tr><td class="wk' + (mon === curWeekMon ? ' cur' : '') + '" title="Týden ' + wk + '">' + wk + '</td>';
    for (let i = 0; i < 7; i++, day++) {
      if (day < 1 || day > days) { h += '<td></td>'; continue; }
      const t = utc(y, mo, day), hol = holidayOf(y, mo, day), cls = ['d'];
      if (i >= 5) cls.push('we');
      const shop = hol ? shopsOf(y, mo, day) : '';
      if (hol) cls.push('hol');
      if (shop === 'open' || shop === 'noon') cls.push('shop-' + shop);
      if (t === today) cls.push('today'); else if (t < today) cls.push('past');
      const nm = nameOf(mo, day), pe = peopleOn(y, mo, day);
      if (pe) cls.push('ev');
      const tip = WEEKDAY[(i + 1) % 7] + ' ' + day + '. ' + mo + '. ' + y + (hol ? '\n' + hol + ' · ' + SHOP_TXT[shop] : '') +
        (pe && pe.b.length ? '\nNarozeniny: ' + pe.b.join(', ') : '') +
        (nm || (pe && pe.n.length) ? '\nSvátek: ' + [nm, pe && pe.n.some(x => !(nm || '').split(', ').includes(x)) ? 'slaví ' + pe.n.filter(x => !(nm || '').split(', ').includes(x)).join(', ') : ''].filter(Boolean).join(' – ') : '') + '\nTýden ' + wk;
      const dots = pe ? '<i class="dots">' + (pe.b.length ? '<b class="db"></b>' : '') + (pe.n.length ? '<b class="dn"></b>' : '') + '</i>' : '';
      h += '<td class="' + cls.join(' ') + '" title="' + esc(tip) + '">' + (pe ? '<span class="num">' + dots + day + '</span>' : day) + '</td>';
    }
    h += '</tr>';
  }
  return h + '</tbody></table></div>';
}
// souvislý blok volných dnů (víkendy + svátky) kolem dne t
function freeBlock(t){ let a = t, b = t; while (isFree(a - D)) a -= D; while (isFree(b + D)) b += D; return [a, b]; }
function holidayNote(t, seen){
  if (isWeekend(t)) return { txt: 'připadá na ' + (new Date(t).getUTCDay() === 6 ? 'sobotu' : 'neděli'), cls: '' };
  const [a, b] = freeBlock(t);
  if (seen.has(a)) return null;
  seen.add(a);
  const len = Math.round((b - a) / D) + 1;
  let best = null; // „most“ – jeden pracovní den, který spojí dva volné bloky
  if (isFree(a - 2*D)) { const [a2] = freeBlock(a - 2*D); best = { day: a - D, tot: Math.round((b - a2) / D) + 1 }; }
  if (isFree(b + 2*D)) { const [, b2] = freeBlock(b + 2*D); const tot = Math.round((b2 - a) / D) + 1; if (!best || tot > best.tot) best = { day: b + D, tot }; }
  const out = [];
  if (len >= 3) out.push(dny(len) + ' volna (' + shortD(a) + ' – ' + shortD(b) + ')');
  if (best && best.tot >= 4) out.push('s 1 dnem dovolené (' + shortD(best.day) + ') ' + dny(best.tot) + ' volna');
  return out.length ? { txt: out.join(' · '), cls: len >= 3 ? 'good' : 'tip' } : null;
}
function renderCal(){
  if (!calY) calReset();
  const tp = todayP(), today = utc(tp.y, tp.mo, tp.d);
  const curWeekMon = today - ((new Date(today).getUTCDay() + 6) % 7) * D;
  const months = [];
  if (calMode === 'year') for (let m = 1; m <= 12; m++) months.push([calY, m]);
  else for (let k = 0; k < 3; k++) { const x = new Date(Date.UTC(calY, calM - 1 + k, 1)); months.push([x.getUTCFullYear(), x.getUTCMonth() + 1]); }
  const box = $('cal');
  box.className = 'cal ' + calMode;
  set($('lg-today'), String(tp.d));
  setHTML(box, months.map(([y, m]) => monthHTML(y, m, today, curWeekMon)).join(''));

  // souhrn období
  const wsum = months.reduce((s, [y, m]) => s + workDays(y, m), 0);
  const [fy, fm] = months[0], [ly, lm] = months[months.length - 1];
  set($('cal-title'), calMode === 'year' ? 'Rok ' + calY : MONTH[fm-1] + (fy !== ly ? ' ' + fy : '') + ' – ' + MONTH[lm-1].toLowerCase() + ' ' + ly);
  // svátky v období
  const t0 = utc(fy, fm, 1), t1 = utc(ly, lm, daysIn(ly, lm));
  const seen = new Set(), items = [];
  let onWork = 0, nHol = 0, nB = 0, nN = 0;
  for (let t = t0; t <= t1; t += D) {
    const past = t < today ? ' class="past"' : '';
    const hol = holT(t);
    if (hol) {
      nHol++;
      if (!isWeekend(t)) onWork++;
      const note = holidayNote(t, seen);
      const sp = ymd(t), shop = shopsOf(sp.y, sp.mo, sp.d);
      items.push('<li' + past + '><span class="hd' + (isWeekend(t) ? ' wkend' : '') + '">' + shortD(t) + '</span><span class="hn">' + esc(hol) + '</span>' +
        '<span class="hx' + (note ? ' ' + note.cls : '') + '"><span class="shop ' + shop + '">' + SHOP_TAG[shop] + '</span>' + (note ? esc(note.txt) : '') + '</span></li>');
    }
    const p = ymd(t), pe = peopleOn(p.y, p.mo, p.d);
    if (pe && pe.b.length) { nB += pe.b.length; items.push('<li' + past + '><span class="hd pb">' + shortD(t) + '</span><span class="hn">Narozeniny – ' + esc(pe.b.join(', ')) + '</span></li>'); }
    if (pe && pe.n.length) { nN += pe.n.length; items.push('<li' + past + '><span class="hd pn">' + shortD(t) + '</span><span class="hn">Svátek – ' + esc(pe.n.join(', ')) + '</span></li>'); }
  }
  set($('cal-sum'), '· ' + wsum + ' ' + plural(wsum, 'pracovní den', 'pracovní dny', 'pracovních dní') +
    (nHol ? ' · ' + nHol + ' ' + plural(nHol, 'státní svátek', 'státní svátky', 'státních svátků') + ' (' + onWork + ' v pracovní den)' : '') +
    (nB ? ' · ' + nB + ' ' + plural(nB, 'narozeniny', 'narozeniny', 'narozenin') : '') +
    (nN ? ' · ' + nN + ' ' + plural(nN, 'svátek', 'svátky', 'svátků') : ''));
  document.querySelectorAll('.legend .lgp').forEach(el => { el.hidden = !HAS_PEOPLE; });
  setHTML($('cal-hol'), items.length ? items.join('') : '<li class="none">V tomto období nejsou žádné události.</li>');
  $('cal-shopnote').hidden = !nHol;
  document.querySelectorAll('#cal-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === calMode)));
}
function calShift(dir){
  if (calMode === 'year') calY += dir;
  else { const x = new Date(Date.UTC(calY, calM - 1 + dir, 1)); calY = x.getUTCFullYear(); calM = x.getUTCMonth() + 1; }
  renderCal();
}
$('cal-prev').addEventListener('click', () => calShift(-1));
$('cal-next').addEventListener('click', () => calShift(1));
$('cal-today').addEventListener('click', () => { calReset(); renderCal(); });
document.querySelectorAll('#cal-mode button').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.m === calMode) return;
  calMode = b.dataset.m; store.set('pc_calmode', calMode);
  if (calMode === 'q') { const p = todayP(); calM = calY === p.y ? p.mo : 1; }
  renderCal();
}));

/* ===== Vykreslení ===== */
let h12 = (() => { const s = store.get('pc_h12'); return typeof s === 'boolean' ? s : CFG.timeFormat === '12h'; })();

function fmtH(h){ return h12 ? String(h % 12 || 12) : pad(h); }
const ampm = h => h12 ? (h < 12 ? 'dop.' : 'odp.') : '';

/* ===== Mapa světového času ===== */
// Mřížka pevniny 1,5° × 1,5°: každá tečka nese IANA časové pásmo (Natural Earth 1:50m + tz-lookup).
// Aktuální posun pásma (včetně letního času) počítá prohlížeč, takže se mapa sama přebarví při změnách času.
const GRID = window.HOMEPAGE_MAPA || { step: 1.5, top: 78, rows: 90, cols: 240, tz: [], rle: [] };   // data/mapa.js; bez dat prázdná mapa (sekce je skrytá)
const NC = GRID.cols, NR = GRID.rows, MAP_TOP = GRID.top, MAP_SPAN = GRID.rows * GRID.step;
const cI = [], cJ = [], cTz = [], cLat = [], cLon = [];
const cellAt = new Int32Array(NC * NR).fill(-1);
GRID.rle.forEach((r, j) => {
  let i = 0;
  for (let k = 0; k < r.length; k += 2) {
    const v = r[k], n = r[k + 1];
    if (v) for (let m = 0; m < n; m++) {
      cellAt[j * NC + i + m] = cI.length;
      cI.push(i + m); cJ.push(j); cTz.push(v - 1);
      cLat.push(MAP_TOP - (j + 0.5) * GRID.step); cLon.push(-180 + (i + m + 0.5) * GRID.step);
    }
    i += n;
  }
});
const NCELL = cI.length;
// starší Safari/iOS nemusí znát novější názvy pásem – použít starší alias, jinak UTC
const TZ_ALIAS = { 'America/Nuuk': 'America/Godthab', 'Asia/Kolkata': 'Asia/Calcutta', 'Asia/Ho_Chi_Minh': 'Asia/Saigon' };
const tzOk = tz => { try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch(e) { return false; } };
CITIES.forEach(c => { if (!tzOk(c[2])) c[2] = tzOk(TZ_ALIAS[c[2]] || '') ? TZ_ALIAS[c[2]] : 'UTC'; });
// neplatné názvy pásem (starší prohlížeč) nahradit nominálním pásmem podle délky
const TZN = GRID.tz.map((tz, k) => {
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return tz; }
  catch(e) { const lon = cLon[cTz.indexOf(k)] || 0, o = Math.round(lon / 15); return o === 0 ? 'UTC' : 'Etc/GMT' + (o > 0 ? '-' : '+') + Math.abs(o); }
});
const tzOff = new Int16Array(TZN.length);
let tzOffMin = -1;
function updateTzOffsets(ms){
  const m = Math.floor(ms / 60000);
  if (m === tzOffMin) return;
  tzOffMin = m;
  for (let k = 0; k < TZN.length; k++) tzOff[k] = offsetMin(TZN[k], ms);
}
const tzLabel = k => { const n = TZN[k]; return n.startsWith('Etc/') || n === 'UTC' ? '' : n.split('/').pop().replace(/_/g, ' '); };
const utcTxt = off => 'UTC' + (off === 0 ? '' : (off > 0 ? '+' : MINUS) + Math.floor(Math.abs(off) / 60) + (Math.abs(off) % 60 ? ':' + pad(Math.abs(off) % 60) : ''));
function diffTxt(diffMin){
  if (diffMin === 0) return 'stejný čas jako v Česku';
  const h = Math.abs(diffMin) / 60, t = hoursTxt(h) + ' h';
  return diffMin > 0 ? 'o ' + t + ' napřed oproti Česku' : 'o ' + t + ' pozadu za Českem';
}

// Slunce: deklinace a časová rovnice jednou za vykreslení, výška Slunce pro každý bod rychle
function sunState(ms){
  const { decl, eqt } = solar(ms);
  return { eqt, utcMin: (((ms % D) + D) % D) / 60000, sinD: Math.sin(decl), cosD: Math.cos(decl), decl };
}
function altFast(s, lat, lon){
  const ha = ((s.utcMin + s.eqt + 4 * lon) / 4 - 180) * RAD, phi = lat * RAD;
  return Math.asin(Math.sin(phi) * s.sinD + Math.cos(phi) * s.cosD * Math.cos(ha)) / RAD;
}

const mapWrap = $('wmwrap'), mapEl = $('wmap'), cv = $('wm-canvas'), cx = cv.getContext('2d');
const nightCv = document.createElement('canvas'); nightCv.width = 360; nightCv.height = Math.round(MAP_SPAN);
const nctx = nightCv.getContext('2d'), nimg = nctx.createImageData(nightCv.width, nightCv.height);
let mapW = 0, mapH = 0, hoverOff = null, mapCol = null, nightMin = -1;
function readMapColors(){
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
  return { sea: g('--map-sea'), land: [g('--map-l1'), g('--map-l2'), g('--map-l3')], home: g('--map-home'), hl: g('--map-hl'),
    night: g('--map-night').split(/[ ,]+/).map(Number), nightA: parseFloat(g('--map-night-a')) || 0.45, sun: g('--sun') };
}
function updateNight(s, col){
  const W = nightCv.width, H = nightCv.height, d = nimg.data, [r, g, b] = col.night, A = col.nightA * 255;
  for (let y = 0; y < H; y++) {
    const lat = MAP_TOP - (y + 0.5) * MAP_SPAN / H;
    for (let x = 0; x < W; x++) {
      const alt = altFast(s, lat, -180 + (x + 0.5) * 360 / W);
      // plynulý přechod: plné světlo nad +1°, plná noc pod −12° (konec nautického soumraku)
      let f = (1 - alt) / 13; f = f < 0 ? 0 : f > 1 ? 1 : f; f = f * f * (3 - 2 * f);
      const o = (y * W + x) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = A * f;
    }
  }
  nctx.putImageData(nimg, 0, 0);
}
function drawMap(ms){
  if (!mapW) return;
  const col = mapCol || (mapCol = readMapColors());
  updateTzOffsets(ms);
  const s = sunState(ms), m = Math.floor(ms / 60000);
  if (m !== nightMin) { nightMin = m; updateNight(s, col); }
  const W = cv.width, H = cv.height, cw = W / NC, ch = H / NR, rad = Math.max(0.6, Math.min(cw, ch) * 0.34);
  const homeOff = offsetMin(TZ, ms);
  const paths = {};
  for (let k = 0; k < NCELL; k++) {
    const off = tzOff[cTz[k]];
    const key = off === hoverOff ? 'hl' : off === homeOff ? 'home' : 'l' + ((Math.round(off / 30) % 3 + 3) % 3);
    const p = paths[key] || (paths[key] = new Path2D());
    const x = (cI[k] + 0.5) * cw, y = (cJ[k] + 0.5) * ch;
    p.moveTo(x + rad, y); p.arc(x, y, rad, 0, 2 * Math.PI);
  }
  cx.fillStyle = col.sea; cx.fillRect(0, 0, W, H);
  ['l0', 'l1', 'l2'].forEach((key, i) => { if (paths[key]) { cx.fillStyle = col.land[i]; cx.fill(paths[key]); } });
  if (paths.home) { cx.fillStyle = col.home; cx.fill(paths.home); }
  cx.imageSmoothingEnabled = true;
  cx.drawImage(nightCv, 0, 0, W, H);
  if (paths.hl) { cx.fillStyle = col.hl; cx.fill(paths.hl); }
  // bod, kde je Slunce v nadhlavníku
  let sl = -(s.utcMin + s.eqt - 720) / 4; sl = ((sl + 540) % 360) - 180;
  const sx = (sl + 180) / 360 * W, sy = (MAP_TOP - s.decl / RAD) / MAP_SPAN * H, R = 22 * (W / mapW);
  const gr = cx.createRadialGradient(sx, sy, 0, sx, sy, R);
  gr.addColorStop(0, 'rgba(253,224,71,.55)'); gr.addColorStop(1, 'rgba(253,224,71,0)');
  cx.fillStyle = gr; cx.beginPath(); cx.arc(sx, sy, R, 0, 2 * Math.PI); cx.fill();
  cx.fillStyle = col.sun; cx.beginPath(); cx.arc(sx, sy, 4.5 * (W / mapW), 0, 2 * Math.PI); cx.fill();
}
function resizeMap(){
  const w = mapEl.clientWidth, h = mapEl.clientHeight;
  if (!w || (w === mapW && h === mapH)) return;
  mapW = w; mapH = h;
  // zvětšení stránky přes CSS (zoom na široké obrazovce): plátno v rozlišení, v jakém se skutečně zobrazí
  const dpr = Math.min(window.devicePixelRatio || 1, 2) * (mapEl.getBoundingClientRect().width / w || 1);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  mapWrap.classList.toggle('narrow', w < 720);
  drawMap(now());
  if (popIdx !== null) placePop();
}
if (window.ResizeObserver) new ResizeObserver(resizeMap).observe(mapEl); else window.addEventListener('resize', resizeMap);
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme()); } catch(e) {}

// najetí na pevninu: zvýraznit celé pásmo a ukázat jeho čas
const tipEl = $('wm-tip');
function cellFromEvent(e){
  const r = cv.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  const i = Math.floor(fx * NC), j = Math.floor(fy * NR);
  let best = -1;
  for (let dj = 0; dj <= 1 && best < 0; dj++) for (const [a, b] of dj ? [[1,0],[-1,0],[0,1],[0,-1]] : [[0,0]]) {
    const ii = i + a, jj = j + b;
    if (ii >= 0 && ii < NC && jj >= 0 && jj < NR && cellAt[jj * NC + ii] >= 0) { best = cellAt[jj * NC + ii]; break; }
  }
  // poloha v bodech uvnitř mapy (při zvětšení přes CSS zoom se liší od bodů obrazovky)
  const m = mapWrap.getBoundingClientRect(), z = (r.width / (mapW || r.width)) || 1;
  return { k: best, x: (e.clientX - m.left) / z, y: (e.clientY - m.top) / z };
}
cv.addEventListener('mousemove', e => {
  const { k, x, y } = cellFromEvent(e);
  const off = k >= 0 ? tzOff[cTz[k]] : null;
  if (off !== hoverOff) { hoverOff = off; drawMap(now()); }
  if (k < 0) { tipEl.hidden = true; return; }
  const ms = now(), q = parts(TZN[cTz[k]], ms), lab = tzLabel(cTz[k]);
  tipEl.innerHTML = '<b>' + fmtH(q.h) + ':' + pad(q.mi) + (h12 ? ' ' + ampm(q.h) : '') + '</b> ' + utcTxt(off) +
    '<br>' + diffTxt(off - offsetMin(TZ, ms)) + (lab ? ' · ' + esc(lab) : '');
  tipEl.hidden = false;
  const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
  tipEl.style.left = Math.max(4, Math.min(x + 14, mapW - tw - 4)) + 'px';
  tipEl.style.top = Math.max(4, y - th - 10) + 'px';
});
cv.addEventListener('mouseleave', () => { tipEl.hidden = true; if (hoverOff !== null) { hoverOff = null; drawMap(now()); } });

// města – jedno hlavní město za každé pásmo
const pinEls = CITIES.map((c, i) => {
  const el = document.createElement('div');
  el.className = 'pin a-' + c[5] + (c[6] ? ' p1' : '') + (c[2] === TZ ? ' home' : '');
  el.style.left = ((c[4] + 180) / 360 * 100).toFixed(3) + '%';
  el.style.top = ((MAP_TOP - c[3]) / MAP_SPAN * 100).toFixed(3) + '%';
  el.innerHTML = '<i class="dot"></i><button type="button" class="bub"><span class="l1"><svg class="wi" viewBox="0 0 24 24"></svg><b></b></span>' +
    '<span class="l2"><span class="nm"></span><em></em></span></button>';
  el.querySelector('.nm').textContent = c[0];
  $('wm-pins').appendChild(el);
  const bub = el.querySelector('.bub'), dot = el.querySelector('.dot');
  bub.setAttribute('aria-label', c[0] + ', ' + c[1]);
  for (const t of [bub, dot]) {
    t.addEventListener('mouseenter', () => { if (popPinned === null) showPop(i); });
    t.addEventListener('mouseleave', () => { if (popPinned === null) hidePop(); });
    t.addEventListener('click', e => { e.stopPropagation(); if (popPinned === i) { popPinned = null; hidePop(); } else { popPinned = i; showPop(i); } });
  }
  bub.addEventListener('focus', () => { if (popPinned === null) showPop(i); });
  bub.addEventListener('blur', () => { if (popPinned === null) hidePop(); });
  return { el, ic: el.querySelector('.wi'), tm: el.querySelector('.l1 b'), tp: el.querySelector('em'), day: null, icKey: '' };
});
document.addEventListener('click', () => { if (popPinned !== null) { popPinned = null; hidePop(); } });

function cityWx(i){
  return wx.cities && wx.cities.length === CITIES.length && wx.tc && Date.now() - wx.tc < 3*3600e3 ? wx.cities[i] : null;
}
function updatePins(ms){
  const s = sunState(ms);
  pinEls.forEach((p, i) => {
    const c = CITIES[i], q = parts(c[2], ms);
    set(p.tm, fmtH(q.h) + ':' + pad(q.mi) + (h12 ? ' ' + ampm(q.h) : ''));
    const isDay = altFast(s, c[3], c[4]) > -0.833;
    if (isDay !== p.day) { p.day = isDay; p.el.classList.toggle('day', isDay); p.el.classList.toggle('night', !isDay); }
    const w = cityWx(i), icKey = (w ? w.code : 'x') + (isDay ? 'd' : 'n');
    if (icKey !== p.icKey) { p.icKey = icKey; p.ic.innerHTML = wxIcon(w ? w.code : 0, isDay); }
    set(p.tp, w ? deg(w.temp) : '');
  });
}

// detail města (najetí / kliknutí)
const popEl = $('wm-pop');
let popIdx = null, popPinned = null;
function showPop(i){ popIdx = i; renderPop(now()); popEl.hidden = false; placePop(); }
function hidePop(){ popIdx = null; popEl.hidden = true; }
function placePop(){
  if (popIdx === null) return;
  const c = CITIES[popIdx], pw = popEl.offsetWidth, ph = popEl.offsetHeight;
  const px = (c[4] + 180) / 360 * mapW, py = (MAP_TOP - c[3]) / MAP_SPAN * mapH;
  let x, y;
  if (mapWrap.classList.contains('narrow')) { x = Math.max(0, Math.min(px - pw / 2, mapW - pw)); y = mapH + 8; }
  else {
    const a = c[5], toLeft = a.includes('e') ? true : a.includes('w') ? false : px > mapW / 2;
    x = toLeft ? px - pw - 16 : px + 16;
    if (x < 4) x = px + 16; if (x + pw > mapW - 4) x = px - pw - 16;
    y = Math.max(-8, Math.min(py - ph / 2, mapH - ph + 8));
  }
  popEl.style.left = x + 'px'; popEl.style.top = y + 'px';
}
function renderPop(ms){
  if (popIdx === null) return;
  const i = popIdx, c = CITIES[i], q = parts(c[2], ms), off = offsetMin(c[2], ms), hp = parts(TZ, ms);
  const rel = dayKey(q) === dayKey(hp) ? 'dnes' : dayKey(q) > dayKey(hp) ? 'zítra' : 'včera';
  const s = sunState(ms), isDay = altFast(s, c[3], c[4]) > -0.833;
  const st = sunTimes(q.y, q.mo, q.d, c[3], c[4]);
  const pct = t => { const p = parts(c[2], t); return (p.h * 60 + p.mi) / 14.4; };
  const seg = (a, w) => '<i style="left:' + a.toFixed(2) + '%;width:' + w.toFixed(2) + '%"></i>';
  let bar = '', sun = '';
  if (st) {
    const a = pct(st.rise), b = pct(st.set);
    bar = b >= a ? seg(a, b - a) : seg(0, b) + seg(a, 100 - a);
    const len = Math.round((st.set - st.rise) / 60000);
    sun = 'Východ ' + hm(c[2], st.rise) + ' · západ ' + hm(c[2], st.set) + ' · den ' + Math.floor(len / 60) + ' h ' + pad(len % 60) + ' min';
  } else {
    const polarDay = altFast(sunState(utc(q.y, q.mo, q.d) + (720 - 4 * c[4]) * 60000), c[3], c[4]) > 0;
    bar = polarDay ? seg(0, 100) : ''; sun = polarDay ? 'Polární den' : 'Polární noc';
  }
  const w = cityWx(i);
  const nowPct = (q.h * 60 + q.mi + q.s / 60) / 14.4;
  setHTML(popEl,
    '<div class="ph"><b>' + esc(c[0]) + '</b><span>' + esc(c[1]) + '</span></div>' +
    '<div class="pt">' + fmtH(q.h) + ':' + pad(q.mi) + '<small>:' + pad(q.s) + (h12 ? ' ' + ampm(q.h) : '') + '</small></div>' +
    '<div class="pd">' + WEEKDAY[q.wd] + ' ' + q.d + '. ' + q.mo + '. · ' + rel + ' · ' + (isDay ? 'den' : 'noc') + '</div>' +
    '<div class="po">' + utcTxt(off) + ' · ' + diffTxt(off - offsetMin(TZ, ms)) + '</div>' +
    (w ? '<div class="pw"><svg class="wi" viewBox="0 0 24 24">' + wxIcon(w.code, isDay) + '</svg><b>' + tempTxt(w.temp) + '</b> ' + (WMO[w.code] || '') + '</div>' : '') +
    '<div class="pbar">' + bar + '<b style="left:' + nowPct.toFixed(2) + '%"></b></div>' +
    '<div class="pticks"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>' +
    '<div class="ps">' + sun + '</div>');
}

let lastDay = 0, lastMin = -1;
function render(ms){
  const p = parts(TZ, ms);
  set($('hh'), fmtH(p.h)); set($('mm'), pad(p.mi)); set($('ss'), pad(p.s)); set($('ap'), ampm(p.h));
  document.title = fmtH(p.h) + ':' + pad(p.mi) + ':' + pad(p.s) + ' – František Homepage';

  const pragueOff = offsetMin(TZ, ms);
  const minuteKey = Math.floor(ms / 60000);
  const k = dayKey(p);
  if (k !== lastDay) { const first = !lastDay; lastDay = k; renderDay(p, ms, first); }

  if (minuteKey !== lastMin) { try { updatePins(ms); drawMap(ms); } catch(e) { console.error(e); } }
  try { renderPop(ms); } catch(e) { console.error(e); }
  if (minuteKey !== lastMin) { renderDst(ms, pragueOff); lastMin = minuteKey; }
}

function renderDay(p, ms, first){
  set($('c-day'), WEEKDAY[p.wd]);
  set($('c-date'), p.d + '. ' + MONTH_GEN[p.mo-1] + ' ' + p.y);
  const hol = holidayOf(p.y, p.mo, p.d);
  const tmr = new Date(Date.UTC(p.y, p.mo - 1, p.d + 1)), tm1 = tmr.getUTCMonth() + 1, td1 = tmr.getUTCDate();
  const sToday = shopsOf(p.y, p.mo, p.d), sTmr = shopsOf(tmr.getUTCFullYear(), tm1, td1);
  const pills = [];
  if (hol) pills.push(['pill', hol]);
  if (sToday === 'closed' && sTmr === 'closed') pills.push(['pill shopx', 'Dnes i zítra velké obchody zavřené']);
  else {
    if (sToday === 'closed' || sToday === 'noon') pills.push(['pill shopx', 'Dnes ' + SHOP_TXT[sToday]]);
    else if (sToday === 'open') pills.push(['pill shopo', 'Dnes velké obchody otevřené']);
    if (sTmr === 'closed' || sTmr === 'noon') pills.push(['pill shopx', 'Zítra ' + SHOP_TXT[sTmr]]);
  }
  const ch = $('c-hol');
  ch.innerHTML = '';
  pills.forEach(([c, txt]) => { const s = document.createElement('span'); s.className = c; s.textContent = txt; ch.appendChild(s); });

  const nm = nameOf(p.mo, p.d), ndTxt = nm || NO_NAME[mmdd(p.mo, p.d)] || '–';
  set($('c-nd-k'), 'Svátek');
  set($('c-nd'), ndTxt);
  $('c-nd').classList.toggle('long', ndTxt.length > 13);
  const t = new Date(Date.UTC(p.y, p.mo-1, p.d + 1));
  const tm = t.getUTCMonth()+1, td = t.getUTCDate();
  set($('c-nd2'), 'zítra ' + (nameOf(tm, td) || NO_NAME[mmdd(tm, td)] || '–'));

  set($('c-week'), isoWeek(p.y, p.mo, p.d) + '.');
  const md = daysIn(p.y, p.mo);
  set($('c-month'), MONTH[p.mo-1] + ' má ' + md + ' dní');
  const doy = Math.round((Date.UTC(p.y, p.mo-1, p.d) - Date.UTC(p.y, 0, 0)) / D);
  const len = Math.round((Date.UTC(p.y+1, 0, 1) - Date.UTC(p.y, 0, 1)) / D);
  const left = len - doy;
  set($('c-doy'), doy + '.');
  set($('c-left'), left === 0 ? 'poslední den roku' : plural(left, 'zbývá 1 den', 'zbývají ' + left + ' dny', 'zbývá ' + left + ' dní'));

  set($('c-sun-k'), 'Slunce ' + PLACE_IN);
  const st = sunTimes(p.y, p.mo, p.d, SUN_AT.lat, SUN_AT.lon);
  set($('c-sun'), st ? hm(TZ, st.rise) + ' – ' + hm(TZ, st.set) : '–');

  if (first) calReset();
  renderCal();
  renderForecast();
}

let dstCache = null;
function nextTransition(ms){
  const base = offsetMin(TZ, ms);
  let lo = ms, hi = null;
  for (let d = 1; d <= 400; d++) {
    const t = ms + d*D;
    if (offsetMin(TZ, t) !== base) { hi = t; lo = t - D; break; }
  }
  if (hi === null) return null;
  while (hi - lo > 1000) { const mid = Math.floor((lo + hi) / 2); if (offsetMin(TZ, mid) === base) lo = mid; else hi = mid; }
  hi = Math.round(hi / 60000) * 60000;
  return { at: hi, from: base, to: offsetMin(TZ, hi) };
}
function regimeTxt(off){
  if (off === 60) return 'zimní čas (SEČ, UTC+1)';
  if (off === 120) return 'letní čas (SELČ, UTC+2)';
  return 'UTC' + (off >= 0 ? '+' : MINUS) + dec(Math.abs(off)/60, 0);
}
function renderDst(ms, off){
  set($('regime'), 'Platí ' + regimeTxt(off));
  if (!dstCache || ms >= dstCache.at || dstCache.from !== off) dstCache = nextTransition(ms);
  const box = $('dstbox');
  let html = '<p>Teď platí <b>' + regimeTxt(off) + '</b>.</p>';
  if (dstCache) {
    const tr = dstCache, before = parts('UTC', tr.at + tr.from*60000), after = parts('UTC', tr.at + tr.to*60000);
    const fwd = tr.to > tr.from;
    const today = parts(TZ, ms);
    const days = Math.round((Date.UTC(before.y, before.mo-1, before.d) - Date.UTC(today.y, today.mo-1, today.d)) / D);
    const when = days === 0 ? 'dnes' : days === 1 ? 'zítra' : plural(days, 'za 1 den', 'za ' + days + ' dny', 'za ' + days + ' dní');
    html += '<p>Další změna: <b>' + WEEKDAY[before.wd].toLowerCase() + ' ' + before.d + '. ' + MONTH_GEN[before.mo-1] + ' ' + before.y + ', ' +
      before.h + ':' + pad(before.mi) + ' → ' + after.h + ':' + pad(after.mi) + '</b> (' + when + '). ' +
      (fwd ? 'Začíná letní čas, noc bude o hodinu kratší.' : 'Začíná zimní čas, noc bude o hodinu delší.') + '</p>';
  } else {
    html += '<p>V příštích 12 měsících se čas měnit nebude.</p>';
  }
  html += '<p>V EU platí letní čas od poslední neděle v březnu do poslední neděle v říjnu, přechod je vždy v 1:00 UTC. Ostatní země mají vlastní pravidla; mapa světového času je bere z časových pásem prohlížeče.</p>';
  if (box.innerHTML !== html) box.innerHTML = html;
}

function setFooter(){
  const src = syncInfo && syncInfo.src ? syncInfo.src : 'time.akamai.com (záložně worldtimeapi.org, timeapi.io)';
  $('foot').innerHTML = '<b>Vytvořil František Holas.</b>' +
    '<br>Zdroje: čas ' + src + ' · počasí, předpověď a hledání míst <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0)' +
    ' · mapa Natural Earth (volné dílo) a tz-lookup (CC0) · jmenný kalendář namedays-cs (MIT) · písmo hodin Michroma (OFL) · svátky podle zákona č. 245/2000 Sb. · východ a západ slunce výpočtem podle NOAA.' +
    '<br>Soukromí: stránka nemá vlastní server a nepoužívá cookies. Pro počasí a ověření času se váš prohlížeč připojuje k Open-Meteo a time.akamai.com, polohu odešle jen po kliknutí na „Moje poloha“. ' +
    'Volby (formát času, světlý/tmavý režim, pohled kalendáře) a poslední stažené počasí si pamatuje jen váš prohlížeč. Hosting (GitHub Pages) může zaznamenávat IP adresy návštěvníků.';
}

/* ===== 24 h / 12 h ===== */
function applyMode(){
  document.querySelectorAll('#hfmt button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.h === '12') === h12)));
}
document.querySelectorAll('#hfmt button').forEach(b => b.addEventListener('click', () => {
  h12 = b.dataset.h === '12'; store.set('pc_h12', h12); applyMode(); render(now());
}));

/* ===== Světlý / tmavý režim: výchozí podle systému, tlačítko v záhlaví ho ručně přepne ===== */
// Volba se pamatuje v localStorage (pc_theme). Když se ručně zvolený režim shoduje se systémem,
// volba se smaže a stránka se zase řídí systémem. Barvy jsou v styl.css (data-theme na <html>).
function sysDark(){ try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch(e) { return false; } }
function themeNow(){ const t = document.documentElement.getAttribute('data-theme'); return t === 'dark' || t === 'light' ? t : (sysDark() ? 'dark' : 'light'); }
function applyTheme(){
  try {
    const t = store.get('pc_theme'), root = document.documentElement;
    if (t === 'dark' || t === 'light') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    const dark = themeNow() === 'dark', b = $('theme');
    root.setAttribute('data-scheme', dark ? 'dark' : 'light');
    if (b) { b.setAttribute('aria-pressed', String(dark)); b.title = dark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'; }
    mapCol = null; nightMin = -1; drawMap(now());   // mapa si barvy pamatuje, načíst znovu
  } catch(e) { console.error(e); }
}
if ($('theme')) $('theme').addEventListener('click', () => {
  const next = themeNow() === 'dark' ? 'light' : 'dark';
  if ((next === 'dark') === sysDark()) store.del('pc_theme'); else store.set('pc_theme', next);
  applyTheme();
});
window.addEventListener('storage', e => { if (e.key === 'pc_theme') applyTheme(); });   // změna v jiné záložce
applyTheme();

/* ===== Smyčka ===== */
let lastWall = Date.now(), lastPerf = performance.now();
function tick(){
  const w = Date.now(), pf = performance.now();
  if (Math.abs((w - lastWall) - (pf - lastPerf)) > 2000) syncTime();   // probuzení ze spánku / změna hodin
  lastWall = w; lastPerf = pf;
  const n = now();
  try { render(n); } catch(e) { console.error(e); }   // chyba v jedné části nesmí zastavit hodiny
  setTimeout(tick, 1000 - (n % 1000) + 3);
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (Date.now() - lastSyncAt > 10*60000) syncTime();
  loadWeather();
  render(now());
});
setInterval(() => { if (Date.now() - lastSyncAt > 30*60000) syncTime(); }, 60000);
setInterval(loadWeather, 5*60000);   // skutečný dotaz jen když jsou data starší než 15 min

applyMode();
set($('wx-home-k'), 'Počasí ' + PLACE_IN);
set($('fc-home'), '‹ ' + HOME_WX.name);
[['calendar', 'sec-calendar'], ['forecast', 'sec-forecast'], ['worldMap', 'sec-world'], ['timeChange', 'sec-timechange']]
  .forEach(([k, id]) => { if (CFG.sections[k] === false) $(id).hidden = true; });
setFooter();
tick();
renderWeather();
syncTime();
loadWeather();
})();
