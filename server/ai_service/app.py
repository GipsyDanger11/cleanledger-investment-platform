"""
CleanLedger JARVIS AI Voice Service
Flask — Mistral AI via official Python SDK (v2) with HTTP fallback
Runs on port 5001 (override with AI_SERVICE_PORT)
"""

import json
import os
import urllib.error
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

# Load server/ai_service/.env then server/.env.
# override=True: a blank MISTRAL_API_KEY in the OS would otherwise block values from .env
_ai_root = Path(__file__).resolve().parent
for _env_path in (_ai_root / ".env", _ai_root.parent / ".env"):
    if _env_path.is_file():
        load_dotenv(_env_path, override=True, encoding="utf-8-sig")

app = Flask(__name__)
CORS(app)


def _mistral_key_from_request(data):
    """Prefer proxy header (Node), then JSON body, then WSGI env (header spelling)."""
    if not isinstance(data, dict):
        data = {}
    hdr = (
        (request.headers.get("X-Mistral-Api-Key") or "").strip()
        or (request.environ.get("HTTP_X_MISTRAL_API_KEY") or "").strip()
    )
    body = (data.get("mistralApiKey") or "").strip()
    return (hdr or body).strip()


MISTRAL_API_KEY = (os.environ.get("MISTRAL_API_KEY") or "").strip()
MISTRAL_API_URL = os.environ.get(
    "MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions"
)
# Default: mistral-small-latest works on typical free/dev tiers; override in .env if needed.
MISTRAL_CHAT_MODEL = os.environ.get("MISTRAL_CHAT_MODEL", "mistral-small-latest")

# ── System prompt for voice login ────────────────────────
VOICE_SYSTEM_PROMPT = """You are JARVIS, an AI assistant for CleanLedger — a secure investment platform. You help users log in and sign up using voice commands.

Your personality: Sophisticated, concise, and helpful — like Tony Stark's JARVIS AI.

RULES:
1. When starting a conversation, greet the user and ask what they'd like to do (login or sign up).
2. For LOGIN: Ask for their email, then password. Once you have both, respond with a JSON block: {"action":"login","email":"...","password":"..."}
3. For SIGNUP: Ask for their name, email, password, and role (startup or investor). Once you have all, respond with a JSON block: {"action":"register","name":"...","email":"...","password":"...","role":"..."}
4. Always be conversational but efficient. Guide the user step by step.
5. If the user provides partial info, acknowledge what you have and ask for the missing piece.
6. Never repeat the password back to the user. Just acknowledge it.
7. Keep responses under 2 sentences when possible.
8. When you have all required information, ALWAYS include the JSON block at the end of your message, wrapped in ```json code fence."""

# ── System prompt for pitch summarizer ───────────────────
PITCH_SYSTEM_PROMPT = """You are a startup investment analyst AI for CleanLedger. Analyze the given startup pitch or business plan text and return a structured JSON analysis.

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
Be concise, professional, and objective. Focus on investor-relevant insights."""


def _call_mistral_http(messages, temperature=0.4, max_tokens=600, api_key=None):
    """REST fallback (OpenAI-compatible chat completions)."""
    key = (api_key or MISTRAL_API_KEY or "").strip()
    payload = json.dumps({
        "model": MISTRAL_CHAT_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }).encode("utf-8")

    req = urllib.request.Request(
        MISTRAL_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
            "Accept": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"]


def _call_mistral_sdk(messages, temperature=0.4, max_tokens=600, api_key=None):
    """Official mistralai v2 SDK."""
    from mistralai.client import Mistral

    key = (api_key or MISTRAL_API_KEY or "").strip()
    kwargs = {
        "model": MISTRAL_CHAT_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    with Mistral(api_key=key) as client:
        try:
            res = client.chat.complete(**kwargs, response_format={"type": "text"})
        except TypeError:
            # Older SDK builds without response_format on this method
            res = client.chat.complete(**kwargs)

    choices = getattr(res, "choices", None) or []
    if not choices:
        raise RuntimeError("Mistral returned no choices")
    first = choices[0]
    msg = getattr(first, "message", first)
    content = getattr(msg, "content", None)
    if content is None and isinstance(msg, dict):
        content = msg.get("content")
    if not content:
        raise RuntimeError("Mistral returned empty content")
    return content


def call_mistral(messages, temperature=0.4, max_tokens=600, api_key=None):
    """Prefer SDK; fall back to HTTP if SDK import or call fails."""
    key = (api_key or MISTRAL_API_KEY or "").strip()
    if not key:
        raise ValueError("MISTRAL_API_KEY not set")

    use_sdk = os.environ.get("MISTRAL_USE_SDK", "1").strip() not in ("0", "false", "no")
    if use_sdk:
        try:
            return _call_mistral_sdk(messages, temperature, max_tokens, api_key=key)
        except Exception as e:
            print(f"[JARVIS] Mistral SDK failed ({type(e).__name__}: {e}), using HTTP fallback")

    return _call_mistral_http(messages, temperature, max_tokens, api_key=key)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "JARVIS AI Voice Service",
        "mistral_model": MISTRAL_CHAT_MODEL,
        "sdk_preferred": os.environ.get("MISTRAL_USE_SDK", "1") not in ("0", "false", "no"),
    })


