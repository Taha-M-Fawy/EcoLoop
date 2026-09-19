const Notification = require("../models/notifications.model.js");

const createNotificationService = (data) => {
    return Notification.create(data);
};

const getNotificationsService = (userId) => {

    return Notification.find({ userId });

};

const getNotificationByIdService = (id, userId) => {
    return Notification.findOne({
        _id: id,
        userId: userId
    });
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
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService
};