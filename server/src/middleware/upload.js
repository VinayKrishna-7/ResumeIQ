const multer = require('multer');

// Store file in memory buffer for immediate parsing
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
];

const fileFilter = (req, file, cb) => {
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  const isAllowedExt = ['pdf', 'docx', 'doc'].includes(fileExt);
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file format. Only PDF and DOCX documents are supported.');
    err.code = 'INVALID_FILE_TYPE';
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

module.exports = upload;
