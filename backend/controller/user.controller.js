const userService = require('../services/user.service');

const register = async (req, res, next) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'بيانات الدخول غير صحيحة' });
  }
};

const logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.fetchUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const isSelfOrAdmin = req.user && (
      req.user.role === 'admin' ||
      req.user.id?.toString() === req.params.id ||
      req.user._id?.toString() === req.params.id
    );

    if (isSelfOrAdmin) {
      return res.status(200).json(user);
    }

    // Return safe public profile for community interaction
    const publicProfile = {
      _id: user._id,
      id: user._id,
      username: user.username,
      name: user.username,
      phone: user.phone,
      phoneNumber: user.phone,
      profileImage: user.profileImage,
      location: user.location,
      bio: user.bio,
      createdAt: user.createdAt
    };

    res.status(200).json(publicProfile);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (
      req.user.role !== 'admin' &&
      req.user.id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        message: 'غير مسموح لك بتعديل بيانات هذا المستخدم'
      });
    }

    const updateData = { ...req.body };

    delete updateData.role;
    delete updateData._id;

    const updatedUser = await userService.updateExistingUser(
      req.params.id,
      updateData
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await userService.deleteUserById(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};