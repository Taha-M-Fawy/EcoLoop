const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  location: {
    city: String,
    country: String
  },
  bio: { type: String, default: '' }
}, { 
  timestamps: true,
  collection: 'users'
});

module.exports = mongoose.model('User', userSchema);