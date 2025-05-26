// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const { getWalletBalance } = require("../controllers/walletController");

// GET /api/wallet/:userId
router.get("/:userId", getWalletBalance);

module.exports = router;
