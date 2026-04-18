/**
 * Startup Profile Red Flag analysis via Mistral HTTP API.
 * Detects suspicious indicators from a complete profile JSON.
 */

const { getMistralKey } = require('../utils/mistralKey');

const MISTRAL_CHAT_URL = 'https://api.mistral.ai/v1/chat/completions';

const RED_FLAG_SYSTEM_PROMPT = `You are a strict and highly critical startup due diligence AI for CleanLedger. 
Analyze the provided JSON representing a startup's complete profile (including team, financials, milestones, and description).
Your job is to identify "Red Flags" — suspicious indicators, unrealistic timelines, vague claims, missing qualifications, or problematic fund allocations that an investor must be warned about.

Your response MUST be valid JSON in this exact format:
{
  "redFlags": ["red flag 1", "red flag 2", "red flag 3"]
}

If no significant red flags are found, return an empty array for "redFlags". Focus on:
- Discrepancies between target funding and stated milestones/timeline
- Lack of verifiable details in the team (e.g., missing linked profiles)
- Overly generic descriptions or AI-generated boilerplate
- Missing tech/legal budget for complex tech/regulated industries
Be extremely concise. Maximum 5 red flags.`;

function parseAnalysisFromAiText(aiResponse) {
  try {
    let clean = String(aiResponse).trim();
    if (clean.startsWith('```')) {
      const parts = clean.split('```');
      clean = parts[1] || clean;
      if (clean.startsWith('json')) clean = clean.slice(4);
    }
    const parsed = JSON.parse(clean.trim());
    return parsed.redFlags || [];
  } catch {
    return [];
  }
}

/**
 * @param {object} profileData
 * @returns {Promise<string[]>} Array of red flag strings
 */
async function analyzeRedFlags(profileData) {
  const apiKey = getMistralKey();
  if (!apiKey) {
    const err = new Error('Mistral API key not configured.');
    err.code = 'NO_KEY';
    throw err;
  }

  const model = (process.env.MISTRAL_CHAT_MODEL || 'mistral-small-latest').trim();
  const profileString = JSON.stringify(profileData, null, 2).slice(0, 10000); // safety cap

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
        { role: 'system', content: RED_FLAG_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this complete startup profile for red flags:\n\n${profileString}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Mistral RedFlag API error:', data);
    return []; // Fail silently on red flags to not break profile saving
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) return [];

  return parseAnalysisFromAiText(content);
}

module.exports = {
  analyzeRedFlags,
};
