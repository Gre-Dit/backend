const multer = require('multer');
const path = require('path');

// Multer storage configuration to save files in 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Saving files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Generate a unique file name using timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Save with original extension
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
