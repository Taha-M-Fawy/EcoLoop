const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  getNotificationById,
  updateNotification,
  deleteNotification
} = require("../controller/notifications.controller.js");

router.post('/', createNotification);
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/read-all', protect, markAllAsRead);
router.put('/read-all', protect, markAllAsRead);
router.get('/:id', protect, getNotificationById);
router.put('/:id', protect, updateNotification);
router.delete('/:id', protect, deleteNotification);

module.exports = router;