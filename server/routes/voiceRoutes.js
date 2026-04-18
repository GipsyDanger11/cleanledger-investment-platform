const express = require('express');
const router = express.Router();
const { voiceChat } = require('../controllers/voiceController');

// POST /api/v1/voice/chat — Mistral AI conversational chat for voice login
router.post('/chat', voiceChat);

module.exports = router;
