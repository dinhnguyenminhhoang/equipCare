"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const NotificationService = require("../services/notification.service");
const { asyncHandler } = require("../helpers/asynchandler");

class NotificationController {
  getNotifications = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get notifications successfully!",
      data: await NotificationService.getNotifications(req.user.userId, req.query),
    }).send(res);
  });

  getNotificationById = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get notification successfully!",
      data: await NotificationService.getNotificationById(req.params.id, req.user.userId),
    }).send(res);
  });

  markAsRead = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Notification marked as read successfully!",
      data: await NotificationService.markAsRead(req.params.id, req.user.userId),
    }).send(res);
  });

  markAllAsRead = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "All notifications marked as read successfully!",
      data: await NotificationService.markAllAsRead(req.user.userId),
    }).send(res);
  });

  deleteNotification = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Notification deleted successfully!",
      data: await NotificationService.deleteNotification(req.params.id, req.user.userId),
    }).send(res);
  });

  getUnreadCount = asyncHandler(async (req, res, next) => {
    new SuccessResponse({
      message: "Get unread count successfully!",
      data: await NotificationService.getUnreadCount(req.user.userId),
    }).send(res);
  });
}

module.exports = new NotificationController();