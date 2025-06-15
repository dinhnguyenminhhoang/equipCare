"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const userController = require("../controllers/user.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

// Admin routes for user management
router.get("/", adminAuthentication, asyncHandler(userController.getUsers));
router.get(
  "/:id",
  adminAuthentication,
  asyncHandler(userController.getUserById)
);
router.put(
  "/:id",
  adminAuthentication,
  asyncHandler(userController.updateUser)
);
router.delete(
  "/:id",
  adminAuthentication,
  asyncHandler(userController.deleteUser)
);
router.patch(
  "/:id/toggle-status",
  adminAuthentication,
  asyncHandler(userController.toggleUserStatus)
);

// Profile routes
router.get(
  "/profile/me",
  authentication,
  asyncHandler(userController.getProfile)
);
router.put(
  "/profile/me",
  authentication,
  asyncHandler(userController.updateProfile)
);
router.put(
  "/profile/change-password",
  authentication,
  asyncHandler(userController.changePassword)
);

module.exports = router;
