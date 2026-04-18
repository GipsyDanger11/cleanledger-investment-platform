const path = require('path');
const multer = require('multer');

const storage = multer.memoryStorage();

function registrationFileFilter(_req, file, cb) {
  const ext = (path.extname(file.originalname || '') || '').toLowerCase();
  const okExt = ['.pdf', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'].includes(ext);
  const mt = (file.mimetype || '').toLowerCase();
  const okMt =
    mt === 'application/pdf' ||
    mt === 'application/vnd.ms-powerpoint' ||
    mt === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mt.startsWith('image/') ||
    mt === 'application/octet-stream';
  if (okExt || okMt) cb(null, true);
  else cb(new Error('Only PDF, PowerPoint, or Image files are allowed.'));
}

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: registrationFileFilter,
});
