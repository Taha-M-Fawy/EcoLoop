const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/', userController.getUsers);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;