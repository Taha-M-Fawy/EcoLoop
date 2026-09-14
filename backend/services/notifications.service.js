const Notification = require("../models/notifications.model.js");

const createNotificationService = (data) => {
    return Notification.create(data);
};

const getNotificationsService = () => {
    return Notification.find();
};

const getNotificationByIdService = (id) => {
    return Notification.findById(id);
};

const updateNotificationService = (id, data) => {
    return Notification.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
    });
};

const deleteNotificationService = (id) => {
  return Notification.findByIdAndDelete(id);
};

module.exports = {
    createNotificationService,
    getNotificationsService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService
};