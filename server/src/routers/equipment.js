"use strict";
const express = require("express");
const { authentication, adminAuthentication } = require("../auth/authUtils");
const equipmentController = require("../controllers/equipment.controller");
const { asyncHandler } = require("../helpers/asynchandler");
const router = express.Router();
// Public routes (with authentication)
router.get(
  "/",
  authentication,
  asyncHandler(equipmentController.getEquipments)
);
router.get(
  "/statistics",
  authentication,
  asyncHandler(equipmentController.getEquipmentStatistics)
);
router.get(
  "/due-maintenance",
  authentication,
  asyncHandler(equipmentController.getEquipmentsDueForMaintenance)
);
router.get(
  "/:id",
  authentication,
  asyncHandler(equipmentController.getEquipmentById)
);
router.get(
  "/:id/maintenance-history",
  authentication,
  asyncHandler(equipmentController.getMaintenanceHistory)
);
router.get(
  "/:id/repair-history",
  authentication,
  asyncHandler(equipmentController.getRepairHistory)
);

// Admin routes
router.post(
  "/",
  adminAuthentication,
  asyncHandler(equipmentController.createEquipment)
);
router.put(
  "/:id",
  adminAuthentication,
  asyncHandler(equipmentController.updateEquipment)
);
router.delete(
  "/:id",
  adminAuthentication,
  asyncHandler(equipmentController.deleteEquipment)
);
router.patch(
  "/:id/operating-hours",
  authentication,
  asyncHandler(equipmentController.updateOperatingHours)
);

module.exports = router;
