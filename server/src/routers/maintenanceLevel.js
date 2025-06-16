"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const { asyncHandler } = require("../helpers/asynchandler");
const maintenanceLevelController = require("../controllers/maintenanceLevel.controller");
const router = express.Router();

// Public routes (with authentication)
router.get(
  "/maintenance-levels",
  authentication,
  asyncHandler(maintenanceLevelController.getMaintenanceLevels)
);
router.get(
  "/maintenance-levels/:id",
  authentication,
  asyncHandler(maintenanceLevelController.getMaintenanceLevelById)
);

// Admin routes
router.post(
  "/maintenance-levels",
  adminAuthentication,
  asyncHandler(maintenanceLevelController.createMaintenanceLevel)
);
router.put(
  "/maintenance-levels/:id",
  adminAuthentication,
  asyncHandler(maintenanceLevelController.updateMaintenanceLevel)
);
router.delete(
  "/maintenance-levels/:id",
  adminAuthentication,
  asyncHandler(maintenanceLevelController.deleteMaintenanceLevel)
);

module.exports = router;
