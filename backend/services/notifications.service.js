const Notification = require("../models/notifications.model.js");

const createNotificationService = (data) => {
    return Notification.create(data);
};

const getNotificationsService = (userId) => {
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
};

const getUnreadCountService = (userId) => {
    if (!userId) return Promise.resolve(0);
    return Notification.countDocuments({ userId, isRead: false });
};

const markAllNotificationsAsReadService = (userId) => {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

const getNotificationByIdService = (id, userId) => {
    return Notification.findOne({
        _id: id,
        userId: userId
    }).lean();
};

const updateNotificationService = (id, userId, data) => {
    return Notification.findOneAndUpdate(
        {
            _id: id,
            userId: userId
        },
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteNotificationService = (id, userId) => {
  return Notification.findOneAndDelete({
    _id: id,
    userId: userId
  });
};

module.exports = {
    createNotificationService,
    getNotificationsService,
    getUnreadCountService,
    markAllNotificationsAsReadService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService
};