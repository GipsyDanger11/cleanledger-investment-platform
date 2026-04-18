const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads', 'reg');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 11)}${ext}`);
  },
});

function registrationFileFilter(_req, file, cb) {
  const ext = (path.extname(file.originalname || '') || '').toLowerCase();
  const okExt = ['.pdf', '.ppt', '.pptx'].includes(ext);
  const mt = (file.mimetype || '').toLowerCase();
  const okMt =
    mt === 'application/pdf' ||
    mt === 'application/vnd.ms-powerpoint' ||
    mt === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mt === 'application/octet-stream';
  if (okExt || okMt) cb(null, true);
  else cb(new Error('Only PDF and PowerPoint files are allowed for registration uploads.'));
}

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: registrationFileFilter,
});
