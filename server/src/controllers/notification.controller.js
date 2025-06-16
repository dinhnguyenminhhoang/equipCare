"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  getNotifications = async (req, res, next) => {
    new SuccessResponse({
      message: "Get notifications successfully!",
      data: await NotificationService.getNotifications(
        req.user.userId,
        req.query
      ),
    }).send(res);
  };

  getNotificationById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get notification successfully!",
      data: await NotificationService.getNotificationById(
        req.params.id,
        req.user.userId
      ),
    }).send(res);
  };

  markAsRead = async (req, res, next) => {
    new SuccessResponse({
      message: "Notification marked as read successfully!",
      data: await NotificationService.markAsRead(
        req.params.id,
        req.user.userId
      ),
    }).send(res);
  };

  markAllAsRead = async (req, res, next) => {
    new SuccessResponse({
      message: "All notifications marked as read successfully!",
      data: await NotificationService.markAllAsRead(req.user.userId),
    }).send(res);
  };

  deleteNotification = async (req, res, next) => {
    new SuccessResponse({
      message: "Notification deleted successfully!",
      data: await NotificationService.deleteNotification(
        req.params.id,
        req.user.userId
      ),
    }).send(res);
  };

  getUnreadCount = async (req, res, next) => {
    new SuccessResponse({
      message: "Get unread count successfully!",
      data: await NotificationService.getUnreadCount(req.user.userId),
    }).send(res);
  };
}

module.exports = new NotificationController();
