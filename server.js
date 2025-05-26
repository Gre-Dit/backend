const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const treeRoutes = require('./routes/tree');
const walletRoutes = require('./routes/wallet');
const app = express();
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config();


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

app.use(express.json()); // Parse JSON bodies

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/wallet', walletRoutes);

app.get("/", (req,res) => {
  res.send("Listening!!!!!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
