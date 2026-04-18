const { uploadBufferToGridFS, downloadStreamFromGridFS } = require('../utils/gridfs');
const mongoose = require('mongoose');

/**
 * POST /api/v1/uploads/registration
 */
exports.uploadRegistrationDocs = async (req, res) => {
  try {
    const files = req.files || {};
    const urls = {};

    const uploadIfPresent = async (fieldName) => {
      if (files[fieldName]?.[0]) {
        const file = files[fieldName][0];
        const id = await uploadBufferToGridFS(file.buffer, file.originalname, file.mimetype);
        urls[`${fieldName}Url`] = `/api/v1/uploads/gridfs/${id}`;
      }
    };

    await Promise.all([
      uploadIfPresent('businessRegistration'),
      uploadIfPresent('gstNumber'),
      uploadIfPresent('founderId'),
      uploadIfPresent('pitchDeck'),
      uploadIfPresent('bankStatement')
    ]);

    res.json({ success: true, urls });
  } catch (err) {
    console.error('GridFS Upload Error:', err);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
};

/**
 * GET /api/v1/uploads/gridfs/:id
 */
exports.streamGridFSFile = async (req, res) => {
  try {
    const bucket = require('../utils/gridfs').getGridFSBucket();
    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }

    const _id = new mongoose.Types.ObjectId(id);
    const files = await bucket.find({ _id }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.set('Content-Type', files[0].contentType);
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    const stream = downloadStreamFromGridFS(id);
    stream.pipe(res);
    stream.on('error', (err) => {
      console.error('GridFS download error:', err);
      res.status(500).end();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching file' });
  }
};
