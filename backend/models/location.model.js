const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  governorate: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  cities: [{
    type: String,
    required: true,
    trim: true
  }]
});

module.exports = mongoose.model('Location', locationSchema, 'locations');