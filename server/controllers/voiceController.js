/**
 * Voice Controller — Proxies to Python JARVIS AI Service
 * The Python service (Flask + Mistral) runs on port 5001
 */

const {
  getMistralKey,
  withMistralKey,
  pythonFetchHeaders,
} = require('../utils/mistralKey');
const { analyzePitchText } = require('../services/pitchMistral');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /api/v1/voice/chat
 * Body: { messages: [{ role, content }] }
 */
const voiceChat = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: pythonFetchHeaders(),
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
 * Calls Mistral directly from Node (uses server/.env via mistralKey) — no Python required.
 */
const summarizePitch = async (req, res) => {
  try {
    const { text = '' } = req.body;
    const pitchText = String(text || '').trim();
    if (!pitchText) {
      return res.status(400).json({
        success: false,
        message: 'No pitch text provided',
      });
    }
    if (pitchText.length < 15) {
      return res.status(400).json({
        success: false,
        message:
          'Pitch text too short. Add at least one full sentence (15+ characters).',
      });
    }

    const analysis = await analyzePitchText(pitchText);
    return res.json({ success: true, analysis });
  } catch (err) {
    if (err.code === 'NO_KEY') {
      return res.status(500).json({
        success: false,
        message:
          'Mistral API key not configured. Add MISTRAL_API_KEY to server/.env (UTF-8) and restart nodemon.',
      });
    }
    console.error('Pitch summarize error:', err.message);
    const status = err.status >= 400 && err.status < 600 ? err.status : 502;
    return res.status(status).json({
      success: false,
      message: err.message || 'AI analysis failed.',
    });
  }
};

module.exports = { voiceChat, summarizePitch };
