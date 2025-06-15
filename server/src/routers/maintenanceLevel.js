"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const { asyncHandler } = require("../helpers/asynchandler");
const maintenanceLevelController = require("../controllers/maintenanceLevel.controller");
const router = express.Router();

// Public routes (with authentication)
router.get(
  "/",
  authentication,
  asyncHandler(maintenanceLevelController.getMaintenanceLevels)
);
router.get(
  "/:id",
  authentication,
  asyncHandler(maintenanceLevelController.getMaintenanceLevelById)
);

// Admin routes
router.post(
  "/",
  adminAuthentication,
  asyncHandler(maintenanceLevelController.createMaintenanceLevel)
);
router.put(
  "/:id",
  adminAuthentication,
  asyncHandler(maintenanceLevelController.updateMaintenanceLevel)
);
router.delete(
  "/:id",
  adminAuthentication,
  asyncHandler(maintenanceLevelController.deleteMaintenanceLevel)
);

module.exports = router;
