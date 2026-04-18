const { Mistral } = require('@mistralai/mistralai');

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || '' });

const SYSTEM_PROMPT = `You are JARVIS, an AI assistant for CleanLedger — a secure investment platform. You help users log in and sign up using voice commands.

Your personality: Sophisticated, concise, and helpful — like Tony Stark's JARVIS AI.

RULES:
1. When starting a conversation, greet the user and ask what they'd like to do (login or sign up).
2. For LOGIN: Ask for their email, then password. Once you have both, respond with a JSON block: {"action":"login","email":"...","password":"..."}
3. For SIGNUP: Ask for their name, email, password, and role (startup or investor). Once you have all, respond with a JSON block: {"action":"register","name":"...","email":"...","password":"...","role":"..."}
4. Always be conversational but efficient. Guide the user step by step.
5. If the user provides partial info, acknowledge what you have and ask for the missing piece.
6. Never repeat the password back to the user. Just acknowledge it.
7. Keep responses under 2 sentences when possible.
8. When you have all required information, ALWAYS include the JSON block at the end of your message, wrapped in \`\`\`json code fence.`;

/**
 * POST /api/v1/voice/chat
 * Body: { messages: [{ role, content }] }
 * Returns AI response text from Mistral
 */
const voiceChat = async (req, res, next) => {
  try {
    const { messages = [] } = req.body;

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Mistral API key not configured. Add MISTRAL_API_KEY to .env',
      });
    }

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: chatMessages,
      temperature: 0.4,
      maxTokens: 300,
    });

    const aiText = response.choices?.[0]?.message?.content || 'I apologize, I could not process that. Please try again.';

    res.json({ success: true, response: aiText });
  } catch (err) {
    console.error('Mistral voice chat error:', err.message);
    next(err);
  }
};

module.exports = { voiceChat };
