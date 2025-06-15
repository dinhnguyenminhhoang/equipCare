"use strict";
const express = require("express");
const { authentication } = require("../auth/authUtils");
const notificationController = require("../controllers/notification.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

router.get(
  "/",
  authentication,
  asyncHandler(notificationController.getNotifications)
);
router.get(
  "/unread-count",
  authentication,
  asyncHandler(notificationController.getUnreadCount)
);
router.get(
  "/:id",
  authentication,
  asyncHandler(notificationController.getNotificationById)
);
router.patch(
  "/:id/read",
  authentication,
  asyncHandler(notificationController.markAsRead)
);
router.patch(
  "/read-all",
  authentication,
  asyncHandler(notificationController.markAllAsRead)
);
router.delete(
  "/:id",
  authentication,
  asyncHandler(notificationController.deleteNotification)
);

module.exports = router;
