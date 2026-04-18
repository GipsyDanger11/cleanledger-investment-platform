/**
 * Mistral API key: read from server/.env (UTF-8 / UTF-16) + merge dotenv so OS empty vars don't win.
 */

const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..');

/** Load env files in order; later files override (server/.env last = wins). */
function mergeDotenv() {
  const paths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'server', '.env'),
    path.join(SERVER_DIR, '.env'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      require('dotenv').config({ path: p, override: true });
    }
  }
}

mergeDotenv();

const ENV_READ_ORDER = [
  path.join(SERVER_DIR, '.env'),
  path.join(process.cwd(), 'server', '.env'),
  path.join(process.cwd(), '.env'),
];

function parseMistralKeyFromRaw(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let s = raw;
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  for (let line of s.split(/\r?\n/)) {
    line = line.replace(/\r/g, '').trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    let name = line.slice(0, eq).trim().replace(/^\ufeff/, '');
    if (name !== 'MISTRAL_API_KEY') continue;
    let v = line.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v.trim();
  }
  return '';
}

function readEnvFileText(envPath) {
  const buf = fs.readFileSync(envPath);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString('utf16le');
  }
  return buf.toString('utf8');
}

function readMistralKeyFromAnyEnvFile() {
  for (const envPath of ENV_READ_ORDER) {
    try {
      if (!fs.existsSync(envPath)) continue;
      const raw = readEnvFileText(envPath);
      const k = parseMistralKeyFromRaw(raw);
      if (k) return k;
    } catch (_) {
      /* skip */
    }
  }
  return '';
}

let warnedMissingKey = false;

function getMistralKey() {
  mergeDotenv();
  const fromFile = readMistralKeyFromAnyEnvFile();
  if (fromFile) return fromFile;
  const fromEnv = (process.env.MISTRAL_API_KEY || '').trim();
  if (fromEnv) return fromEnv;
  if (!warnedMissingKey) {
    warnedMissingKey = true;
    console.warn(
      '[mistral] MISTRAL_API_KEY missing — add MISTRAL_API_KEY=... to server/.env (UTF-8)',
    );
  }
  return '';
}

function withMistralKey(body) {
  const key = getMistralKey();
  if (!key) return body;
  return { ...body, mistralApiKey: key };
}

function pythonFetchHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const key = getMistralKey();
  if (key) {
    headers['X-Mistral-Api-Key'] = key;
  }
  return headers;
}

function logMistralStartup() {
  const key = getMistralKey();
  const url = process.env.AI_SERVICE_URL || 'http://localhost:5001';
  if (!key) {
    console.warn('[jarvis] Mistral: NOT configured — set MISTRAL_API_KEY in server/.env');
    return;
  }
  console.log(`[jarvis] Mistral: API key loaded (${key.length} chars) → will proxy to ${url}`);
  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), 2500);
  fetch(`${url.replace(/\/$/, '')}/health`, { signal: ac.signal })
    .then(async (r) => {
      clearTimeout(tid);
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        console.log(
          `[jarvis] Python JARVIS: reachable — model=${j.mistral_model || 'default'} sdk=${j.sdk_preferred}`,
        );
      } else {
        console.warn(`[jarvis] Python JARVIS: /health returned ${r.status}`);
      }
    })
    .catch(() => {
      clearTimeout(tid);
      console.warn(
        `[jarvis] Python JARVIS: not reachable at ${url} — start: cd server/ai_service && py app.py`,
      );
    });
}

module.exports = {
  getMistralKey,
  withMistralKey,
  pythonFetchHeaders,
  logMistralStartup,
  mergeDotenv,
};
