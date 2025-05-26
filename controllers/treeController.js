const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Tree = require('../models/Tree');
const User = require('../models/User');

const getTrees = async (req, res) => {
  try {
    const image = req.file;
    const userId = req.body.id;
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);


    if (!image) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image.path, {
      folder: `trees/${userId}`,
      use_filename: true,
      unique_filename: false,
    });


    const imageUrl = result.secure_url;
    fs.unlinkSync(image.path); // Cleanup temp file
    console.log(imageUrl);

    // 🔹 Call Python model
    const pythonProcess = spawn('python', [path.join(__dirname, '../Plant-species-model/main.py'), imageUrl]);

    pythonProcess.on('close', async (code) => {
      console.log(`Python script exited with code ${code}`);

      try {
        const outputFilePath = path.join(__dirname, '../output.json');
        if (!fs.existsSync(outputFilePath)) {
          throw new Error("Output file missing.");
        }

        const pythonOutput = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
        const { tree_name, stage_name } = pythonOutput;
        console.log("Output", pythonOutput);

        let newStage = 1;
        if (stage_name === 'Seedling') newStage = 1;
        else if (stage_name === 'Sapling') newStage = 2;
        else if (stage_name === 'Juvenile') newStage = 3;
        else if (stage_name === 'Decline') newStage = 4;

        const existingTree = await Tree.findOne({
          userId,
          'geolocation.latitude': latitude,
          'geolocation.longitude': longitude
        });

        let message = '';
        let updatedTree = null;

        if (existingTree) {
          const currentStage = parseInt(existingTree.stage);

          if (newStage > currentStage) {
            existingTree.stage = newStage.toString();
            existingTree.species = tree_name;
            existingTree.imageUrl = imageUrl;
            await existingTree.save();

            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");

            if (newStage === 2) user.balance += 10;
            else if (newStage >= 3) user.balance += 20;

            await user.save();
            message = 'Tree stage updated and user balance increased';
            updatedTree = existingTree;
          } else {
            message = 'Tree already exists with same or higher stage, no update made';
            updatedTree = existingTree;
          }
        } else {
          const newTree = new Tree({
            userId,
            species: tree_name,
            stage: "1",
            imageUrl,
            geolocation: { latitude, longitude }
          });

          await newTree.save();

          const user = await User.findById(userId);
          if (!user) throw new Error("User not found");
          user.balance += 5;
          await user.save();

          message = 'New tree added and balance increased by 5';
          updatedTree = newTree;
        }

        // Cleanup
        fs.unlinkSync(outputFilePath);
        res.json({ message, tree: updatedTree });

      } catch (error) {
        console.error('Error parsing Python output:', error.message);
        res.status(500).json({ message: 'Error processing prediction' });
      }
    });

  } catch (error) {
    console.error('Error scanning tree:', error.message);
    res.status(500).json({ message: 'Error scanning tree', error: error.message });
  }
};

const getUserScannedTrees = async (req, res) => {
  const { userId } = req.params;
  try {
    const trees = await Tree.find({ userId }).exec();
    if (!trees || trees.length === 0) {
      return res.status(404).json({ message: 'No scanned trees found for this user' });
    }
    res.json(trees);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTrees, getUserScannedTrees };
