const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const corsOptions = require('./config/cors');

// Route imports
const authRoutes          = require('./routes/authRoutes');
const dashboardRoutes     = require('./routes/dashboardRoutes');
const startupRoutes       = require('./routes/startupRoutes');
const auditRoutes         = require('./routes/auditRoutes');
const voiceRoutes         = require('./routes/voiceRoutes');
const profileRoutes       = require('./routes/profileRoutes');
const uploadRoutes        = require('./routes/uploadRoutes');
const investorProfileRoutes = require('./routes/investorProfileRoutes');
const founderProfileRoutes  = require('./routes/founderProfileRoutes');
const trustRoutes         = require('./routes/trustRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const investmentRoutes    = require('./routes/investmentRoutes');
const errorHandler        = require('./middleware/errorHandler');

const app = express();

// ── Security ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads ───────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Routes ───────────────────────────────────────────────────
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/dashboard',   dashboardRoutes);
app.use('/api/v1/startups',    startupRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/audit',       auditRoutes);
app.use('/api/v1/voice',       voiceRoutes);
app.use('/api/v1/profile',     profileRoutes);
app.use('/api/v1/uploads',     uploadRoutes);
app.use('/api/v1/investor-profile', investorProfileRoutes);
app.use('/api/v1/founder-profile', founderProfileRoutes);
app.use('/api/v1/trust',       trustRoutes);
app.use('/api/v1',             communicationRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'CleanLedger API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
