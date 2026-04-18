const express = require('express');
const router = express.Router();
const { voiceChat, summarizePitch } = require('../controllers/voiceController');

// POST /api/v1/voice/chat — Mistral AI conversational chat for voice login
router.post('/chat', voiceChat);
// POST /api/v1/voice/summarize-pitch — Mistral pitch / business plan analysis
router.post('/summarize-pitch', summarizePitch);

module.exports = router;
