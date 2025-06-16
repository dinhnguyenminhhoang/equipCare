"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const userController = require("../controllers/user.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

// Admin routes for user management
router.get("/users", adminAuthentication, asyncHandler(userController.getUsers));
router.get(
  "/users/:id",
  adminAuthentication,
  asyncHandler(userController.getUserById)
);
router.put(
  "/users/:id",
  adminAuthentication,
  asyncHandler(userController.updateUser)
);
router.delete(
  "/users/:id",
  adminAuthentication,
  asyncHandler(userController.deleteUser)
);
router.patch(
  "/users/:id/toggle-status",
  adminAuthentication,
  asyncHandler(userController.toggleUserStatus)
);

// Profile routes
router.get(
  "/users/profile/me",
  authentication,
  asyncHandler(userController.getProfile)
);
router.put(
  "/users/profile/me",
  authentication,
  asyncHandler(userController.updateProfile)
);
router.put(
  "/users/profile/change-password",
  authentication,
  asyncHandler(userController.changePassword)
);

module.exports = router;
