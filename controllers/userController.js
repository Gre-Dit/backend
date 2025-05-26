// controllers/UserController.js
require('dotenv').config();
const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Step 1: Get wallet (GET)
    const walletRes = await axios.get(
      'https://api.tatum.io/v3/polygon/wallet',
      {
        headers: {
          'x-api-key': process.env.TATUM_API_KEY
        }
      }
    );

    const { mnemonic, xpub } = walletRes.data;

    // Step 2: Get address
    const addressRes = await axios.get(
      `https://api.tatum.io/v3/polygon/address/${xpub}/0`,
      {
        headers: {
          'x-api-key': process.env.TATUM_API_KEY
        }
      }
    );

    const walletAddress = addressRes.data.address;

    // Step 3: Create user in DB
    const user = await User.create({
      username: username,
      password: password, // ⚠️ Hash in production
      walletAddress: walletAddress,
      mnemonic: mnemonic,
      // xpub,
    });

    // Step 4: Generate JWT token
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, walletAddress });

  } catch (err) {
    console.error('Registration Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, id: user.id, walletAddress: user.walletAddress });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Profile
const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: user.username,
      walletAddress: user.walletAddress,
      stageUnlocked: user.stageUnlocked,
      balance: user.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
