"use strict";
const express = require("express");
const { authentication } = require("../auth/authUtils");
const dashboardController = require("../controllers/dashboard.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();

router.get(
  "/overview",
  authentication,
  asyncHandler(dashboardController.getOverview)
);
router.get(
  "/maintenance-summary",
  authentication,
  asyncHandler(dashboardController.getMaintenanceSummary)
);
router.get(
  "/repair-summary",
  authentication,
  asyncHandler(dashboardController.getRepairSummary)
);
router.get(
  "/equipment-status",
  authentication,
  asyncHandler(dashboardController.getEquipmentStatus)
);
router.get(
  "/material-alerts",
  authentication,
  asyncHandler(dashboardController.getMaterialAlerts)
);
router.get(
  "/recent-activities",
  authentication,
  asyncHandler(dashboardController.getRecentActivities)
);

module.exports = router;
