/**
 * Voice Controller — Proxies to Python JARVIS AI Service
 * The Python service (Flask + Mistral) runs on port 5001
 */

const fs = require('fs');
const path = require('path');

// server/controllers → parent is server/ (where .env lives)
const SERVER_ROOT = path.join(__dirname, '..');
const SERVER_ENV = path.join(SERVER_ROOT, '.env');

require('dotenv').config({ path: SERVER_ENV });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/** Read key from disk if process.env is empty (some npm/cwd setups skip dotenv in server.js). */
function readMistralKeyFromFile() {
  try {
    const raw = fs.readFileSync(SERVER_ENV, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*MISTRAL_API_KEY\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[1].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return v;
    }
  } catch (_) {
    /* no .env file */
  }
  return '';
}

let warnedMissingKey = false;

function getMistralKey() {
  const fromEnv = (process.env.MISTRAL_API_KEY || '').trim();
  if (fromEnv) return fromEnv;
  const fromFile = readMistralKeyFromFile();
  if (fromFile) return fromFile;
  if (!warnedMissingKey) {
    warnedMissingKey = true;
    console.warn(
      '[voice] MISTRAL_API_KEY missing. Add it to server/.env (see .env.example).',
    );
  }
  return '';
}

/** Forward key so Python JARVIS works even when its process does not load server/.env */
function withMistralKey(body) {
  const key = getMistralKey();
  if (!key) return body;
  return { ...body, mistralApiKey: key };
}

async function proxyToPython(path, body, res) {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withMistralKey(body)),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return res.status(response.status).json({
      success: false,
      message: data.message || 'AI service error.',
    });
  }

  return res.json(data);
}

/**
 * POST /api/v1/voice/chat
 * Body: { messages: [{ role, content }] }
 * Proxies to Python AI service → returns Mistral response
 */
const voiceChat = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withMistralKey({ messages })),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || 'AI service error.',
      });
    }

    res.json({ success: true, response: data.response });
  } catch (err) {
    console.error('Voice proxy error:', err.message);
    res.status(503).json({
      success: false,
      message:
        'JARVIS AI service is not available. Start the Python service (server/ai_service) on port 5001 and set AI_SERVICE_URL if needed.',
    });
  }
};

/**
 * POST /api/v1/voice/summarize-pitch
 * Body: { text: string }
 * Proxies to Python /summarize-pitch (Mistral pitch analysis)
 */
const summarizePitch = async (req, res) => {
  try {
    const { text = '' } = req.body;
    return await proxyToPython('/summarize-pitch', { text }, res);
  } catch (err) {
    console.error('Pitch summarize proxy error:', err.message);
    res.status(503).json({
      success: false,
      message:
        'JARVIS AI service is not available. Start the Python service (server/ai_service) on port 5001.',
    });
  }
};

module.exports = { voiceChat, summarizePitch };
