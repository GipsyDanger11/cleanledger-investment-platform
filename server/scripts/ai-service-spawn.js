/**
 * Starts the Flask JARVIS service (server/ai_service/app.py) with a known Python interpreter.
 * Set AI_SERVICE_PYTHON in server/.env (absolute path to python.exe).
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..');
const envPath = path.join(serverDir, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath, override: true });
}

const pythonExe = (process.env.AI_SERVICE_PYTHON || 'python').trim();
const appPy = path.join(serverDir, 'ai_service', 'app.py');

if (!fs.existsSync(appPy)) {
  console.error('[ai-service] Missing', appPy);
  process.exit(1);
}

const child = spawn(pythonExe, [appPy], {
  cwd: serverDir,
  stdio: 'inherit',
  env: { ...process.env },
  windowsHide: true,
});

child.on('error', (err) => {
  console.error('[ai-service] Could not spawn Python:', err.message);
  console.error(
    '[ai-service] Set AI_SERVICE_PYTHON in server/.env to your Python 3.10+ executable.',
  );
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
