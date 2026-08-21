/* Orbies — shared helpers
 * Plain classic script (no modules) so it also runs from file:// during testing. */

// Big-number formatter: 1.23K, 4.56M, ... then aa, ab, ac at very large scale.
const NUM_SUFFIXES = [
  '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
];
function fmt(n) {
  if (n === Infinity) return '∞';
  if (n == null || isNaN(n)) return '0';
  const neg = n < 0;
  n = Math.abs(n);
  if (n < 1000) {
    // Whole numbers stay whole; small fractions keep one decimal.
    return (neg ? '-' : '') + (Number.isInteger(n) ? String(n) : n.toFixed(1));
  }
  const tier = Math.floor(Math.log10(n) / 3);
  let out;
  if (tier < NUM_SUFFIXES.length) {
    const scaled = n / Math.pow(1000, tier);
    out = scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + NUM_SUFFIXES[tier];
  } else {
    // Alphabetic suffixes: aa, ab, ... za, zb ...
    let idx = tier - NUM_SUFFIXES.length;
    const first = String.fromCharCode(97 + Math.floor(idx / 26) % 26);
    const second = String.fromCharCode(97 + (idx % 26));
    const scaled = n / Math.pow(1000, tier);
    out = scaled.toFixed(2) + first + second;
  }
  return (neg ? '-' : '') + out;
}

// Short elapsed / countdown formatter, e.g. "1h 04m", "12s".
function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return h + 'h ' + String(m).padStart(2, '0') + 'm';
  if (m > 0) return m + 'm ' + String(s).padStart(2, '0') + 's';
  return s + 's';
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Weighted pick: entries is [{key/value..., weight}], returns the chosen entry.
function weightedPick(entries, weightFn) {
  let total = 0;
  for (const e of entries) total += Math.max(0, weightFn(e));
  let r = Math.random() * total;
  for (const e of entries) {
    r -= Math.max(0, weightFn(e));
    if (r <= 0) return e;
  }
  return entries[entries.length - 1];
}

function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Tiny DOM helpers.
function el(id) { return document.getElementById(id); }
function make(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

// A short, reasonably-unique id for owned rings, floating text, etc.
let __idc = 0;
function uid(prefix) { return (prefix || 'id') + '_' + (Date.now().toString(36)) + '_' + (__idc++); }
