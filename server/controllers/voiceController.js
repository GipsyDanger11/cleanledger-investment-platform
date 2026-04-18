/**
 * Voice Controller — Proxies to Python JARVIS AI Service
 * The Python service (Flask + Mistral) runs on port 5001
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /api/v1/voice/chat
 * Body: { messages: [{ role, content }] }
 * Proxies to Python AI service → returns Mistral response
 */
const voiceChat = async (req, res, next) => {
  try {
    const { messages = [] } = req.body;

    // Use native fetch (Node 18+) to call Python service
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

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
      message: 'JARVIS AI service is not available. Make sure the Python service is running on port 5001.',
    });
  }
};

module.exports = { voiceChat };
