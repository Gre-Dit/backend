const express = require('express');
const multer = require('multer');
// const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {getTrees, getUserScannedTrees } = require('../controllers/treeController');

const router = express.Router();

// Route to upload the image to Cloudinary and save tree data
router.post('/', upload.single('image'), getTrees);

router.get('/user/:userId', getUserScannedTrees);

module.exports = router;
