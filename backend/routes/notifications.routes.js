const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification
} = require("../controller/notifications.controller.js");

router.post('/', createNotification)
//router.get('/:id', getNotificationById)
router.get('/', protect, getNotifications)
router.get('/:id', protect, getNotificationById)
router.put('/:id', protect, updateNotification)
router.delete('/:id', protect, deleteNotification)
module.exports = router;