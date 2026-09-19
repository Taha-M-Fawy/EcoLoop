const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'ecoloop_super_secret_key_2026',
    { expiresIn: '30d' }
  );
};

const registerUser = async (userData) => {
  const { username, email, phone, password } = userData;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('البريد الإلكتروني مستخدم بالفعل');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    phone,
    password: hashedPassword,
    role: 'user'
  });

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id, user.role)
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('بيانات الدخول غير صحيحة');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('بيانات الدخول غير صحيحة');
  }

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id, user.role)
  };
};

const fetchAllUsers = async () => {
  return await User.find({}).select('-password');
};

const fetchUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const updateExistingUser = async (id, updateData) => {
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  return await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
};

const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = {
  registerUser,
  loginUser,
  fetchAllUsers,
  fetchUserById,
  updateExistingUser,
  deleteUserById
};