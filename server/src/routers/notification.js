"use strict";
const express = require("express");
const { authentication } = require("../auth/authUtils");
const notificationController = require("../controllers/notification.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

router.get(
  "/notifications",
  authentication,
  asyncHandler(notificationController.getNotifications)
);
router.get(
  "/notifications/unread-count",
  authentication,
  asyncHandler(notificationController.getUnreadCount)
);
router.get(
  "/notifications/:id",
  authentication,
  asyncHandler(notificationController.getNotificationById)
);
router.patch(
  "/notifications/:id/read",
  authentication,
  asyncHandler(notificationController.markAsRead)
);
router.patch(
  "/notifications/read-all",
  authentication,
  asyncHandler(notificationController.markAllAsRead)
);
router.delete(
  "/notifications/:id",
  authentication,
  asyncHandler(notificationController.deleteNotification)
);

module.exports = router;
