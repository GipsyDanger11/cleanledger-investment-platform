const mongoose = require('mongoose');
const { Readable } = require('stream');

let gfsBucket;

function getGridFSBucket() {
  if (!gfsBucket) {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
  }
  return gfsBucket;
}

/**
 * Uploads a buffer to GridFS
 * @param {Buffer} buffer The file buffer
 * @param {string} filename Original filename
 * @param {string} contentType Mime type
 * @returns {Promise<string>} The ObjectId string of the uploaded file
 */
function uploadBufferToGridFS(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      const readableTrackStream = new Readable();
      readableTrackStream.push(buffer);
      readableTrackStream.push(null);

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: contentType,
      });

      readableTrackStream.pipe(uploadStream);

      uploadStream.on('error', (err) => reject(err));
      uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves a stream from GridFS
 * @param {string} id ObjectId string
 * @returns {mongoose.mongo.GridFSBucketReadStream}
 */
function downloadStreamFromGridFS(id) {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(id));
}

module.exports = {
  getGridFSBucket,
  uploadBufferToGridFS,
  downloadStreamFromGridFS
};
