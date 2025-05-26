const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  species: {
    type: String,
    required: true,
  },
  stage: {
    type: String, // Represents growth stage (1-5)
    required: true,
  },
  // location: {
  //   type: String,
  //   required: true,
  // },
  imageUrl: {
    type: String,
    required: true,
  },
  geolocation: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
});

module.exports = mongoose.model('Tree', treeSchema);
