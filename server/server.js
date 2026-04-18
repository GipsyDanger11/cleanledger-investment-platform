const { execSync } = require('child_process');
// Loads merged .env (server/.env wins) — see utils/mistralKey.js
const { logMistralStartup } = require('./utils/mistralKey');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Kill any process currently using the target port (Windows).
 * This prevents EADDRINUSE crashes on restart.
 */
function killPortProcess(port) {
  try {
    const result = execSync(
      `netstat -ano | findstr :${port} | findstr LISTENING`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const lines = result.trim().split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && pid !== String(process.pid)) {
        pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
        console.log(`[cleanup] Killed stale process PID ${pid} on port ${port}`);
      } catch (_) {
        // Process may have already exited
      }
    }
    if (pids.size > 0) {
      // Give OS a moment to free the port
      execSync('ping -n 2 127.0.0.1 > nul', { stdio: 'pipe' });
    }
  } catch (_) {
    // No process found on port — good to go
  }
}

const start = async () => {
  // Auto-kill any stale process on the port before binding
  killPortProcess(PORT);

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`CleanLedger API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logMistralStartup();
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received - shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    // Force kill after 5 seconds if graceful fails
    setTimeout(() => process.exit(1), 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