@app.route("/chat", methods=["POST"])
def chat():
    """
    POST /chat
    Body: { "messages": [{ "role": "user"|"assistant", "content": "..." }] }
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        req_key = _mistral_key_from_request(data)
        data.pop("mistralApiKey", None)
        effective_key = req_key or MISTRAL_API_KEY
        if not effective_key:
            return jsonify({
                "success": False,
                "message": "Mistral API key not configured.",
            }), 500

        messages = data.get("messages", [])

        chat_messages = [{"role": "system", "content": VOICE_SYSTEM_PROMPT}]
        for m in messages:
            chat_messages.append({
                "role": m.get("role", "user"),
                "content": m.get("content", ""),
            })

        ai_text = call_mistral(chat_messages, api_key=effective_key)
        return jsonify({"success": True, "response": ai_text})

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        print(f"[JARVIS ERROR] Mistral API HTTP {e.code}: {error_body}")
        return jsonify({
            "success": False,
            "message": f"Mistral API error ({e.code})",
        }), 502
    except Exception as e:
        print(f"[JARVIS ERROR] {type(e).__name__}: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"AI service error: {str(e)}",
        }), 500


@app.route("/summarize-pitch", methods=["POST"])
def summarize_pitch():
    """
    POST /summarize-pitch
    Body: { "text": "full business plan text..." }
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        req_key = _mistral_key_from_request(data)
        data.pop("mistralApiKey", None)
        effective_key = req_key or MISTRAL_API_KEY
        if not effective_key:
            return jsonify({
                "success": False,
                "message": "Mistral API key not configured.",
            }), 500

        pitch_text = data.get("text", "").strip()

        if not pitch_text:
            return jsonify({"success": False, "message": "No pitch text provided"}), 400
        if len(pitch_text) < 15:
            return jsonify({
                "success": False,
                "message": "Pitch text too short. Add at least one full sentence (15+ characters).",
            }), 400
        if len(pitch_text) > 10000:
            pitch_text = pitch_text[:10000]

        messages = [
            {"role": "system", "content": PITCH_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Analyze this startup pitch/business plan:\n\n{pitch_text}",
            },
        ]

        ai_response = call_mistral(
            messages, temperature=0.2, max_tokens=800, api_key=effective_key
        )

        try:
            clean = ai_response.strip()
            if clean.startswith("```"):
                parts = clean.split("```")
                clean = parts[1] if len(parts) > 1 else clean
                if clean.startswith("json"):
                    clean = clean[4:]
            analysis = json.loads(clean.strip())
        except json.JSONDecodeError:
            analysis = {
                "summary": ai_response[:300],
                "keyPoints": [],
                "marketOpportunity": "",
                "riskFlags": [],
                "trustSignals": [],
                "recommendedCategory": "Other",
                "viabilityScore": 50,
            }

        return jsonify({"success": True, "analysis": analysis})

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        print(f"[JARVIS ERROR] Mistral API HTTP {e.code}: {error_body}")
        return jsonify({
            "success": False,
            "message": f"Mistral API error ({e.code})",
        }), 502
    except Exception as e:
        print(f"[JARVIS ERROR] {type(e).__name__}: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"AI service error: {str(e)}",
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("AI_SERVICE_PORT", "5001"))
    print(f"[JARVIS] AI Service on port {port} | model={MISTRAL_CHAT_MODEL}")
    if not MISTRAL_API_KEY:
        print(
            "[OK] MISTRAL_API_KEY not in env — Node will send it per request "
            "(X-Mistral-Api-Key). Or set MISTRAL_API_KEY in server/.env."
        )
    else:
        print(f"[OK] Mistral configured from env ({MISTRAL_API_KEY[:8]}…)")
    app.run(host="0.0.0.0", port=port, debug=False)
