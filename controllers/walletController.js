// controllers/walletController.js
const User = require("../models/User");

const getWalletBalance = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ balance: user.balance || 0 });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getWalletBalance };
