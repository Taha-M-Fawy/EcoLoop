const {
    createNotificationService,
    getNotificationsService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService
} = require("../services/notifications.service.js");

//*---CREATE NOTIFICATION---
const createNotification = (req, res) => {
    const { userId, message, type } = req.body;

    createNotificationService({ userId, message, type })
    .then((notification) => {
        res.status(201).json(notification);
    })
    .catch((error) => {
        res.status(400).json({ message: error.message });
    });
};

//*---GET ALL NOTIFICATIONS---
const getNotifications = (req, res) => {
    getNotificationsService()
    .then((notifications) => {
        res.status(200).json(notifications);
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });
};

//*---GET SINGLE NOTIFICATION---
const getNotificationById = (req, res) => {
    getNotificationByIdService(req.params.id)
    .then((notification) => {
        if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json(notification);
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });
};

//*---UPDATE NOTIFICATION---
const updateNotification = (req, res) => {
    updateNotificationService(req.params.id, req.body)
    .then((notification) => {
        if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json(notification);
    })
    .catch((error) => {
        res.status(400).json({ message: error.message });
    });
};

//*---DELETE NOTIFICATION---
const deleteNotification = (req, res) => {
    deleteNotificationService(req.params.id)
    .then((notification) => {
        if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json({ message: "Notification deleted successfully" });
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });
};

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification
};