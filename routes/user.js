const express = require('express');
const {registerUser, loginUser, getUserProfile} = require('../controllers/userController');

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);

// Get Profile
router.get('/:userId', getUserProfile);

module.exports = router;
