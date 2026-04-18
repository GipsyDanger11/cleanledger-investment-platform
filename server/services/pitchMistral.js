/**
 * Pitch / business plan analysis via Mistral HTTP API (same contract as Python /summarize-pitch).
 * Keeps analysis on Node so server/.env key is used without the Flask proxy.
 */

const { getMistralKey } = require('../utils/mistralKey');

const MISTRAL_CHAT_URL = 'https://api.mistral.ai/v1/chat/completions';

const PITCH_SYSTEM_PROMPT = `You are a startup investment analyst AI for CleanLedger. Analyze the given startup pitch or business plan text and return a structured JSON analysis.

Your response MUST be valid JSON in this exact format:
{
  "summary": "2-3 sentence executive summary",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "marketOpportunity": "One sentence about target market size and opportunity",
  "riskFlags": ["risk 1", "risk 2", "risk 3"],
  "trustSignals": ["positive signal 1", "positive signal 2"],
  "recommendedCategory": "FinTech|HealthTech|EdTech|AgriTech|CleanTech|SaaS|E-Commerce|Other",
  "viabilityScore": 75
}

The viabilityScore is 0-100 based on the quality and completeness of the pitch.
Be concise, professional, and objective. Focus on investor-relevant insights.`;

function parseAnalysisFromAiText(aiResponse) {
  try {
    let clean = String(aiResponse).trim();
    if (clean.startsWith('```')) {
      const parts = clean.split('```');
      clean = parts[1] || clean;
      if (clean.startsWith('json')) clean = clean.slice(4);
    }
    return JSON.parse(clean.trim());
  } catch {
    return {
      summary: String(aiResponse).slice(0, 300),
      keyPoints: [],
      marketOpportunity: '',
      riskFlags: [],
      trustSignals: [],
      recommendedCategory: 'Other',
      viabilityScore: 50,
    };
  }
}

/**
 * @param {string} pitchText
 * @returns {Promise<object>} analysis object
 */
async function analyzePitchText(pitchText) {
  const apiKey = getMistralKey();
  if (!apiKey) {
    const err = new Error('Mistral API key not configured.');
    err.code = 'NO_KEY';
    throw err;
  }

  const model = (process.env.MISTRAL_CHAT_MODEL || 'mistral-small-latest').trim();
  const snippet = pitchText.slice(0, 10000);

  const res = await fetch(MISTRAL_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: PITCH_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this startup pitch/business plan:\n\n${snippet}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.message ||
      (data.error && data.error.message) ||
      `Mistral API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from Mistral');
  }

  return parseAnalysisFromAiText(content);
}

module.exports = { analyzePitchText, PITCH_SYSTEM_PROMPT };
