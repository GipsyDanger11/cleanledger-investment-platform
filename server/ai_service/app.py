"""
CleanLedger JARVIS AI Voice Service
Flask server that handles Mistral AI conversations for voice login/signup.
Runs on port 5001, proxied by the Node.js server.
Uses direct HTTP calls to Mistral API (no SDK dependency issues).
"""

import os
import json
import urllib.request
import urllib.error
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are JARVIS, an AI assistant for CleanLedger — a secure investment platform. You help users log in and sign up using voice commands.

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


def call_mistral(messages):
    """Call Mistral API directly via HTTP POST."""
    payload = json.dumps({
        "model": "mistral-large-latest",
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 300,
    }).encode("utf-8")

    req = urllib.request.Request(
        MISTRAL_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "JARVIS AI Voice Service"})


@app.route("/chat", methods=["POST"])
def chat():
    """
    POST /chat
    Body: { "messages": [{ "role": "user"|"assistant", "content": "..." }] }
    Returns: { "success": true, "response": "AI text" }
    """
    try:
        if not MISTRAL_API_KEY:
            return jsonify({
                "success": False,
                "message": "Mistral API key not configured. Set MISTRAL_API_KEY env variable."
            }), 500

        data = request.get_json(force=True)
        messages = data.get("messages", [])

        # Build chat messages with system prompt
        chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in messages:
            chat_messages.append({
                "role": m.get("role", "user"),
                "content": m.get("content", "")
            })

        ai_text = call_mistral(chat_messages)
        return jsonify({"success": True, "response": ai_text})

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        print(f"[JARVIS ERROR] Mistral API HTTP {e.code}: {error_body}")
        return jsonify({
            "success": False,
            "message": f"Mistral API error ({e.code}): {error_body}"
        }), 502

    except Exception as e:
        print(f"[JARVIS ERROR] {type(e).__name__}: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"AI service error: {str(e)}"
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("AI_SERVICE_PORT", 5001))
    print(f"[JARVIS] AI Service running on port {port}")
    if not MISTRAL_API_KEY:
        print("[WARNING] MISTRAL_API_KEY not set! Voice AI will not work.")
    else:
        print(f"[OK] Mistral API key loaded ({MISTRAL_API_KEY[:8]}...)")
    app.run(host="0.0.0.0", port=port, debug=False)
