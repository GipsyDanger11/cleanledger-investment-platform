/**
 * Voice Controller — Proxies to Python JARVIS AI Service
 * The Python service (Flask + Mistral) runs on port 5001
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

async function proxyToPython(path, body, res) {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
      body: JSON.stringify({ messages }),
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
